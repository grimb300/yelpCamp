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
    req.flash('error', 'You must be logged in to perform that action!')
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
                req.flash('error', 'Error accessing campgroundId: '+req.params.id);
                res.redirect("back");
            } else {
                // Does user own the campground?
                if(foundCampground.author.id.equals(req.user._id)) {
                    // If so, execute the next thing
                    next();
                } else {
                    // If not, go back
                    req.flash('error', 'You do not have permission to perform that action!');
                    res.redirect('back');
                }
            }
        });
    } else {
        // If not, go to the login page
        req.flash('error', 'You must be logged in to perform that action!')
        res.redirect('/login');
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
                req.flash('error', 'Error accessing commentId: '+req.params.commentid);
                res.redirect("back");
            } else {
                // Does user own the comment?
                if(foundComment.author.id.equals(req.user._id)) {
                    // If so, execute the next thing
                    next();
                } else {
                    // If not, go back
                    req.flash('error', 'You do not have permission to perform that action!');
                    res.redirect('back');
                }
            }
        });
    } else {
        // If not, go to the login page
        req.flash('error', 'You must be logged in to perform that action!')
        res.redirect('/login');
    }
};

// Pass info from all requests to all responses
middlewareObj.reqResPassthrough = function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errorMsg = req.flash('error');
    res.locals.successMsg = req.flash('success');
    next();
};

module.exports = middlewareObj;