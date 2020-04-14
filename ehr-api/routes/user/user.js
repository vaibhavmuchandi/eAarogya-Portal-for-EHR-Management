// User Portal Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrUser = require('../../FabricHelper/FabricHelperUser');
const ehrClinician = require('../../FabricHelper/FabricHelperClinician');
const User = require('../../models/user');
const AadhaarUser = require('../../models/aadhaaruser')

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

router.get('/register-user', (req, res) => {
    res.render('user/register-user/index');
});

router.post('/register-user', (req, res) => {
  let aadhaarNum = req.body.aadhaarNum.trim().replace(/[ -]/g, '');
  AadhaarUser.findOne({aadhaarNo: aadhaarNum}, (err, user) => {
    if(user) {
      app.set('details', user.toJSON());

      var options = {
        method: 'GET',
        url: 'http://2factor.in/API/V1/e84b3273-63bb-11ea-9fa5-0200cd936042/SMS/' + detail.phoneNumber + '/AUTOGEN',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        form: {}
      };

      request(options, function(error, response, body) {
        if (error) throw new Error(error);

        let session = JSON.parse(body);
        app.set('sessionNum', session.Details);
      });

      res.render('user/register-user/enter-code', {error: null});
    } else {
      res.render('user/register-user/index');
    }
  })
});


router.post('/user/register-user/verify-otp', (req, res) => {
    let otp = req.body.code;
    let sessNum = app.get('sessionNum');
    let options = {
      method: 'GET',
      url: 'http://2factor.in/API/V1/e84b3273-63bb-11ea-9fa5-0200cd936042/SMS/VERIFY/' + sessNum + '/' + otp,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {}
    };

    request(options, function(error, response, body) {
      if (error) throw new Error(error);

      if (response.statusCode == 200) {
        let details = app.get('details');
        res.render('user/register-user/complete-form', {
          details: details
        });
      } else {
        res.render('user/register-user/enter-code', {error: 'Invalid OTP'})
      }
    });
})

router.post('/user/register-user/complete-form', (req, res) => {
  let details = req.body;
  ehrClinician.createRecord(req, res, details);
  ehrClinician.createMedicineRecord(req, res, details);
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
