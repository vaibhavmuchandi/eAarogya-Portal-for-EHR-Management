const express = require('express');
const router = express.Router();
const passport = require('passport');
const request = require('request');
const ehrClinician = require('../../FabricHelperClinician');
const AadhaarUser = require('../../models/aadhaaruser');
const User = require('../../models/user');
const Web3 = require('web3');
let app = express();
let web3 = new Web3();

//All routes have prefix /user/register-user
router.get('/', (req, res) => {
  res.render('user/register-user/index');
});

router.post('/', (req, res) => {
  let aadhaarNum = req.body.aadhaarNum.trim().replace(/[ -]/g, '');
  AadhaarUser.findOne({
    aadhaarNo: aadhaarNum
  }, (err, user) => {
    if (user) {
      app.set('details', user.toJSON());

      var options = {
        method: 'GET',
        url: 'http://2factor.in/API/V1/2ab4e5d4-685c-11ea-9fa5-0200cd936042/SMS/' + user.phoneNumber + '/AUTOGEN',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        form: {}
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        let session = JSON.parse(body);
        app.set('sessionNum', session.Details);
      });
      res.render('user/register-user/enter-code', {
        error: null
      });
    } else {
      res.render('user/register-user/index');
    }
  })
});


router.post('/verify-otp', (req, res) => {
  let otp = req.body.code;
  let sessNum = app.get('sessionNum');
  let options = {
    method: 'GET',
    url: 'http://2factor.in/API/V1/2ab4e5d4-685c-11ea-9fa5-0200cd936042/SMS/VERIFY/' + sessNum + '/' + otp,
    headers: {
    },
    form: {}
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    if (response.statusCode == 200) {
      let details = app.get('details');
      res.render('user/register-user/complete-form', {
        details: details
      });
    } else {
      res.render('user/register-user/enter-code', {
        error: 'Invalid OTP'
      })
    }
  });
})

router.post('/complete-form', async (req, res) => {
  async function createEthreumAccount() {
    const account = web3.eth.accounts.create()
    return account
  }
  let details = req.body;
  details.user = true;
  let ethAccount = await createEthreumAccount();
  User.register(new User({
    _id: details.aadhaarNo,
    name: details.name,
    username: details.username,
    email: details.email,
    phone: details.phone,
    rewards: {
      ethereumAddress: ethAccount.address,
      privateKey: ethAccount.privateKey,
      enabled: false
    },
    type: 'user'
  }), details.password, (err, user) => {
    if (err) {
      console.log(err.message);
    } else {
      ehrClinician.createRecord(req, res, details);
    }
  })
});

router.post('/find-user', (req, res) => {
  User.findOne({
    _id: req.body.nomID
  }, 'name nom', (err, user) => {
    if (err) {
      console.error(err)
      return res.render('user/register-user/nominee', {
        id: req.body.userID,
        user: null
      });
    }
    if (!user)
      res.render('user/register-user/nominee', {
        id: req.body.userID,
        user: 'none'
      });
    else
      res.render('user/register-user/nominee', {
        id: req.body.userID,
        user: user
      });
  })
});

router.post('/confirm-nominee', (req, res) => {
  console.log('body', req.body);
  User.findOneAndUpdate({
    _id: req.body.nomID
  }, {
    $set: {
      nom: req.body.userID
    }
  }, (err, doc) => {
    if (err) {
      console.error(err);
      return res.render('user/register-user/nominee', {
        id: req.body.userID,
        user: null
      });
    }
    console.log(doc);
    res.redirect('/user/login');
  });
});

module.exports = router;