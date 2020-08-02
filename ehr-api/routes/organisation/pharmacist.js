//Pharmacist Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrPharmacist = require('../../FabricHelperPharmacist');
const User = require('../../models/user');
const keccak256 = require('keccak256');


//All routes have prefix '/organisation/pharmacist'

router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'pharmacist'
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/pharmacist',
    failureRedirect: '/organisation/pharmacist/login'
}), function (req, res) {});

router.use((req, res, next) => {
    if (req.user.type == 'pharmacist')
        next();
    else
        res.redirect('/');
});

router.get('/', function (req, res) {
    res.render('org/pharmacistPortal', {
        details: {},
        error: null
    });
});

router.get('/getprescription', function (req, res) {
    res.render('org/pharmacistPortal', {
        details: {},
        error: null
    });
});

router.post('/getprescription', function (req, res) {
    let hash = keccak256(req.body.medicalID).toString('hex');
    let MedicalID = hash;
    let doc = {
        'medicineID': MedicalID
    }
    User.findOne({
        _id: MedicalID
    }, function (err, found) {
        if (err || !found)
            return res.render('org/pharmacistPortal', {
                details: {},
                error: res.__('messages.error'),
            })
        let perm = found.permission.indexOf(req.user._id) + 1;
        if (perm) {
            ehrPharmacist.getMedicineReport(req, res, doc);
        } else {
            res.render("org/pharmacistPortal", {
                details: {},
                error: res.__('messages.noAccess')
            })
        }
    });
});

router.post('/getprescriptionhistory', function (req, res) {
    User.findOne({
        _id: keccak256(req.body.medicalID).toString('hex')
    }, function (err, found) {
        let perm = found.permission.indexOf(req.user._id) + 1;
        if (perm) {
            ehrPharmacist.getMedicineRecord(req, res);
        } else {
            res.render("org/pharmacistPortal", {
                details: {},
                error: res.__('messages.noAccess')
            })
        }
    });
});

module.exports = router;