const express = require("express");
const router = express.Router();
const passport = require("passport");
const ehrUser = require("../../FabricHelperUser");
const User = require("../../models/user");

//All routes have prefix /app
router.post("/login", passport.authenticate("local", {}), (req, res) => {
  if (req.user) {
    res.send({
      user: req.user
    });
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;