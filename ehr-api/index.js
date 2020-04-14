const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const uri = "mongodb+srv://test:<password>@cluster0-2czvc.mongodb.net/ehr?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json());
app.use(flash());
app.use(require('express-session')({
    secret: 'India is my country I love my country',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const organisationRoutes = require('./routes/organisations');
const userRoutes = require('./routes/user');

app.use('/organisation', organisationRoutes);
app.use('/user', userRoutes);

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/professional', function(req, res) {
    res.render('professionalIndex');
});

app.get('/register', function(req, res) {
    res.render('register');
});
app.post('/register', function(req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/');
            })
        }
    });
});

app.listen(3000, function() {
    console.log('Server running on port 3000')
});
