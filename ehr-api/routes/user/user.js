// User Portal Routes
const express = require("express");
const router = express.Router();
const passport = require("passport");
const ehrUser = require("../../FabricHelperUser");
const twilioConfig = require("../twilioConfig");
const client = require("twilio")(
  twilioConfig.accountSid,
  twilioConfig.authToken
);
const User = require("../../models/user");
const axios = require("axios");
const config = require("../ethConfig");
const ethInstance = axios.create({
  baseURL: config.api + config.contract,
  timeout: 5000,
  headers: {
    "X-API-KEY": config.key,
  },
});
const PDFDocument = require("pdfkit");
const fs = require("fs");

//All routes have prefix '/user'
router.get("/login", (req, res) => {
  res.render("user/user-login");

  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/user",
      failureRedirect: "/user/login",
    }),
    (req, res) => {}
  );

  router.use(async (req, res, next) => {
    async function getBalance(addr) {
      const response = await ethInstance.get("/balanceOf/" + addr);
      return response.data.data[0].uint256;
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress);
    const rewardDetails = {
      ethAddr: req.user.rewards.ethereumAddress,
      enabled: req.user.rewards.enabled,
      balance: walletBalance,
    };
    res.locals.rewards = rewardDetails;
    next();
  });

  router.get("/", async (req, res) => {
    res.render("user/userPortal", {
      permission: {},
      reports: [],
      prescs: [],
      message: null,
      error: null,
    });
  });

  router.post("/givepermission", async (req, res) => {
    let DoctorID = req.body.doctorID;
    if (/^\d{12}$/.test(DoctorID)) {
      User.findOne(
        {
          _id: DoctorID,
        },
        (err, found) => {
          if (err || !found)
            return res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: null,
              error: res.__("messages.notFound"),
            });
          else {
            User.findOne(
              {
                _id: req.body.nom ? req.user.nom : req.user._id,
              },
              function (err, doc) {
                if (err)
                  return res.render("user/userPortal", {
                    permission: {},
                    reports: [],
                    prescs: [],
                    message: null,
                    error: res.__("messages.error"),
                  });
                let user = doc;
                console.log(user.permission);
                console.log(DoctorID);
                user.permission.push(DoctorID);
                console.log(user.permission);
                user.save();
                res.render("user/userPortal", {
                  permission: {},
                  reports: [],
                  prescs: [],
                  message: res.__("messages.permGranted"),
                  error: null,
                });
              }
            );
          }
        }
      );
    } else {
      User.findOne(
        {
          username: DoctorID,
        },
        (err, found) => {
          if (err || !found)
            return res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: null,
              error: res.__("messages.notFound"),
            });
          else {
            User.findOne(
              {
                _id: req.body.nom ? req.user.nom : req.user._id,
              },
              function (err, doc) {
                if (err)
                  return res.render("user/userPortal", {
                    permission: {},
                    reports: [],
                    prescs: [],
                    message: null,
                    error: res.__("messages.error"),
                  });
                let user = doc;
                console.log(user.permission);
                console.log(found._id);

                user.permission.push(found._id);
                console.log(user.permission);
                user.save();
                res.render("user/userPortal", {
                  permission: {},
                  reports: [],
                  prescs: [],
                  message: res.__("messages.permGranted"),
                  error: null,
                });
              }
            );
          }
        }
      );
    }
  });

  router.get("/revokepermission", async (req, res) => {
    res.render("user/userPortal", {
      permission: {},
      reports: [],
      prescs: [],
      message: null,
      error: null,
    });
  });

  router.post("/revokepermission", async (req, res) => {
    let DoctorID = req.body.doctorID;
    if (/^\d{12}$/.test(DoctorID)) {
      User.findOne(
        {
          _id: req.body.nom ? req.user.nom : req.user._id,
        },
        (err, user) => {
          if (err)
            return res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: null,
              error: res.__("messages.error"),
            });
          let idx = user.permission.indexOf(DoctorID);
          if (idx != -1) {
            console.log(user.permission);
            console.log(idx);
            user.permission.splice(idx, 1);
            console.log(user.permission);
            user.save();
            res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: res.__("messages.permRevoked"),
              error: null,
            });
          } else {
            res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: null,
              error: res.__("messages.notFound"),
            });
          }
        }
      );
    } else {
      User.findOne({ username: DoctorID }, (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          docid = doc._id;
          console.log(docid);
        }
      });
      User.findOne(
        {
          _id: req.body.nom ? req.user.nom : req.user._id,
        },
        (err, user) => {
          if (err)
            return res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: null,
              error: res.__("messages.error"),
            });
          let idx = user.permission.indexOf(docid);
          if (idx != -1) {
            console.log(user.permission);
            console.log(docid);
            console.log(idx);
            user.permission.splice(idx, 1);
            console.log(user.permission);
            user.save();
            res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: res.__("messages.permRevoked"),
              error: null,
            });
          } else {
            res.render("user/userPortal", {
              permission: {},
              reports: [],
              prescs: [],
              message: null,
              error: res.__("messages.notFound"),
            });
          }
        }
      );
    }
  });

  router.get("/getpermission", async (req, res) => {
    res.render("user/userPortal", {
      permission: {},
      reports: [],
      prescs: [],
      rewards: {},
      message: null,
      error: null,
    });
  });

  router.post("/getpermission", async (req, res) => {
    User.findOne(
      {
        username: req.user.username,
      },
      "permission"
    )
      .populate("permission", "name org type")
      .exec((err, info) => {
        if (err)
          return res.render("user/userPortal", {
            permission: {},
            reports: [],
            prescs: [],
            message: null,
            error: res.__("messages.error"),
          });
        res.render("user/userPortal", {
          permission: info.permission,
          reports: [],
          prescs: [],
          message: null,
          error: null,
        });
      });
  });

  router.get("/reporthistory", async (req, res) => {
    res.render("user/userPortal");
    var data = [
      {
        TxId:
          "9084b3e0515c02d2a04549bc5b967894a130f4fa77e6e7165fdfa295a4483268",
        Value: {
          recordID: "992232556067",
          name: "Vadin Bhinge",
          dob: "23/08/1972",
          address:
            "Plot No 203 2nd Floor, Bldg 54-b, Drug House, Procter Road, Nr Grant Hotel, Grant RoadCity Pune,Maharashtra ",
          report:
            "Diabetes: Type 1, Hypertension: Primary, Thyroid conditions: None",
          links: "",
          prescription: "",
          addedby: "",
        },
        Timestamp: "2020-08-02 11:41:20.738 +0000 UTC",
        IsDelete: "false",
      },
      {
        TxId:
          "a90c4c7da5f9a096a9e761c1a22568019644dc4f139bc2c4074ffa5508ae4d1c",
        Value: {
          recordID: "992232556067",
          name: "Vadin Bhinge",
          dob: "23/08/1972",
          address: "Plot No 203 2nd Floor, Bnks",
          prescription: "",
          addedby: "",
        },
        Timestamp: "2020-08-02 11:55:49.592 +0000 UTC",
        IsDelete: "false",
      },
    ];
    var name = data[0]["Value"]["name"];
    var dob = data[0]["Value"]["dob"];
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream("naman2.pdf"));
    doc.fontSize(20);
    doc.text(`Name : ${name}`, {
      width: 410,
      align: "left",
    });

    doc.moveDown();
    doc.fontSize(20);
    doc.text(`Date of Birth: ${dob}`, {
      width: 410,
      align: "left",
    });

    data.forEach((item) => {
      doc.moveDown();
      doc.fontSize(20);
      doc.text(item.Timestamp, {
        width: 410,
        align: "left",
      });
      doc.moveDown();
      doc.fontSize(20);
      doc.text(item.Value.report, {
        width: 410,
        align: "left",
      });
    });

    doc.end();
  });
});

router.post("/reporthistory", async (req, res) => {
  let medicalID = req.body.nom ? req.user.nom : req.user._id;
  let doc = {
    medicalID: medicalID,
  };
  ehrUser.getRecord(req, res, doc);
});

router.get("/prescriptionhistory", async (req, res) => {
  res.render("user/userPortal");
});

router.post("/prescriptionhistory", async (req, res) => {
  let medicalID = req.body.nom ? req.user.nom : req.user._id;
  let doc = {
    medicalID: medicalID,
  };
  ehrUser.getMedicineRecord(req, res, doc);
});

router.get("/togglerewards", async (req, res) => {
  res.render("user/userPortal", {
    permission: {},
    reports: [],
    prescs: [],
    rewards: {},
    message: null,
    error: null,
  });
});

router.post("/togglerewards", async (req, res) => {
  let newReward = null;
  User.findOne(
    {
      _id: req.user._id,
    },
    (err, foundUser) => {
      if (err) {
        console.log(err);
      }
      foundUser.rewards.enabled = !foundUser.rewards.enabled;
      foundUser.save();
      newReward = foundUser.rewards.enabled;
    }
  );
  async function getBalance(addr) {
    const response = await ethInstance.get("/balanceOf/" + addr);
    return response.data.data[0].uint256;
  }
  const walletBalance = await getBalance(req.user.rewards.ethereumAddress);
  const rewardDetails = {
    ethAddr: req.user.rewards.ethereumAddress,
    enabled: newReward,
    balance: walletBalance,
  };
  res.render("user/userPortal", {
    permission: {},
    reports: [],
    prescs: [],
    rewards: rewardDetails,
    message: null,
    error: null,
  });
});

// //SMS Functionality control route
//  router.post('/sms', async (req, res) => {
//      const number = req.body.From
//      const messageBody = req.body.Body
//      if (messageBody != 'GET REPORT' || messageBody != 'get report' || messageBody != 'Get Report') {
//          const messageSplit = messageBody.split(' ')
//          const doctorId = messageSplit[0]
//          const operation = messageSplit[1]
//          if (operation == 'give' || operation == 'GIVE' || operation == 'Give') {
//              const response = await givePermission(number, doctorId)
//              if (response) {
//                  sendSMS(number, operation)
//              }
//          } else if (operation == 'revoke' || operation == 'Revoke' || operation == 'REVOKE') {
//              const response = await revokePermission(number, doctorId)
//              if (response) {
//                  sendSMS(number, operation)
//              }
//          } else {
//              sendFailureSMS(number)
//          }
//      } else if (messageBody == 'GET REPORT' || messageBody == 'get report' || messageBody == 'Get Report') {
//          sendReport(number)
//      }
//  })

module.exports = router;
