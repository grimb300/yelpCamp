var express    = require('express'),
    middleware = require('../middleware');
// Must add mergeParams: true to get the id
var router = express.Router({ mergeParams: true });
var Campground = require('../models/campground'),
    Comment    = require('../models/comment');

// RESTful ROUTES comments (common url base is "/campgrounds/:id/comments")
// name    url               verb     desc
// ------------------------------------------------------------------------------------
// NEW     /new              GET      Display form to create new comment
// CREATE  /                 POST     Add comment to DB, associate it with the campground,
//                                    and redirect somewhere
// EDIT    /:commentid/edit  GET      Display edit form for one comment
// UPDATE  /:commentid       PUT      Update one comment and redirect somewhere
// DESTROY /:commentid       DELETE   Delete one comment and redirect somethere

// Since this module is called with "/campgrounds/:id/comments", we don't nee to use that in the route
// NEW comment
router.get('/new', middleware.isLoggedIn, function(req,res) {
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
router.post('/', middleware.isLoggedIn, function(req,res) {
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

// EDIT comment
router.get('/:commentid/edit', middleware.isCommentOwner, function(req,res) {
    // This seems like it is overkill, it would be better if the comment
    // record had the information about the campground it was associated with

    // Find the campground
    Campground.findById(req.params.id, function(err, foundCampground) {
        // Find the comment
        Comment.findById(req.params.commentid, function(err, foundComment) {
            // Colt claims we don't need to check the err here because the middleware
            // already does it.
            // I'm not sure I agree because it would be more defensive to check again.
            res.render('comments/edit', { campground: foundCampground,
                                          comment: foundComment });
        });
    });
    
});

// UPDATE comment
router.put('/:commentid', middleware.isCommentOwner, function(req, res) {
    // console.log("running POST /campgrounds");

    // Get the data from the request
    // var editedComment = req.body.comment;
    // editedComment.author = {
    //     id: req.user.id,
    //     username: req.user.username
    // };

    // Update it in the database
    Comment.findByIdAndUpdate( req.params.commentid, req.body.comment, function(err, comment) {
        // Colt claims we don't need to check the err here because the middleware
        // already does it.
        // I'm not sure I agree because it would be more defensive to check again.

        // Redirect to the campground listing
        res.redirect('/campgrounds/'+req.params.id);
    });
});

// DESTROY comment
router.delete('/:commentid', middleware.isCommentOwner, function(req, res) {
    // Find the campground by its id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err) {
            console.log(err);
            res.render('back');
        } else {
            console.log("Campground before");
            console.log(foundCampground);
            // Find the comment by its id and remove  it
            Comment.findByIdAndRemove(req.params.commentid, function(err) {
                if(err) {
                    console.log(err);
                    res.redirect('back');
                } else {
                    res.redirect('/campgrounds/'+req.params.id);
                }
            });

            // Do I need to remove the reference in the comments array?
            console.log("Campground after");
            foundCampground.populate('comments');
            console.log(foundCampground);
        }
    });
});

module.exports = router;