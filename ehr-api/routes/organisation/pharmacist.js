//Pharmacist Routes
const express = require("express");
const router = express.Router();
const passport = require("passport");
const ehrPharmacist = require("../../FabricHelperPharmacist");
const User = require("../../models/user");
const keccak256 = require("keccak256");

//All routes have prefix '/organisation/pharmacist'

router.get("/login", function (req, res) {
  res.render("org/org-login", {
    org: "pharmacist",
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/organisation/pharmacist",
    failureRedirect: "/organisation/pharmacist/login",
  }),
  function (req, res) {}
);

router.use((req, res, next) => {
  if (req.user.type == "pharmacist") next();
  else res.redirect("/");
});

router.get("/", function (req, res) {
  res.render("org/pharmacistPortal", {
    details: {},
    error: null,
  });
});

router.get("/getprescription", function (req, res) {
  res.render("org/pharmacistPortal", {
    details: {},
    error: null,
  });
});

router.post("/getprescription", function (req, res) {
  let MedicalID = req.body.medicalID;
  if (/^\d{12}$/.test(MedicalID)) {
    let encrypted = keccak256(MedicalID).toString("hex");
    User.findOne({ _id: encrypted }, function (err, found) {
      if (err || !found)
        return res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.error"),
        });
      let doc = {
        medicalID: encrypted,
      };
      let perm = found.permission.indexOf(req.user._id) + 1;
      if (perm) {
        ehrPharmacist.getMedicineReport(req, res, doc);
        console.log("its using aadhar", encrypted);
      } else {
        res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.noAccess"),
        });
      }
    });
  } else {
    User.findOne({ username: MedicalID }, function (err, found) {
      if (err || !found)
        return res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.error"),
        });
      let doc = {
        medicalID: found._id,
      };
      let perm = found.permission.indexOf(req.user._id) + 1;
      if (perm) {
        ehrPharmacist.getMedicineReport(req, res, doc);
        console.log("using name", found._id);
      } else {
        res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.noAccess"),
        });
      }
    });
  }

  // let doc = {
  //     'medicineID': MedicalID
  // }
  // User.findOne({
  //     _id: MedicalID
  // }, function (err, found) {
  //     if (err || !found)
  //         return res.render('org/pharmacistPortal', {
  //             details: {},
  //             error: res.__('messages.error'),
  //         })
  //     let perm = found.permission.indexOf(req.user._id) + 1;
  //     if (perm) {
  //         ehrPharmacist.getMedicineReport(req, res, doc);
  //     } else {
  //         res.render("org/pharmacistPortal", {
  //             details: {},
  //             error: res.__('messages.noAccess')
  //         })
  //     }
  // });
});

router.post("/getprescriptionhistory", function (req, res) {
  let MedicalID = req.body.medicalID;
  if (/^\d{12}$/.test(MedicalID)) {
    let encrypted = keccak256(MedicalID).toString("hex");
    User.findOne({ _id: encrypted }, function (err, found) {
      if (err || !found)
        return res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.error"),
        });
      req.medicalID = encrypted;
      let perm = found.permission.indexOf(req.user._id) + 1;
      if (perm) {
        ehrPharmacist.getMedicineRecord(req, res);
        console.log("its using aadhar", encrypted);
      } else {
        res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.noAccess"),
        });
      }
    });
  } else {
    User.findOne({ username: MedicalID }, function (err, found) {
      if (err || !found)
        return res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.error"),
        });

      req.medicalID = found._id;
      let perm = found.permission.indexOf(req.user._id) + 1;
      if (perm) {
        ehrPharmacist.getMedicineRecord(req, res);
        console.log("using name", found._id);
      } else {
        res.render("org/pharmacistPortal", {
          details: {},
          error: res.__("messages.noAccess"),
        });
      }
    });
  }

  //   User.findOne(
  //     {
  //       _id: MedicalID,
  //     },
  //     function (err, found) {
  //       let perm = found.permission.indexOf(req.user._id) + 1;
  //       if (perm) {
  //         ehrPharmacist.getMedicineRecord(req, res);
  //       } else {
  //         res.render("org/pharmacistPortal", {
  //           details: {},
  //           error: res.__("messages.noAccess"),
  //         });
  //       }
  //     }
  //   );
});

module.exports = router;
