// User Portal Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrUser = require('../FabricHelper/FabricHelperUser');
const User = require('../models/user');

//All routes have prefix '/organsation/clinician'
app.get('/login', function(req, res) {
    res.render('userPortalLogin');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {});

app.get('/', function(req, res) {
    res.render('userPortal', { permission: {} });
});


app.post('/givepermission', function(req, res) {
    let DoctorID = req.body.doctorID;
    let MedicalID = req.body.medicalID;
    User.findOne({ username: DoctorID }, function(err, foundOrg) {
        let org = foundOrg;
        org.permission.push(MedicalID);
        org.save();
        console.log(org);
        res.render('userPortal', { permission: {} });
    });
});

app.get('/revokepermission', function(req, res) {
    res.render('userPortal', { permission: {} });
})

app.post('/revokepermission', function(req, res) {
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

app.get('/getpermission', function(req, res) {
    res.render('userPortal', { permission: {} });
});

app.post('/getpermission', function(req, res) {
    User.findOne({ username: 'cliniciantest' }, function(err, found) {
        let permission = found.toJSON();
        console.log(permission);
        permission.organisation = 'Fortis Hospital'
        res.render('userPortal', { permission: permission });
    });
});

app.get('/record', function(req, res) {
    res.render('userPortal');
});

app.post('/record', function(req, res) {
    let medicalID = req.body.medicalID;
    let doc = {
        'medicalID': medicalID
    }
    ehrUser.getRecord(req, res, doc);
});

module.exports = router;
