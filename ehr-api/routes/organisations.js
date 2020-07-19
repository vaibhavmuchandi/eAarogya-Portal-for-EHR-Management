const express = require('express');
const router = express.Router();


router.get('/hospitals', function (req, res) {
    res.render('org/hospitals');
});

router.use((req, res, next) => {
    if (req.user || /login/.test(req.originalUrl))
        next();
    else
        res.redirect('/professional');
});
router.use('/centauth', require('./organisation/centauth'));
router.use('/testcenter', require('./organisation/testcenter'));
router.use('/clinician', require('./organisation/clinician'));
router.use('/pharmacist', require('./organisation/pharmacist'));
router.use('/healthcareprovider', require('./organisation/hcp'));
router.use('/radiologist', require('./organisation/radiologist'));


module.exports = router;