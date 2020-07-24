//Researcher Routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs'); 
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
    res.render('diseases');

});


router.get('/patientsdata', (req, res) => {

    fs.readFile('./routes/organisation/data.json',  (err, json) => {
        if (err) throw err;
        let obj = JSON.parse(json);
        res.json(obj);
    });

}); 

module.exports = router; 