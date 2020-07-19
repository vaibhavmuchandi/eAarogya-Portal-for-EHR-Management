//Clinician Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrClinician = require('../../FabricHelperClinician');
const User = require("../../models/user");

//All routes have prefix '/organsation/clinician'
router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'clinician'
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/clinician',
    failureRedirect: '/login'
}), function (req, res) {});

router.use((req, res, next) => {
    if (req.user.type == 'clinician')
        next();
    else
        res.redirect('/');
});

router.get('/', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});


router.get('/medicalID', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});

router.post('/medicalID', function (req, res) {
    let MedicalID = req.body.medicalID;
    let doc = {
        'medicalID': MedicalID
    }
    User.findOne({
        username: req.user.username
    }, function (err, found) {
        found.permission.forEach(function (perm) {
            if (perm == MedicalID) {
                ehrClinician.getReport(req, res, doc);
            } else {
                console.log('Not allowed')
            }
        });
    });


});


router.get('/addreport', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
})

router.post('/addreport', function (req, res) {
    let MedicalID = req.body.medicalID;
    let allergies = req.body.allergies;
    let symptoms = req.body.symptoms;
    let diagnosis = req.body.diagnoses
    let report = 'Allergies: ' + allergies + ', Symptoms: ' + symptoms + ', Diagnosis: ' + diagnosis;
    let doc = {
        'medicalID': MedicalID,
        'report': report
    }

    ehrClinician.addReport(req, res, doc);
    console.log(MedicalID);

});

router.get('/addprescription', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});

router.post('/addprescription', function (req, res) {
    let medicalID = req.body.medicalID;
    let prescription = req.body.prescription;
    let doc = {
        'medicalID': medicalID,
        'prescription': prescription
    }
    ehrClinician.addMedicineReport(req, res, doc);
});

router.get('/getreport', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});

router.post('/getreport', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    };
    ehrClinician.getReport(req, res, doc);
});

router.get('/getprescription', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});
router.post('/getprescription', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrClinician.getMedicineReport(req, res, doc);
});

router.get('/reporthistory', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});

router.post('/reporthistory', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrClinician.getRecord(req, res, doc);
});

router.get('/medicinehistory', function (req, res) {
    res.render('org/clinicianPortal', {
        details: {},
        history: []
    });
});
router.post('/medicinehistory', function (req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrClinician.getMedicineRecord(req, res, doc)
});

module.exports = router;