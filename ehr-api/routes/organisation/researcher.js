//Researcher Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
const Data = require('../../models/data')
//All routes have prefix '/organisation/researcher'

router.get('/login', function (req, res) {
    res.render('org/org-login', {
        org: 'researcher'
     });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/organisation/researcher',
    failureRedirect: '/organisation/researcher/login'
}), function (req, res) {});
router.use((req, res, next) => {
    if (req.user.type == 'researcher')
        next();
    else
        res.redirect('/');
});

router.get('/', function (req, res) {
    res.render('org/researchPortal',{
        org: 'researcher'
    });
});
 
router.get('/diseases', function(req, res){
    res.render('org/diseases');
});

router.get('/states', function(req, res){
    res.render('org/states');

});

router.get('/add-data', (req, res) => {
    res.render('org/add-data');
})

router.post('/add-data', (req, res) => {
    const Bstate = req.body.state
    const Bdisease = req.body.disease
    let data = new Data({
        state: Bstate,
        disease: Bdisease
    })
    data.save((err, data) => {
        if(err){
            console.log(err)
        }
        console.log(data)
        res.render('org/add-data')
    })
})


router.get('/patientsdata', (req, res) => {
    Data.find({}, (err, foundData) => {
        res.json(foundData)
    })
}); 

module.exports = router; 