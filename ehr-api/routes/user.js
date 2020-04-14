const express = require('express');
const router = express.Router();

router.use('/', require('./user/user'));
router.use('/register-user', require('./user/register-user'))
router.use('/appointment', require('./user/appointment'))

module.exports = router;
