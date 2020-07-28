// User Portal Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ehrUser = require('../../FabricHelperUser');
const twilioConfig = require('./twilioConfig');
//const client = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken)
const User = require('../../models/user');
const axios = require('axios');
const config = require('../ethConfig');
const ethInstance = axios.create({
    baseURL: config.api+config.contract,
    timeout: 5000,
    headers: {'X-API-KEY' : config.key}
})

//SMS Functions
// async function givePermission(number, doctorId) {
//     User.findOne({
//             phone: number
//         }, (err, foundUser) => {
//             if (err) {
//                 return false
//             }
//             let user = foundUser;
//             user.permission.push(doctorId)
//             user.save()
//         })
//         .then(() => {
//             return true
//         })
//         .catch((err) => {
//             return false
//         })
// }

// async function revokePermission(number, doctorId) {
//     User.findOne({
//             phone: number
//         }, (err, foundUser) => {
//             if (err) {
//                 return false
//             }
//             let user = foundUser;
//             let idx = user.permission.indexOf(doctorId);
//             if (idx != -1) {
//                 user.permission.splice(i, 1);
//                 user.save()
//             } else {
//                 return false
//             }
//         })
//         .then(() => {
//             return true
//         })
//         .catch((err) => {
//             return false
//         })
// }

// async function sendReport(number) {
//     User.findOne({
//         phone: number
//     }, (err, foundUser) => {
//         if (err) {
//             return false
//         }
//         const aadhaarNo = foundUser._id
//         const doc = {
//             'medicalID': aadhaarNo,
//             'sms': true
//         }
//         const result = await (ehrUser.getReport(doc));
//         if (result) {
//             client.messages
//                 .create({
//                     body: 'Medical Report as follows' + result,
//                     messagingServiceSid: twilioConfig.messagingSid,
//                     to: number
//                 })
//                 .then((message) => console.log(message.sid))
//                 .catch((err) => console.log(err))
//         }
//     })
// }

// async function sendGiveSuccessSMS(number) {
//     client.messages
//         .create({
//             body: 'Successfully granted permission!',
//             messagingServiceSid: twilioConfig.messagingSid,
//             to: number
//         })
//         .then((message) => console.log(message.sid))
//         .catch((err) => console.log(err))
// }
// async function sendRevokeSuccessSMS() {
//     client.messages
//         .create({
//             body: 'Successfully revoked permission!',
//             messagingServiceSid: twilioConfig.messagingSid,
//             to: number
//         })
//         .then((message) => console.log(message.sid))
//         .catch((err) => console.log(err))
// }

// async function sendFailureSMS(number) {
//     client.message
//         .create({
//             body: 'Oops something went wrong! Try again later',
//             messagingServiceSid: twilioConfig.messagingSid,
//             to: number
//         })
// }

// async function sendSMS(number, operation) {
//     if (operation == 'give' || operation == 'GIVE' || operation == 'Give') {
//         sendGiveSuccessSMS(number)
//     } else if (operation == 'revoke' || operation == 'Revoke' || operation == 'REVOKE') {
//         sendRevokeSuccessSMS(number)
//     } else {
//         console.log('Something failed')
//     }
// }


//All routes have prefix '/user'
router.get('/login', (req, res) => {
    res.render('user/user-login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/user/login'
}), (req, res) => {});

router.get('/', async(req, res) => {
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: req.user.rewards.enabled,
        balance: walletBalance
    }
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: [],
        rewards: rewardDetails,
        message: null,
        error: null
    });
});

router.post('/givepermission', async(req, res) => {
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: req.user.rewards.enabled,
        balance: walletBalance
    }
    let DoctorID = req.body.doctorID;
    User.findOne({
        _id: DoctorID
    }, (err, found) => {
        if (err || !found)
            return res.render('user/userPortal', {
                permission: {},
                reports: [],
                prescs: [],
                message: null,
                rewards: rewardDetails,
                error: res.__('messages.notFound')
            });
        else {
            User.findOne({
                username: req.user.username
            }, function (err, doc) {
                if (err)
                    return res.render('user/userPortal', {
                        permission: {},
                        reports: [],
                        prescs: [],
                        rewards: {},
                        message: null,
                        error: res.__('messages.error')
                    });
                let user = doc;
                user.permission.push(DoctorID);
                user.save();
                res.render('user/userPortal', {
                    permission: {},
                    reports: [],
                    prescs: [],
                    rewards: {},
                    message: res.__('messages.permGranted'),
                    error: null
                });
            });
        }
    });

});

router.get('/revokepermission', async(req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: [],
        rewards: {},
        message: null,
        error: null
    });
})

router.post('/revokepermission', async(req, res) => {
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: req.user.rewards.enabled,
        balance: walletBalance
    }
    let DoctorID = req.body.doctorID;
    User.findOne({
        username: req.user.username
    }, (err, user) => {
        if (err)
            return res.render('user/userPortal', {
                permission: {},
                reports: [],
                prescs: [],
                message: null,
                rewards: rewardDetails,
                error: res.__('messages.error')
            });
        let idx = user.permission.indexOf(DoctorID);
        if (idx != -1) {
            user.permission.splice(idx, 1);
            user.save()
            res.render('user/userPortal', {
                permission: {},
                reports: [],
                prescs: [],
                rewards: rewardDetails,
                message: res.__('messages.permRevoked'),
                error: null
            })
        } else {
            res.render('user/userPortal', {
                permission: {},
                reports: [],
                prescs: [],
                rewards: rewardDetails,
                message: null,
                error: res.__('messages.notFound')
            })
        }
    });
});

router.get('/getpermission', async(req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: [],
        rewards: {},
        message: null,
        error: null
    });
});

router.post('/getpermission', async(req, res) => {
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: req.user.rewards.enabled,
        balance: walletBalance
    }
    User.findOne({
            username: req.user.username
        }, 'permission')
        .populate('permission', 'name org type')
        .exec((err, info) => {
            if (err)
                return res.render('user/userPortal', {
                    permission: {},
                    reports: [],
                    prescs: [],
                    rewards: rewardDetails,
                    message: null,
                    error: res.__('messages.error')
                });
            res.render('user/userPortal', {
                permission: info.permission,
                reports: [],
                prescs: [],
                rewards: rewardDetails,
                message: null,
                error: null
            });
        })
});


router.get('/reporthistory', async(req, res) => {
    res.render('user/userPortal');
});

router.post('/reporthistory', async(req, res) => {
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: req.user.rewards.enabled,
        balance: walletBalance
    }
    let medicalID = req.user._id;
    let doc = {
        'medicalID': medicalID
    }
    ehrUser.getRecord(req, res, doc, rewardDetails);
});

router.get('/prescriptionhistory', async(req, res) => {
    res.render('user/userPortal');
});

router.post('/prescriptionhistory', async(req, res) => {
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: req.user.rewards.enabled,
        balance: walletBalance
    }
    let medicalID = req.user._id;
    let doc = {
        'medicalID': medicalID
    }
    ehrUser.getMedicineRecord(req, res, doc, rewardDetails);
});

router.get('/togglerewards', async(req, res) => {
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: [],
        rewards: {},
        message: null,
        error: null
    });
})

router.post('/togglerewards', async(req, res) => {
    let newReward = null
    User.findOne({_id: req.user._id}, (err, foundUser) => {
        if(err){
            console.log(err)
        }
        foundUser.rewards.enabled = !foundUser.rewards.enabled
        foundUser.save()
        newReward = foundUser.rewards.enabled
    })
    async function getBalance(addr){
        const response = await ethInstance.get('/balanceOf/'+addr)
        return response.data.data[0].uint256
    }
    const walletBalance = await getBalance(req.user.rewards.ethereumAddress)
    const rewardDetails = {
        ethAddr: req.user.rewards.ethereumAddress,
        enabled: newReward,
        balance: walletBalance
    }
    res.render('user/userPortal', {
        permission: {},
        reports: [],
        prescs: [],
        rewards: rewardDetails,
        message: null,
        error: null
    });
})

//SMS Functionality control route
// router.post('/sms', async (req, res) => {
//     const number = req.body.From
//     const messageBody = req.body.Body
//     if (messageBody != 'GET REPORT' || messageBody != 'get report' || messageBody != 'Get Report') {
//         const messageSplit = messageBody.split(' ')
//         const doctorId = messageSplit[0]
//         const operation = messageSplit[1]
//         if (operation == 'give' || operation == 'GIVE' || operation == 'Give') {
//             const response = await givePermission(number, doctorId)
//             if (response) {
//                 sendSMS(number, operation)
//             }
//         } else if (operation == 'revoke' || operation == 'Revoke' || operation == 'REVOKE') {
//             const response = await revokePermission(number, doctorId)
//             if (response) {
//                 sendSMS(number, operation)
//             }
//         } else {
//             sendFailureSMS(number)
//         }
//     } else if (messageBody == 'GET REPORT' || messageBody == 'get report' || messageBody == 'Get Report') {
//         sendReport(number)
//     }
// })



module.exports = router;