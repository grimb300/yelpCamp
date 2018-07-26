var express = require('express');
var router = express.Router();
var Campground = require('../models/campground.js')

// RESTful ROUTES campgrounds
// name    url                    verb     desc
// ------------------------------------------------------------------------------------
// INDEX   /campgrounds           GET      Display a list of all campgrounds
// NEW     /campgrounds/new       GET      Display form to create new campground
// CREATE  /campgrounds           POST     Add campground to DB and redirect somewhere
// SHOW    /campgrounds/:id       GET      Display info on one campground
// EDIT    /campgrounds/:id/edit  GET      Display edit form from one campground
// UPDATE  /campgrounds/:id       PUT      Update one campground and redirect somewhere
// DESTROY /campgrounds/:id       DELETE   Delete one campground and redirect somethere

// Since this module is called with "/campgrounds", we don't nee to use that in the route
// INDEX
router.get('/', function(req, res) {
    // console.log("running GET /campgrounds");
    // Get all campgrounds out of the database
    Campground.find({}, function(err, campgrounds) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render('campgrounds/index', { campgrounds: campgrounds });
        }
    });
});

// NEW campground
router.get('/new', isLoggedIn, function(req,res) {
    // console.log("running GET /campgrounds/new");
    res.render('campgrounds/new');
});

// CREATE campground
router.post('/', isLoggedIn, function(req, res) {
    // console.log("running POST /campgrounds");
    // Get the data from the request
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user.id,
        username: req.user.username
    };
    var newCampground = {
        name: name,
        image: image,
        description: description,
        author: author
    };

    // Add it to the database
    Campground.create( newCampground, function(err, campground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // Redirect to the campground listing
            res.redirect('/campgrounds');
        }
    });
});

// SHOW
router.get('/:id', function(req,res) {
    // console.log("running GET /campgrounds/:id");
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render('campgrounds/show', { campground: foundCampground });
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