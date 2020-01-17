var express = require('express');
var app = express();
var mongoose = require('mongoose')
var bodyParser = require('body-parser');
var flash = require('connect-flash');
mongoose.connect('mongodb://localhost:27017/ehrAadhaar', { useNewUrlParser: true, useUnifiedTopology: true })
app.use(bodyParser.urlencoded({ extended: true }))
let AadhaarUser = mongoose.model('AadhaarUser', {
        aadhaarNo: String,
        name: String,
        dob: String,
        gender: String,
        address: String
    })
    //app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.json());
app.use(flash());

var ehrClinician = require("./FabricHelperClinician")
var ehrPharmacist = require("./FabricHelperPharmacist")
var ehrHCP = require("./FabricHelperHCP");

AadhaarUser.create({
    aadhaarNo: "12345",
    name: "Vaibhav MM",
    dob: "04/12/1999",
    gender: "Male",
    address: "Bhadkal Galli"
});


app.get('/centAuth', (req, res) => {
    res.render('centAuth', { details: {} });
});

app.post('/centAuth', function(req, res) {
    var aadhaarNum = req.body.aadhaarNum;
    console.log(aadhaarNum);
    AadhaarUser.findOne({ aadhaarNo: aadhaarNum }, (err, doc) => {
        var details = doc;
        ehrClinician.createRecord(req, res, doc);
        ehrClinician.createMedicineRecord(req, res, doc);
        console.log('Found:', details);
        console.log(details.aadhaarNo);


    });

});

//===========CLINICIAN ROUTES========================

app.get("/organisation/clinician/medicalID", function(req, res) {
    res.render("clinicianPortal", { details: {} });
});
app.post("/organisation/clinician/medicalID", function(req, res) {
    var MedicalID = req.body.medicalID;
    var doc = {
        "medicalID": MedicalID
    }
    ehrClinician.getReport(req, res, doc);

});


app.get("/organisation/clinician/", function(req, res) {
    res.render("clinicianPortal", { details: {} });
});

app.get("/organisation/clinician/addreport", function(req, res) {
    res.render("clinicianPortal", { details: {} });
})

app.post("/organisation/clinician/addreport", function(req, res) {
    var MedicalID = req.body.medicalID;
    var bloodGroup = req.body.bloodGroup;
    var bloodPressure = req.body.bloodPressure;
    var Height = req.body.height;
    var Weight = req.body.weight;
    var Allergies = req.body.allergies;
    var Diagnosis = req.body.diagnoses;
    var report = bloodPressure + " " + bloodGroup + " " + Height + " " + Weight + " " + " " + Allergies + " " + Diagnosis;
    var doc = {
        "medicalID": MedicalID,
        "report": report
    }

    ehrClinician.addReport(req, res, doc);
    console.log(MedicalID);

});

app.get("/organisation/clinician/addprescription", function(req, res) {
    res.render("clinicianPortal", { details: {} });
});

app.post("/organisation/clinician/addprescription", function(req, res) {
    var medicalID = req.body.medicalID;
    var medicalRecordID = medicalID + '0M';
    var prescription = req.body.prescription;
    var doc = {
        "medicalID": medicalRecordID,
        "prescription": prescription
    }
    ehrClinician.addMedicineReport(req, res, doc);
});

app.get("/organisation/clinician/getreport", function(req, res) {
    res.render("clinicianPortal", { details: {} });
});

app.post("/organisation/clinician/getreport", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    };
    ehrClinician.getReport(req, res, doc);
});

app.get("/organisation/clinician/getprescription", function(req, res) {
    res.render("clinicianPortal", { details: {} });
});
app.post("/organisation/clinician/getprescription", function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M';
    var doc = {
        "medicalID": medicineID
    }
    ehrClinician.getMedicineReport(req, res, doc);
});

app.get("/organisation/clinician/reporthistory", function(req, res) {
    res.render("clinicianPortal", { details: {} });
});

app.post("/organisation/clinician/reporthistory", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    }
    ehrClinician.getRecord(req, res, doc);
});

//==========Clinician Route Over =================================
//==========Pharmacist Route Start================================

app.get("/organisation/pharmacist", function(req, res) {
    res.render("pharmacistPortal", { details: {} });
});

app.get("/organsation/pharmacist/getprescription", function(req, res) {
    res.render("pharmacistPortal", { details: {} });
});
app.post("/organisation/pharmacist/getprescription", function(req, res) {
    var MedicalID = req.body.medicalID;
    var MedicineID = MedicalID + '0M'
    console.log(MedicalID);
    console.log(typeof(MedicalID));
    var doc = {
        "medicineID": MedicineID
    }
    console.log(doc);
    console.log(typeof(doc));
    ehrPharmacist.getMedicineReport(req, res, doc);
});

//========================PHARMACIST ROUTE OVER==============================
//========================HEALTHCARE PROVIDER ROUTE START====================

app.get("/organisation/healthcareprovider", function(req, res) {
    res.render("hcpPortal", { details: {} });
});

app.get("/organisation/healthcareprovider/getreport", function(req, res) {
    res.render("hcpPortal", { details: {} });
})
app.post("/organisation/healthcareprovider/getreport", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    }
    ehrHCP.getReport(req, res, doc);
});

app.get("/organisation/healthcareprovider/getmedicalrecord", function(req, res) {
    res.render("hcpPortal", { details: {} });
});
app.post("/organisation/healthcareprovider/getmedicalrecord", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    }
    ehrHCP.getRecord(req, res, doc);
});

app.get("/organisation/healthcareprovider/getprescription", function(req, res) {
    res.render("hcpPortal", { details: {} });
});
app.post("/organisation/healthcareprovider/getprescription", function(req, res) {
    var medicalID = req.body.medicalID
    var medicineID = medicalID + '0M';
    var doc = {
        "medicalID": medicineID
    }
    ehrHCP.getMedicineReport(req, res, doc);
});
app.get("/organisation/healthcareprovider/getprescriptionrecord", function(req, res) {
    res.render("hcpPortal", { details: {} });
});
app.post("/organisation/healthcareprovider/getprescriptionrecord", function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M';
    var doc = {
        "medicalID": medicineID
    }
    ehrHCP.getMedicineRecord(req, res, doc);
});

app.listen(3000, function() {
    console.log("Server running on port 3000")
});