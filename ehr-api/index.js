var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require("passport");
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var User = require("./models/user");
var LocalStrategy = require("passport-local");
const { check, validationResult } = require('express-validator')
var passportLocalMongoose = require("passport-local-mongoose");
//mongoose.connect("mongodb://localhost/permission_app", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://localhost/ehrAadhaar', { useNewUrlParser: true, useUnifiedTopology: true })
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
app.use(require("express-session")({
    secret: "India is my country I love my country",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var ehrClinician = require("./FabricHelperClinician")
var ehrPharmacist = require("./FabricHelperPharmacist")
var ehrHCP = require("./FabricHelperHCP");
var ehrRadiologist = require("./FabricHelperRadiologist");

/*AadhaarUser.create({
    aadhaarNo: "12345",
    name: "Vaibhav MM",
    dob: "04/12/1999",
    gender: "Male",
    address: "Bhadkal Galli"
});*/
//==================CENTAUTH ROUTING STARTS=======================
app.get("/register", function(req, res) {
    res.render("register");
});
app.post("/register", function(req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            })
        }
    });
});

app.get("/organisation/centauth/login", function(req, res) {
    res.render("centauthlogin");
});

app.post("/organisation/centauth/login", passport.authenticate("local", {
    successRedirect: "/organisation/centauth",
    failureRedirect: "/organisation/centauth/login"
}), function(req, res) {

});

app.get('/organisation/centauth', (req, res) => {
    res.render('centAuth', { details: {}, errors: [] });
});

app.post('/organisation/centauth', [check('aadhaarNum').isLength(12).withMessage('Please enter a valid 12 digit Aadhaar Number').matches(/\d/).withMessage('Your Aadhaar number can only contain numbers')], function(req, res) {
    let errors = validationResult(req)
        // if(!errors.isEmpty()) {
        //   return res.status(422).json({error: errors})
        // }^\d{4} {0,1}\d{4} {0,1}\d{4}$
    var aadhaarNum = req.body.aadhaarNum.trim().replace(/ /g, "");
    // console.log(aadhaarNum);
    AadhaarUser.findOne({ aadhaarNo: aadhaarNum }, (err, doc) => {
        if (doc == null) {
            res.render('centAuth', { details: { found: null }, errors: errors.array() })
        } else {
            var details = doc.toJSON()
            ehrClinician.createRecord(req, res, details)
            console.log('Found:', details);
            //res.render('centAuth', { details: details, errors: [] })
        }
    })

});

//===========CLINICIAN ROUTES========================
app.get("/organisation/clinician/login", function(req, res) {
    res.render("clinicianlogin");
})
app.post("/organisation/clinician/login", passport.authenticate("local", {
    successRedirect: "/organisation/clinician",
    failureRedirect: "/organisation/clinician/login"
}), function(req, res) {});

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


app.get("/organisation/clinician", function(req, res) {
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
app.get("/organisation/pharmacist/login", function(req, res) {
    res.render("pharmacistlogin");
});
app.post("/organisation/pharmacist/login", passport.authenticate("local", {
    successRedirect: "/organisation/pharmacist",
    failureRedirect: "/organisation/pharmacist/login"
}), function(req, res) {});


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
app.get("/organisation/healthcareprovider/login", function(req, res) {
    res.render("hcplogin");
});
app.post("/organisation/healthcareprovider/login", passport.authenticate("local", {
    successRedirect: "/organisation/healthcareprovider",
    failureRedirect: "/organisation/healthcareprovider/login"
}), function(req, res) {});



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
//=====================HEALTHCAREPROVIDER ROUTE OVER==============================
//=====================RADIOLOGIST ROUTE START====================================
app.get("/organisation/radiologist/login", function(req, res) {
    res.render("radioLogistLogin");
});
app.post("/organisation/radiologist/login", passport.authenticate("local", {
    successRedirect: "/organisation/radiologist/login",
    failureRedirect: "/organisation/radiologist"
}), function(req, res) {});

app.get("/organisation/radiologist", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.get("organisation/radiologist/medicalID", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
})
app.post("/organisation/radiologist/medicalID", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    }
    ehrRadiologist.getReport(req, res, doc);
});
app.get("/organisation/radiologist/addreport", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.post("/organisation/radiologist/addreport")



app.listen(3000, function() {
    console.log("Server running on port 3000")
});