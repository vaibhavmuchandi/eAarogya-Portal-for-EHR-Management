const express = require('express')
const path = require('path')
var app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const {check, validationResult} = require('express-validator')
//const ehr = require('./FabricHelper')
mongoose.connect('mongodb://localhost/ehr',  { useNewUrlParser: true })
//app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use("/css", express.static(__dirname + "/css"))


let AadhaarUser = mongoose.model('AadhaarUser', {
  aadhaarNo: String,
  name: String,
  dob: Date,
  gender: String,
  address: String
})

app.get('/centAuth', (req, res) => {
  res.render('centAuth', {details: {}, errors: []} );
});

app.post('/centAuth', [check('aadhaarNum').isLength(12).withMessage('Please enter a valid 12 digit Aadhaar Number').matches(/\d/).withMessage('Your Aadhaar number can only contain numbers')], function(req, res) {
  let errors = validationResult(req)
  // if(!errors.isEmpty()) {
  //   return res.status(422).json({error: errors})
  // }^\d{4} {0,1}\d{4} {0,1}\d{4}$
  var aadhaarNum = req.body.aadhaarNum.trim().replace(/ /g, "");
  // console.log(aadhaarNum);
  AadhaarUser.findOne({aadhaarNo: aadhaarNum}, (err, doc) => {
      if(doc == null) {
          res.render('centAuth', {details: {found: null}, errors: errors.array()})
      }
      else {
        var details = doc.toJSON()
        //ehr.createRecord(req, res, details)
        console.log('Found:', details);
        res.render('centAuth', {details: details, errors: []})
      }
  })

});

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
