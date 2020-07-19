//Pharmacist Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrPharmacist = require('../../FabricHelperPharmacist')

//All routes have prefix '/organisation/pharmacist'

router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'pharmacist'
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/pharmacist',
    failureRedirect: '/login'
}), function (req, res) {});

router.use((req, res, next) => {
    console.log(req.user.type=='pharmacist');
    if(req.user.type=='pharmacist')
        next();
    else 
        res.redirect('/');
});

router.get('/', function (req, res) {
    res.render('org/pharmacistPortal', {
        details: {}
    });
});

router.get('/getprescription', function (req, res) {
    res.render('org/pharmacistPortal', {
        details: {}
    });
});

router.post('/getprescription', function (req, res) {
    let MedicalID = req.body.medicalID;
    let MedicineID = MedicalID + '0M'
    console.log(MedicalID);
    console.log(typeof (MedicalID));
    let doc = {
        'medicineID': MedicineID
    }
    console.log(doc);
    ehrPharmacist.getMedicineReport(req, res, doc);
});

module.exports = router;