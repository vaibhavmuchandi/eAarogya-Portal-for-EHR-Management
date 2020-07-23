//Central Authority Routes
const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator')
const passport = require('passport');
const AadhaarUser = require('../../models/aadhaaruser');
const User = require('../../models/user');
const ehrClinician = require('../../FabricHelperClinician');

//All routes have prefix '/organisation/centauth'
router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'centauth'
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/centauth',
    failureRedirect: '/organisation/centauth/login'
}), function (req, res) {

});

router.use((req, res, next) => {
    if (req.user.type == 'centauth')
        next();
    else
        res.redirect('/');
});

router.get('/', (req, res) => {
    res.render('org/centAuth', {
        details: {},
        errors: []
    });
});

router.post('/', [check('aadhaarNum').isLength(12).withMessage('Please enter a valid 12 digit Aadhaar Number').matches(/\d/).withMessage('Your Aadhaar number can only contain numbers')], function (req, res) {
    let errors = validationResult(req);
    let aadhaarNum = req.body.aadhaarNum.trim().replace(/ /g, '');
    AadhaarUser.findOne({
        aadhaarNo: aadhaarNum
    }, (err, doc) => {
        if (doc == null) {
            res.render('org/centAuth', {
                details: {
                    found: null
                },
                errors: errors.array()
            })
        } else {
            let details = doc.toJSON()
            ehrClinician.createRecord(req, res, details);
            // User.register(new User({
            //     _id: details.aadhaarNo,
            //     username: details.name.replace(' ', '').toLowerCase() + details.aadhaarNo.slice(0, 4),
            //     email: details.email,
            //     phone: details.phoneNumber,
            //     type: 'user'
            // }), details.name.replace(' ', '').toLowerCase() + details.aadhaarNo.slice(0, 4), (err, user) => {
            //     if (err) {
            //         console.log(err.message);
            //         res.render('org/centAuth', {
            //             details: doc,
            //             errors: [{
            //                 msg: err.message
            //             }]
            //         });
            //     } else {
            //         console.log(typeof (details));
            //         ehrClinician.createRecord(req, res, details);
            //     }
            // })
            console.log('Found:', details);
        }
    })

});



module.exports = router;