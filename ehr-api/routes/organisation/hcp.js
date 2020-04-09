//Health Care Provider Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrHCP = require('../../FabricHelper/FabricHelperHCP');

//All routes have prefix '/organisation/healthcareprovider'
app.get('/login', function(req, res) {
    res.render('hcplogin');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {});


app.get('/', function(req, res) {
    res.render('hcpPortal', { details: {} });
});

app.get('/getreport', function(req, res) {
    res.render('hcpPortal', { details: {} });
})
app.post('/getreport', function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getReport(req, res, doc);
});

app.get('/getmedicalrecord', function(req, res) {
    res.render('hcpPortal', { details: {} });
});
app.post('/getmedicalrecord', function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        'medicalID': medicalID
    }
    ehrHCP.getRecord(req, res, doc);
});

app.get('/getprescription', function(req, res) {
    res.render('hcpPortal', { details: {} });
});
app.post('/getprescription', function(req, res) {
    var medicalID = req.body.medicalID
    var medicineID = medicalID + '0M';
    var doc = {
        'medicalID': medicineID
    }
    ehrHCP.getMedicineReport(req, res, doc);
});
app.get('/getprescriptionrecord', function(req, res) {
    res.render('hcpPortal', { details: {} });
});
app.post('/getprescriptionrecord', function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M';
    var doc = {
        'medicalID': medicineID
    }
    ehrHCP.getMedicineRecord(req, res, doc);
});

module.exports = router;
