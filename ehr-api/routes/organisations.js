const express = require('express');
const router = express.Router();

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
router.use('/researcher', require('./organisation/researcher'));


module.exports = router;