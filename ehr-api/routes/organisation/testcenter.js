//Test Center Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrTestCenter = require('../../FabricHelpertestcenter');

//--------requires for text-extraction-------//
const fs = require("fs");
const pdfparse = require("pdf-parse");
var request = require('request'); 
const upload = require("express-fileupload");
router.use(upload());
//----------------------//

//All routes have prefix '/organisation/testcenter'
router.get('/login', (req, res) => {
  res.render('org/org-login', {
    org: 'testcenter'
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/organisation/testcenter',
  failureRedirect: '/organisation/testcenter/login'
}), (req, res) => {

});

router.use((req, res, next) => {
  if (req.user.type == 'testcenter')
    next();
  else
    res.redirect('/');
});

router.get('/', (req, res) => {
  res.render('org/testcenter', {
    response: {}
  });
});

router.post('/addreport', (req, res) => {
  
//------------Text Extraction from pdf or image------------------//
  if (req.files) {
    var file = req.files.file;
    var fileName = file.name;
    if (file.mimetype == 'application/pdf') {
      file.mv("uploads/" + fileName, function (err) { // moving file to uploads folder
        if (err) { // if error occurs run this
          console.log("File was not uploaded!!");
          res.send(err);
        } else {
          console.log("file uploaded");
          const pdffile = fs.readFileSync("uploads/" + fileName); //read the file

          pdfparse(pdffile).then(function (data) { //text-extraction function
            var rawtext = data.text; //all the extracted text is stored in "rawtext" variable
            console.log(rawtext); //extracted text can be seen in the console
          });
        }
      });
    } else if(file.mimetype == 'application/jpg' || 'application/png') {
      file.mv("uploads/" + fileName, (err) => {
        if (err) { // if error occurs run this
          console.log("File was not uploaded!!");
          res.send(err);
        } else {
          var res;
          console.log("file uploaded");
        const form_data = {
        file: fs.createReadStream(`./uploads/${fileName}`),
        }
      
      const options = {
          url : "https://app.nanonets.com/api/v2/OCR/Model/dce1b5d4-3781-43cc-bff1-18d2b12042fc/LabelFile/",
          formData: form_data,
          headers: {
              'Authorization' : 'Basic ' + Buffer.from('fj99eEPW0_3FmWZiglkb1fkP8fpT5E-s' + ':').toString('base64')
          }
      }
      request.post(options, function(err, httpResponse, body) {
          res = JSON.parse(body);
          // var MedicalID = req.body.medicalID;
          var bloodgroup = res.result[0].prediction[1].ocr_text;
          var bloodpressure = res.result[0].prediction[4].ocr_text;
          var haemoglobin = res.result[0].prediction[2].ocr_text ;
          var sugarlevel = res.result[0].prediction[3].ocr_text;
          var report = 'Blood Group:' + bloodgroup + ' ' + 'Blood Pressure:' + bloodpressure + ' ' + 'Haemoglobin:' + haemoglobin + ' ' + 'Glucose:' + sugarlevel;
          console.log(report);
       });
     }
    }
  )};
}
    
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
    });
  

//------------Text Extraction from pdf or image----------------//


// ehrTestCenter.addrLReport(req, res, doc);


module.exports = router;