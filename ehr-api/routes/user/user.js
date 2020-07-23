// User Portal Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrUser = require('../../FabricHelperUser');
const twilioConfig = require('./twilioConfig');
const client = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken)
const User = require('../../models/user');

//SMS Functions
async function givePermission(number, doctorId){
    User.findOne({phone: number}, (err, foundUser) => {
        if(err){
            return false
        }
        let user = foundUser;
        user.permission.push(doctorId)
        user.save()
    })
    .then(() => { return true })
    .catch((err) => {return false})
}

async function revokePermission(number, doctorId){
    User.findOne({phone: number}, (err, foundUser) => {
        if(err){
            return false
        }
        let user = foundUser;
        for(let i = 0; i<user.permission.length; i++){
            if(user.permission[i] == doctorId){
                user.permission.splice(i, 1);
                user.save()
        } else {
            return false
            }
        }
    })
    .then(() => { return true })
    .catch((err) => { return false })
}

async function sendReport(number){
    User.findOne({phone: number}, (err, foundUser) => {
        if(err){
            return false
        }
        const aadhaarNo = foundUser._id
        const doc = {
            'medicalID' : aadhaarNo,
            'sms': true
        }
        const result = await ehrUser.getReport(doc)
        if(result){
            client.messages
                .create({
                    body: 'Medical Report as follows'+result,
                    messagingServiceSid: twilioConfig.messagingSid,
                    to: number
                })
                .then((message) => console.log(message.sid))
                .catch((err) => console.log(err))
        }
    })
}

async function sendGiveSuccessSMS(number){
    client.messages
    .create({
        body: 'Successfully granted permission!',
        messagingServiceSid: twilioConfig.messagingSid,
        to: number
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err))
}
async function sendRevokeSuccessSMS(){
    client.messages
    .create({
        body: 'Successfully revoked permission!',
        messagingServiceSid: twilioConfig.messagingSid,
        to: number
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err))
}

async function sendFailureSMS(number){
    client.message
        .create({
            body: 'Oops something went wrong! Try again later',
            messagingServiceSid: twilioConfig.messagingSid,
            to: number
        })
}

async function sendSMS(number, operation){
    if(operation=='give' || operation=='GIVE' || operation=='Give'){
        sendGiveSuccessSMS(number)
    } else if(operation=='revoke' || operation=='Revoke' || operation=='REVOKE'){
        sendRevokeSuccessSMS(number)
    } else {
        console.log('Something failed')
    }
}

//All routes have prefix '/user'
router.get('/login', (req, res) => {
    res.render('user/user-login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/user/login'
}), (req, res) => {});

router.get('/', (req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: []
    });
});

router.post('/givepermission', (req, res) => {
    let DoctorID = req.body.doctorID;
    User.findOne({
        username: req.user.username
    }, function (err, doc) {
        let user = doc;
        user.permission.push(DoctorID);
        user.save();
        console.log(user);
        res.render('user/userPortal', {
            permission: {},
            reports: [],
            prescs: []
        });
    });
});

router.get('/revokepermission', (req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: []
    });
})

router.post('/revokepermission', (req, res) => {
    let DoctorID = req.body.doctorID;
    User.findOne({
        username: req.user.username
    }, function (err, user) {
        let idx = user.permission.indexOf(DoctorID);
        if (idx != -1) {
            user.permission.splice(i, 1);
            user.save()
        } else {
            console.log('Not found');
        }
        res.redirect('/user');
    });
});

router.get('/getpermission', (req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: []
    });
});

router.post('/getpermission', (req, res) => {
    User.findOne({
            username: req.user.username
        }, 'permission')
        .populate('permission', 'name org type')
        .exec((err, info) => {
            res.render('user/userPortal', {
                permission: info.permission,
                reports: [],
                prescs: []
            });
        })
});

router.get('/reporthistory', (req, res) => {
    res.render('user/userPortal');
});

router.post('/reporthistory', (req, res) => {
    let medicalID = req.user._id;
    let doc = {
        'medicalID': medicalID
    }
    console.log(medicalID);
    ehrUser.getRecord(req, res, doc);
});

router.get('/prescriptionhistory', (req, res) => {
    res.render('user/userPortal');
});

router.post('/prescriptionhistory', (req, res) => {
    let medicalID = req.user._id;
    let doc = {
        'medicalID': medicalID
    }
    ehrUser.getMedicineRecord(req, res, doc);
});

//SMS Functionality control route
router.post('/sms', async(req, res) => {
    const number = req.body.From
    const messageBody = req.body.Body
    if(messageBody != 'GET REPORT' || messageBody != 'get report' || messageBody != 'Get Report'){
        const messageSplit = messageBody.split(' ')
        const doctorId = messageSplit[0]
        const operation = messageSplit[1]
        if(operation=='give' || operation=='GIVE' || operation=='Give'){
            const response = await givePermission(number, doctorId)
            if(response){
                sendSMS(number, operation)
            }
        } else if (operation=='revoke' || operation=='Revoke' || operation=='REVOKE') {
            const response = await revokePermission(number, doctorId)
            if(response){
                sendSMS(number, operation)
            }
        } else {
            sendFailureSMS(number)
        }
    } else if(messageBody == 'GET REPORT' || messageBody == 'get report' || messageBody == 'Get Report') {
        sendReport(number)
    }
})



module.exports = router;