//Test Center Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrTestCenter = require('../../FabricHelpertestcenter');

//All routes have prefix '/organisation/testcenter'
router.get('/login', (req, res) => {
    res.render('org-login', {org: 'testcenter'});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), (req, res) => {

});

router.get('/', (req, res) => {
    res.render('org/testcenter', { response: {} });
});

router.post('/addreport', (req, res) => {
    var MedicalID = req.body.medicalID;
    var bloodgroup = req.body.bloodGroup;
    var bloodpressure = req.body.bloodPressure;
    var haemoglobin = req.body.haemoglobin;
    var sugarlevel = req.body.sugarlevel;
    var links = req.body.links || ' ';
    var report = 'Blood Group:' + bloodgroup + ' ' + 'Blood Pressure:' + bloodpressure + ' ' + 'Haemoglobin:' + haemoglobin + ' ' + 'Glucose:' + sugarlevel;
    console.log(report);
    var doc = {
        'medicalID': MedicalID,
        'report': report,
        'links': links
    }

    ehrTestCenter.addrLReport(req, res, doc);
});

module.exports = router;
