//Radiologist Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrRadiologist = require('../../FabricHelperRadiologist');
const User = require("../../models/user");
const AadhaarUser = require('../../models/aadhaaruser');
const Data = require('../../models/data');
const axios = require('axios');
const keccak256 = require('keccak256');
const app = express();


//All routes have prefix '/organisation/radiologist'
router.get('/login', function (req, res) {
  res.render('org/org-login', {
    org: 'radiologist'
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/organisation/radiologist',
  failureRedirect: '/organisation/radiologist/login'
}), function (req, res) {});


router.use((req, res, next) => {
  if (req.user.type == 'radiologist')
    next();
  else
    res.redirect('/');
});

router.get('/', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});


router.get('/medicalID', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null,
  });
});

router.post('/medicalID', function (req, res) {
  let AadhaarNo = req.body.medicalID;
  app.set('aadhaar', AadhaarNo);
  let hash = keccak256(AadhaarNo).toString('hex')
  let MedicalID = hash;
  let doc = {
    'medicalID': MedicalID,
    'aadhaarNo': AadhaarNo
  }
  console.log(doc)
  User.findOne({
    _id: MedicalID
  }, function (err, found) {
    if (err || !found)
      return res.render('org/radiologistPortal', {
        details: {},
        error: res.__('messages.error'),
        message: null,
      })
    let perm = found.permission.indexOf(req.user._id) + 1;
    if (perm) {
      console.log(doc)
      ehrRadiologist.getReport(req, res, doc);
    } else {
      res.render("org/radiologistPortal", {
        details: {},
        error: res.__('messages.noAccess'),
        message: null
      })
    }
  });
});

router.get('/addreport', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});

//image upload
const fileUpload = require("express-fileupload");
var Kraken = require("kraken");
var fs = require("fs");

var kraken = new Kraken({
  api_key: "cbe915fd4263bab806ff04bd5a28614b",
  api_secret: "e28b31c8eca6c9090f9acdee677b87e0444597ff",
});

// router.post('/addreport', async function (req, res) {
//   async function getBase64(file) {
//     return new Promise(resolve => {
//       var reader = new FileReader();
//       reader.onload = function (event) {
//         resolve(event.target.result);
//       };
//       reader.readAsDataURL(file);
//     });
//   }
//   var file = req.files.reportImg;
//   var fileName = file.name;
//   const base64 = await getBase64(req.files.reportImg)
//   axios.post('https://earogya-ipfs.herokuapp.com/post', {
//     img: base64
//   }).then((response) => res.send(response)).catch((err) => res.send(err))
// });


router.post('/addreport', async function (req, res) {
  if (req.files) {
    var file = req.files.reportImg;
    var fileName = file.name;
    file.mv("uploads/" + fileName, function (err) { // moving file to uploads folder
      if (err) { // if error occurs run this
        console.log("File was not uploaded!!");
        res.send(err);
      } else {
        console.log("file uploaded");
        var opts = {
          file: fs.createReadStream("uploads/" + fileName),
          wait: true,
        };
        kraken.upload(opts, async function (err, data) {
          if (err) {
            console.log("Failed. Error message: %s", err);
          } else {
            const aadhaarno = app.get('aadhaar');
            const MedicalID = keccak256(aadhaarno).toString('hex')
            let Diagnosis = req.body.diagnoses;
            let report = Diagnosis;
            // let links = req.body.links;
            let links = data.kraked_url.toString();
            let addedBy = req.user._id;
            let doc = {
              'medicalID': MedicalID,
              'report': report,
              'links': links,
              'addedby': addedBy,
              'aadhaarNo': aadhaarno
            }
            const response = await AadhaarUser.findOne({
              aadhaarNo: aadhaarno
            })
            const address = response.address.split(',')
            const state = address[address.length - 1]
            const disease = Diagnosis
            let info = new Data({
              state: state,
              disease: disease
            })
            info.save((err, response) => {
              if (err) {
                res.send(err)
              } else {
                console.log('done')
              }
            });
            ehrRadiologist.addrLReport(req, res, doc);
          }
        });
      }
    })
  }
});


router.get('/getreport', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});

router.post('/getreport', function (req, res) {
  const aadhaarno = app.get('aadhaar');
  let medicalID = keccak256(aadhaarno).toString('hex')
  let doc = {
    'medicalID': medicalID,
    'aadhaarNo': aadhaarno
  }
  ehrRadiologist.getReport(req, res, doc);
});

router.get('/addprescription', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});

router.post('/addprescription', function (req, res) {
  const aadhaarno = app.get('aadhaar');
  let medicalID = keccak256(aadhaarno).toString('hex')
  let prescription = req.body.prescription;
  let addedBy = req.user._id
  let doc = {
    'medicalID': medicalID,
    'prescription': prescription,
    'addedby': addedBy,
    'aadhaarNo': aadhaarno
  }
  ehrRadiologist.addMedicineReport(req, res, doc);
});

router.get('/getprescription', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});

router.post('/getprescription', function (req, res) {
  const aadhaarno = app.get('aadhaar');
  let medicalID = keccak256(aadhaarno).toString('hex')
  let doc = {
    'medicalID': medicalID,
    'aadhaarNo': aadhaarno
  }
  ehrRadiologist.getMedicineRecord(req, res, doc);
});

router.get('/reporthistory', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});

router.post('/reporthistory', function (req, res) {
  const aadhaarno = app.get('aadhaar');
  let medicalID = keccak256(aadhaarno).toString('hex')
  let doc = {
    'medicalID': medicalID,
    'aadhaarNo': aadhaarno
  }
  ehrRadiologist.getRecord(req, res, doc);
});

router.get('/medicinehistory', function (req, res) {
  res.render('org/radiologistPortal', {
    details: {},
    error: null,
    message: null
  });
});

router.post('/medicinehistory', function (req, res) {
  const aadhaarno = app.get('aadhaar');
  let medicalID = keccak256(aadhaarno).toString('hex')
  let doc = {
    'medicalID': medicalID,
    'aadhaarNo': aadhaarno
  }
  ehrRadiologist.getMedicineRecord(req, res, doc);
});

module.exports = router;