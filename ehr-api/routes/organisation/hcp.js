//Health Care Provider routers
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrHCP = require('../../FabricHelper/FabricHelperHCP');

//All routers have prefix '/organisation/healthcareprovider'
router.get('/login', function(req, res) {
    res.render('org-login', {org: 'healthcareprovider'});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {});


router.get('/', function(req, res) {
    res.render('org/hcpPortal', { details: {} });
});

router.get('/getreport', function(req, res) {
    res.render('org/hcpPortal', { details: {} });
})
router.post('/getreport', function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getReport(req, res, doc);
});

router.get('/getmedicalrecord', function(req, res) {
    res.render('org/hcpPortal', { details: {} });
});
router.post('/getmedicalrecord', function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getRecord(req, res, doc);
});

router.get('/getprescription', function(req, res) {
    res.render('org/hcpPortal', { details: {} });
});
router.post('/getprescription', function(req, res) {
    var medicalID = req.body.medicalID
    var medicineID = medicalID + '0M';
    var doc = {
        'medicalID': medicineID
    }
    ehrHCP.getMedicineReport(req, res, doc);
});
router.get('/getprescriptionrecord', function(req, res) {
    res.render('org/hcpPortal', { details: {} });
});

router.post('/getprescriptionrecord', function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M';
    var doc = {
        'medicalID': medicineID
    }
    ehrHCP.getMedicineRecord(req, res, doc);
});

module.exports = router;
