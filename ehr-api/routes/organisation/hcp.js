//Health Care Provider routers
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrHCP = require('../../FabricHelperHCP');
const User = require("../../models/user");

//All routers have prefix '/organisation/healthcareprovider'
router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'healthcareprovider'
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/healthcareprovider',
    failureRedirect: '/organisation/healthcareprovider/login'
}), function (req, res) {});

router.use((req, res, next) => {
    if (req.user.type == 'hcp')
        next();
    else
        res.redirect('/');
});

router.get('/', function (req, res) {
    res.render('org/hcpPortal', {
        details: {},
        error: null
    });
});

router.post('/medicalID', function (req, res) {
    let MedicalID = req.body.medicalID;
    let doc = {
        'medicalID': MedicalID
    }
    User.findOne({
        _id: MedicalID
    }, function (err, found) {
        found.permission.forEach(function (perm) {
            if (perm == req.user.username) {
                ehrHCP.getReport(req, res, doc);
            } else {
                res.render("org/hcpPortal", {
                    details: {},
                    error: 'Access denied. Please make sure the user has given you permission'
                })
            }
        });
    });
});

router.get('/getreport', function (req, res) {
    res.render('org/hcpPortal', {
        details: {},
        error: null
    });
})
router.post('/getreport', function (req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getReport(req, res, doc);
});

router.get('/getmedicalrecord', function (req, res) {
    res.render('org/hcpPortal', {
        details: {},
        error: null
    });
});
router.post('/getmedicalrecord', function (req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getRecord(req, res, doc);
});

router.get('/getprescription', function (req, res) {
    res.render('org/hcpPortal', {
        details: {},
        error: null
    });
});
router.post('/getprescription', function (req, res) {
    var medicalID = req.body.medicalID
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getMedicineReport(req, res, doc);
});
router.get('/getprescriptionrecord', function (req, res) {
    res.render('org/hcpPortal', {
        details: {},
        error: null
    });
});

router.post('/getprescriptionrecord', function (req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getMedicineRecord(req, res, doc);
});

module.exports = router;