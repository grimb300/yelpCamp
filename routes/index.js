var express    =  require('express'),
    passport   = require('passport'),
    middleware = require('../middleware');
var router = express.Router();
var User = require('../models/user');

// Landing page
router.get("/", function(req, res) {
    // console.log("running GET /");
    res.render('landing');
});

///////////////////////////
// Authoriziation routes //
///////////////////////////

// REGISTER
router.get('/register', function(req, res) {
    // console.log("running GET /register");
    // render the new user form
    res.render('register');
});
router.post('/register', function(req, res) {
    // console.log("running POST /register");
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if(err) {
            req.flash('error', err.message);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function() {
                req.flash('success', 'Welcome to YelpCamp '+req.body.username+'!');
                res.redirect('/campgrounds');
            });
        }
    });
});

// LOGIN
router.get('/login', function(req, res) {
    // console.log("running GET /login");
    // render the login form
    res.render('login');
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    successFlash: 'Successfully logged in!',
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res) {
    // console.log("running POST /login (do not expect to see this)");
});

// LOGOUT
router.get('/logout', function(req, res) {
    // console.log("running GET /logout");
    // logout and redirect to the root route
    req.logout();
    req.flash('success', 'Successfully logged out, goodbye!')
    res.redirect('/');
});

// Verify that user is logged in and render the secret if successful
router.get('/secret', middleware.isLoggedIn, function(req, res) {
    // console.log("running GET /secret");
    res.render('secret');
});

module.exports = router;