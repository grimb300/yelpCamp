// Get the database models
var Campground = require('../models/campground'),
    Comment    = require('../models/comment');
    
// All the middleware goes  here
var middlewareObj = {};

// Check login status
middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Check campground ownership
middlewareObj.isCampgroundOwner = function(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()) {
        // If so, find the campground
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err) {
                // If error, go back
                console.log(err);
                res.redirect("back");
            } else {
                // Does user own the campground?
                if(foundCampground.author.id.equals(req.user._id)) {
                    // If so, execute the next thing
                    next();
                } else {
                    // If not, go back
                    console.log('NOT OWNER, GO BACK!');
                    res.redirect('back');
                }
            }
        });
    } else {
        // If not, go back
        console.log('NOT LOGGED IN, GO BACK!');
        res.redirect('back');
    }
};

// Check comment ownership
middlewareObj.isCommentOwner = function(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()) {
        // If so, find the comment
        Comment.findById(req.params.commentid, function(err, foundComment) {
            if(err) {
                // If error, go back
                console.log(err);
                res.redirect("back");
            } else {
                // Does user own the comment?
                if(foundComment.author.id.equals(req.user._id)) {
                    // If so, execute the next thing
                    next();
                } else {
                    // If not, go back
                    console.log('NOT OWNER, GO BACK!');
                    res.redirect('back');
                }
            }
        });
    } else {
        // If not, go back
        console.log('NOT LOGGED IN, GO BACK!');
        res.redirect('back');
    }
};

// Pass user info from all requests to all responses
middlewareObj.userInfoPassthrough = function(req, res, next) {
    // console.log("copying req.user to res.locals.currentUser");
    res.locals.currentUser = req.user;
    next();
};

module.exports = middlewareObj;