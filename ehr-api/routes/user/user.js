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
    failureRedirect: '/user/login'
}), (req, res) => {});

router.get('/', (req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: []
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
            permission: {},
            reports: [],
            prescs: []
        });
    });
});

router.get('/revokepermission', (req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: []
    });
})

router.post('/revokepermission', (req, res) => {
    let DoctorID = req.body.doctorID;
    User.findOne({
        username: req.user.username
    }, function (err, user) {
        let idx = user.permission.indexOf(DoctorID);
        if (idx != -1) {
            user.permission.splice(i, 1);
            user.save()
        } else {
            console.log('Not found');
        }
        res.redirect('/user');
    });
});

router.get('/getpermission', (req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: []
    });
});

router.post('/getpermission', (req, res) => {
    User.findOne({
            username: req.user.username
        }, 'permission')
        .populate('permission', 'name org type')
        .exec((err, info) => {
            res.render('user/userPortal', {
                permission: info.permission,
                reports: [],
                prescs: []
            });
        })
});

router.get('/reporthistory', (req, res) => {
    res.render('user/userPortal');
});

router.post('/reporthistory', (req, res) => {
    let medicalID = req.user._id;
    let doc = {
        'medicalID': medicalID
    }
    console.log(medicalID);
    ehrUser.getRecord(req, res, doc);
});

router.get('/prescriptionhistory', (req, res) => {
    res.render('user/userPortal');
});

router.post('/prescriptionhistory', (req, res) => {
    let medicalID = req.user._id;
    let doc = {
        'medicalID': medicalID
    }
    ehrUser.getMedicineRecord(req, res, doc);
});

module.exports = router;