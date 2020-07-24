// User Portal Routes
const express = require("express");
const router = express.Router();
const passport = require("passport");
const ehrUser = require("../../FabricHelperUser");
const User = require("../../models/user");

router.post("/applogin", passport.authenticate("local", {}), (req, res) => {
  if (req.user) {
    res.send("hi");
  } else {
    res.send("wrong");
  }
});

module.exports = router;
