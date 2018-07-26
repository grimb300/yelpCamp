var express = require('express');
// Must add mergeParams: true to get the id
var router = express.Router({ mergeParams: true });
var Campground = require('../models/campground'),
    Comment    = require('../models/comment');

// RESTful ROUTES comments
// name    url                                 verb     desc
// ------------------------------------------------------------------------------------
// NEW     /campgrounds/:id/comments/new       GET      Display form to create new comment
// CREATE  /campgrounds/:id/comments           POST     Add comment to DB, associate it with the campground,
//                                                      and redirect somewhere

// Since this module is called with "/campgrounds/:id/comments", we don't nee to use that in the route
// NEW comment
router.get('/new', isLoggedIn, function(req,res) {
    // console.log("running GET /campgrounds/:id/comments/new");
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render('comments/new', { campground: foundCampground });
        }
    });
});

// CREATE comment
router.post('/', isLoggedIn, function(req,res) {
    // console.log("running POST /campgrounds/:id/comments/new");
    // Lookup campground using id
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // creat new comment
            Comment.create(req.body.comment, function(err, newComment) {
                if(err) {
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
                    // connect comment to campground, adding username and id, must save after addition
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    foundCampground.comments.push(newComment);
                    foundCampground.save(function(err, updatedCampground) {
                        if(err) {
                            console.log(err);
                            res.redirect("/campgrounds");
                        } else {
                            // redirect to campground show page
                            res.redirect("/campgrounds/"+req.params.id);
                        }
                    });
                }
            });
        }
    });
});

// middleware to check login status
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;