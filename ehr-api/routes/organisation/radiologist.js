//Radiologist Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrRadiologist = require('../../FabricHelper/FabricHelperRadiologist');

//All routes have prefix '/organisation/radiologist'
router.get('/login', function(req, res) {
    res.render('org-login', {org: 'radiologist'});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {});

router.get('/', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});


router.get('/medicalID', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/medicalID', function(req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrRadiologist.getReport(req, res, doc);
});

router.get('/addreport', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/addreport', function(req, res) {
    let Diagnosis = req.body.diagnoses;
    let report = Diagnosis;
    let links = req.body.links;
    let doc = {
        'medicalID': MedicalID,
        'report': report,
        'links': links
    }
    ehrRadiologist.addrLReport(req, res, doc);
});

router.get('/getreport', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/getreport', function(req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrRadiologist.getReport(req, res, doc);
});

router.get('/addprescription', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/addprescription', function(req, res) {
    let medicalID = req.body.medicalID;
    let medicineID = medicalID + '0M'
    let prescription = req.body.prescription;
    let doc = {
        'medicalID': medicineID,
        'prescription': prescription
    }
    ehrRadiologist.addMedicineReport(req, res, doc);
});

router.get('/getprescription', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/getprescription', function(req, res) {
    let medicalID = req.body.medicalID;
    let medicineID = medicalID + '0M';
    let doc = {
        'medicineID': medicineID
    }
    ehrRadiologist.getMedicineRecord(req, res, doc);
});

router.get('/reporthistory', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/reporthistory', function(req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrRadiologist.getRecord(req, res, doc);
});

router.get('/medicinehistory', function(req, res) {
    res.render('radioLogistPortal', { details: {} });
});

router.post('/medicinehistory', function(req, res) {
    let medicalID = req.body.medicalID;
    let medicineID = medicalID + '0M';
    let doc = {
        'medicalID': medicineID
    }
    ehrRadiologist.getMedicineRecord(req, res, doc);
});

module.exports = router;
