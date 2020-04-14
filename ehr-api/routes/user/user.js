// User Portal Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrUser = require('../../FabricHelper/FabricHelperUser');
const User = require('../../models/user');

//All routes have prefix '/user'
router.get('/login', (req, res) => {
    res.render('user/user-login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), (req, res) => {});

router.get('/', (req, res) => {
    res.render('user/userPortal', { permission: {} });
});

router.post('/givepermission', (req, res) => {
    let DoctorID = req.body.doctorID;
    let MedicalID = req.body.medicalID;
    User.findOne({ username: DoctorID }, function(err, foundOrg) {
        let org = foundOrg;
        org.permission.push(MedicalID);
        org.save();
        console.log(org);
        res.render('user/userPortal', { permission: {} });
    });
});

router.get('/revokepermission', (req, res) => {
    res.render('user/userPortal', { permission: {} });
})

router.post('/revokepermission', (req, res) => {
    let MedicalID = req.body.medicalID;
    let DoctorID = req.body.doctorID;
    User.findOne({ username: DoctorID }, function(err, foundOrg) {
        console.log(foundOrg);
        for (let i = 0; i < foundOrg.permission.length; i++) {
            if (foundOrg.permission[i] === MedicalID) {
                foundOrg.permission.splice(i, 1);
                foundOrg.save()
            } else {
                console.log('Not found');
            }
        }
        console.log(foundOrg);
        res.redirect('/');
    });
});

router.get('/getpermission', (req, res) => {
    res.render('user/userPortal', { permission: {} });
});

router.post('/getpermission', (req, res) => {
    User.findOne({ username: 'cliniciantest' }, function(err, found) {
        let permission = found.toJSON();
        console.log(permission);
        permission.organisation = 'Fortis Hospital'
        res.render('user/userPortal', { permission: permission });
    });
});

router.get('/record', (req, res) => {
    res.render('user/userPortal');
});

router.post('/record', (req, res) => {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrUser.getRecord(req, res, doc);
});

module.exports = router;
