// User Portal Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrUser = require('../../FabricHelperUser');
const User = require('../../models/user');

//All routes have prefix '/user'
router.get('/login', (req, res) => {
    res.render('user/user-login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/login'
}), (req, res) => {});

router.get('/', (req, res) => {
    res.render('user/userPortal', {
        permission: {}
    });
});

router.post('/givepermission', (req, res) => {
    let DoctorID = req.body.doctorID;
    User.findOne({
        username: req.user.username
    }, function (err, doc) {
        let user = doc;
        user.permission.push(DoctorID);
        user.save();
        console.log(user);
        res.render('user/userPortal', {
            permission: {}
        });
    });
});

router.get('/revokepermission', (req, res) => {
    res.render('user/userPortal', {
        permission: {}
    });
})

router.post('/revokepermission', (req, res) => {
    let DoctorID = req.body.doctorID;
    User.findOne({
        username: req.user.username
    }, function (err, user) {
        console.log(user);
        for (let i = 0; i < user.permission.length; i++) {
            if (user.permission[i] === DoctorID) {
                user.permission.splice(i, 1);
                user.save()
            } else {
                console.log('Not found');
            }
        }
        console.log(user);
        res.redirect('/');
    });
});

router.get('/getpermission', (req, res) => {
    res.render('user/userPortal', {
        permission: {}
    });
});

router.post('/getpermission', (req, res) => {
    User.findOne({
        username: req.user.username
    }, function (err, found) {
        let permission = found.toJSON();
        console.log(permission);
        permission.organisation = 'Fortis Hospital'
        res.render('user/userPortal', {
            permission: permission
        });
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