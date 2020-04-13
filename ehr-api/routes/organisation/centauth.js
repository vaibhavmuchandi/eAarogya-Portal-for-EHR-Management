//Central Authority Routes
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const passport = require('passport');
const AadhaarUser = require('../../models/aadhaaruser');

//All routes have prefix '/organisation/centauth'
router.get('/login', function(req, res) {
    res.render('org-login', {org: 'centauth'});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {

});

router.get('/', (req, res) => {
    res.render('centAuth', { details: {}, errors: [] });
});

router.post('/', [check('aadhaarNum').isLength(12).withMessage('Please enter a valid 12 digit Aadhaar Number').matches(/\d/).withMessage('Your Aadhaar number can only contain numbers')], function(req, res) {
    let errors = validationResult(req)
        // if(!errors.isEmpty()) {
        //   return res.status(422).json({error: errors})
        // }^\d{4} {0,1}\d{4} {0,1}\d{4}$
    let aadhaarNum = req.body.aadhaarNum.trim().replace(/ /g, '');
    let medicineNum = aadhaarNum + '0M';
    // console.log(aadhaarNum);
    AadhaarUser.findOne({ aadhaarNo: aadhaarNum }, (err, doc) => {
        if (doc == null) {
            res.render('centAuth', { details: { found: null }, errors: errors.array() })
        } else {
            let details = doc.toJSON()
            ehrClinician.createRecord(req, res, details);
            ehrClinician.createMedicineRecord(req, res, details);
            console.log('Found:', details);
            //res.render('centAuth', { details: details, errors: [] })
        }
    })

});

module.exports = router;
