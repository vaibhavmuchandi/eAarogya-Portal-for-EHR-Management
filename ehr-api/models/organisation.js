const mongoose = require('mongoose');

let OrgSchema = mongoose.Schema({
    name: String,
    state: String,
    district: String,
    location: String,
    pin: String,
    phone: String,
    mobile: String,
    email: String,
    regNo: String,
    regFile: String
});

module.exports = mongoose.model('Organisation', OrgSchema);