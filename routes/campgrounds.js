var express    = require('express'),
    middleware = require('../middleware');
var router = express.Router();
var Campground = require('../models/campground'),
    Comment    = require('../models/comment');

// RESTful ROUTES campgrounds (common url base is "/campgrounds")
// name    url       verb     desc
// ------------------------------------------------------------------------------------
// INDEX   /         GET      Display a list of all campgrounds
// NEW     /new      GET      Display form to create new campground
// CREATE  /         POST     Add campground to DB and redirect somewhere
// SHOW    /:id      GET      Display info on one campground
// EDIT    /:id/edit GET      Display edit form for one campground
// UPDATE  /:id      PUT      Update one campground and redirect somewhere
// DESTROY /:id      DELETE   Delete one campground and redirect somethere

// Since this module is called with "/campgrounds", we don't nee to use that in the route
// INDEX
router.get('/', function(req, res) {
    // console.log("running GET /campgrounds");
    // Get all campgrounds out of the database
    Campground.find({}, function(err, campgrounds) {
        if(err) {
            // Seems that this may cause a loop, if you get one error you may always get an error
            req.flash('error', 'Error accessing campgrounds!');
            res.redirect("/campgrounds");
        } else {
            res.render('campgrounds/index', { campgrounds: campgrounds });
        }
    });
});

// NEW campground
router.get('/new', middleware.isLoggedIn, function(req,res) {
    // console.log("running GET /campgrounds/new");
    res.render('campgrounds/new');
});

// CREATE campground
router.post('/', middleware.isLoggedIn, function(req, res) {
    // console.log("running POST /campgrounds");
    // Get the data from the request
    var newCampground = req.body.campground;
    newCampground.author = {
        id: req.user.id,
        username: req.user.username
    };
    
    // Add it to the database
    Campground.create( newCampground, function(err, campground) {
        if(err) {
            req.flash('error', 'Error creating new campground!');
            res.redirect("back");
        } else {
            // Redirect to the campground show page
            req.flash('success', campground.name+' created!');
            res.redirect('/campgrounds/'+campground._id);
        }
    });
});

// SHOW
router.get('/:id', function(req,res) {
    // console.log("running GET /campgrounds/:id");
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash('error', 'Error accessing campgroundId: '+req.params.id);
            res.redirect("/campgrounds");
        } else {
            res.render('campgrounds/show', { campground: foundCampground });
        }
    });
});

// EDIT
router.get('/:id/edit', middleware.isCampgroundOwner, function(req,res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        // Colt claims we don't need to check the err here because the middleware
        // already does it.
        // I'm not sure I agree because it would be more defensive to check again.
        res.render('campgrounds/edit', { campground: foundCampground });
    });
});

// UPDATE  /campgrounds/:id       PUT      Update one campground and redirect somewhere
router.put('/:id', middleware.isCampgroundOwner, function(req, res) {
    // console.log("running POST /campgrounds");

    // Get the data from the request
    // var editedCampground = req.body.campground;
    // editedCampground.author = {
    //     id: req.user.id,
    //     username: req.user.username
    // };

    // Update it in the database
    Campground.findByIdAndUpdate( req.params.id, req.body.campground, function(err, campground) {
        // Colt claims we don't need to check the err here because the middleware
        // already does it.
        // I'm not sure I agree because it would be more defensive to check again.

        // Redirect to the campground listing
        req.flash('success', 'Campground '+campground.name+' successfully updated!');
        res.redirect('/campgrounds/'+req.params.id);
    });
});

// DESTROY
router.delete('/:id', middleware.isCampgroundOwner, function(req, res) {
    // Find the campground by its id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash('error', 'Error accessing campgroundId: '+req.params.id);
            res.redirect('back');
        } else {
            // Delete each comment
            foundCampground.comments.forEach(function(foundComment) {
                console.log(foundComment);
                Comment.findByIdAndRemove(foundComment._id, function(err) {
                        if(err) {
                            req.flash('error', 'Error accessing commentId: '+foundComment._id);
                        }
                });
            });

            // Then delete the campground
            foundCampground.remove();

            // Then redirect to the campground list
            req.flash('success', 'Successfully removed campground '+foundCampground.name);
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;