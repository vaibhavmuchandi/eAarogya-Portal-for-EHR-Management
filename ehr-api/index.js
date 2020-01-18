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


var cookieParser = require('cookie-parser');
app.use(cookieParser());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var ehrClinician = require("./FabricHelperClinician")
var ehrPharmacist = require("./FabricHelperPharmacist")
var ehrHCP = require("./FabricHelperHCP");
var ehrRadiologist = require("./FabricHelperRadiologist");
var ehrTestCenter = require("./FabricHelpertestcenter");

/*AadhaarUser.create({
    aadhaarNo: "12345",
    name: "Vaibhav MM",
    dob: "04/12/1999",
    gender: "Male",
    address: "Bhadkal Galli"
});*/
//==================INDEX ROUTING================================
app.get("/", function(req, res) {
    res.render("index");
});
app.get("/professional", function(req, res) {
    res.render("professionalIndex");
});
app.get("/organisation/hospitals", function(req, res) {
    res.render("hospitals");
});
//==================TESTCENTER ROUTING START=====================
app.get("/organisation/testcenter/login", function(req, res) {
    res.render("testcenterlogin");
});
app.post("/organisation/testcenter/login", passport.authenticate("local", {
    successRedirect: "/organisation/testcenter",
    failureRedirect: "/organisation/testcenter/login"
}), function(req, res) {

});
app.get("/organisation/testcenter", function(req, res) {
    res.render("testcenter", { response: {} });
});
app.post("/organisation/testcenter/addreport", function(req, res) {
    var MedicalID = req.body.medicalID;
    var bloodgroup = req.body.bloodGroup;
    var bloodpressure = req.body.bloodPressure;
    var haemoglobin = req.body.haemoglobin;
    var sugarlevel = req.body.sugarlevel;
    var links = req.body.links || " ";
    var report = "Blood Group:" + bloodgroup + " " + "Blood Pressure:" + bloodpressure + " " + "Haemoglobin:" + haemoglobin + " " + "Glucose:" + sugarlevel;
    console.log(report);
    var doc = {
        "medicalID": MedicalID,
        "report": report,
        "links": links
    }

    ehrTestCenter.addrLReport(req, res, doc);
})

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
    var medicineNum = aadhaarNum + '0M';
    // console.log(aadhaarNum);
    AadhaarUser.findOne({ aadhaarNo: aadhaarNum }, (err, doc) => {
        if (doc == null) {
            res.render('centAuth', { details: { found: null }, errors: errors.array() })
        } else {
            var details = doc.toJSON()
            ehrClinician.createRecord(req, res, details);
            ehrClinician.createMedicineRecord(req, res, details);
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
    res.render("clinicianPortal", { details: {}, history: [] });
});
app.post("/organisation/clinician/medicalID", function(req, res) {
    var MedicalID = req.body.medicalID;
    var doc = {
        "medicalID": MedicalID
    }
    User.findOne({ username: 'cliniciantest' }, function(err, found) {
        found.permission.forEach(function(perm) {
            if (perm == MedicalID) {
                ehrClinician.getReport(req, res, doc);
            } else {
                res.render("clinicianPortal", { details: { msg: "Cannot fetch data" } });
            }
        });
    });


});


app.get("/organisation/clinician", function(req, res) {
    res.render("clinicianPortal", { details: {}, history: [] });
});

app.get("/organisation/clinician/addreport", function(req, res) {
    res.render("clinicianPortal", { details: {}, history: [] });
})

app.post("/organisation/clinician/addreport", function(req, res) {
    var MedicalID = req.body.medicalID;
    var allergies = req.body.allergies;
    var symptoms = req.body.symptoms;
    var diagnosis = req.body.diagnoses
    var report = allergies + " " + symptoms + " " + diagnosis;
    var doc = {
        "medicalID": MedicalID,
        "report": report
    }

    ehrClinician.addReport(req, res, doc);
    console.log(MedicalID);

});

app.get("/organisation/clinician/addprescription", function(req, res) {
    res.render("clinicianPortal", { details: {}, history: [] });
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
    res.render("clinicianPortal", { details: {}, history: [] });
});

app.post("/organisation/clinician/getreport", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    };
    ehrClinician.getReport(req, res, doc);
});

app.get("/organisation/clinician/getprescription", function(req, res) {
    res.render("clinicianPortal", { details: {}, history: [] });
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
    res.render("clinicianPortal", { details: {}, history: [] });
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
    successRedirect: "/organisation/radiologist",
    failureRedirect: "/organisation/radiologist/login"
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
app.post("/organisation/radiologist/addreport", function(req, res) {
    var MedicalID = req.body.medicalID;
    var bloodGroup = req.body.bloodGroup;
    var bloodPressure = req.body.bloodPressure;
    var Height = req.body.height;
    var Weight = req.body.weight;
    var Allergies = req.body.allergies;
    var Diagnosis = req.body.diagnoses;
    var report = bloodPressure + " " + bloodGroup + " " + Height + " " + Weight + " " + " " + Allergies + " " + Diagnosis;
    var links = req.body.links;
    var doc = {
        "medicalID": MedicalID,
        "report": report,
        "links": links
    }
    ehrRadiologist.addrLReport(req, res, doc);
});
app.get("/organisation/radiologist/getreport", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.post("/organisation/radiologist/getreport", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    }
    ehrRadiologist.getReport(req, res, doc);
});
app.get("/organisation/radiologist/addprescription", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.post("/organisation/radiologist/addprescription", function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M'
    var prescription = req.body.prescription;
    var doc = {
        "medicalID": medicineID,
        "prescription": prescription
    }
    ehrRadiologist.addMedicineReport(req, res, doc);
});

app.get("/organisation/radiologist/getprescription", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.post("/organisation/radiologist/getprescription", function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M';
    var doc = {
        "medicineID": medicineID
    }
    ehrRadiologist.getMedicineRecord(req, res, doc);
});

app.get("/organisation/radiologist/reporthistory", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.post("/organisation/radiologist/reporthistory", function(req, res) {
    var medicalID = req.body.medicalID;
    var doc = {
        "medicalID": medicalID
    }
    ehrRadiologist.getRecord(req, res, doc);
});
app.get("/organisation/radiologist/prescriptionhistory", function(req, res) {
    res.render("radioLogistPortal", { details: {} });
});
app.post("/organisation/radiologist/prescriptionhistory", function(req, res) {
    var medicalID = req.body.medicalID;
    var medicineID = medicalID + '0M';
    var doc = {
        "medicalID": medicineID
    }
    ehrRadiologist.getMedicineRecord(req, res, doc);
});
//======================RADIOLOGIST ROUTE OVER================================
//======================USERPORTAL ROUTE START================================
app.get("/user/login", function(req, res) {
    res.render("userPortalLogin");
});
app.post("/user/login", passport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/user/login"
}), function(req, res) {});

app.get("/user", function(req, res) {
    res.render("userPortal", { permission: {} });
});

app.post("/user/givepermission", function(req, res) {
    var DoctorID = req.body.doctorID;
    var MedicalID = req.body.medicalID;
    User.findOne({ username: DoctorID }, function(err, foundOrg) {
        var org = foundOrg;
        org.permission.push(MedicalID);
        org.save();
        console.log(org);
        res.render("userPortal", { permission: {} });
    });
});

app.get("/user/revokepermission", function(req, res) {
    res.render("userPortal", { permission: {} });
})

app.post("/user/revokepermission", function(req, res) {
    var MedicalID = req.body.medicalID;
    var DoctorID = req.body.doctorID;
    User.findOne({ username: DoctorID }, function(err, foundOrg) {
        console.log(foundOrg);
        for (var i = 0; i < foundOrg.permission.length; i++) {
            if (foundOrg.permission[i] === MedicalID) {
                foundOrg.permission.splice(i, 1);
                foundOrg.save()
            } else {
                res.send("Not found");
            }
        }
        console.log(foundOrg);
        res.redirect("/user");
    });
});
app.get("/user/getpermission", function(req, res) {
    res.render("userPortal", { permission: {} });
});
app.post("/user/getpermission", function(req, res) {
    User.findOne({ username: 'cliniciantest' }, function(err, found) {
        var permission = found.toJSON();
        console.log(permission);
        res.render("userPortal", { permission: permission })
    });
});




app.listen(3000, function() {
    console.log("Server running on port 3000")
});