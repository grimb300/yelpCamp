// Require the packages
var express               = require('express'),
    mongoose              = require('mongoose'),
    passport              = require('passport'),
    bodyParser            = require('body-parser'),
    LocalStrategy         = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    expressSession        = require('express-session');

// Require the db models
var Campground = require('./models/campground'),
    Comment    = require('./models/comment'),
    User       = require('./models/user');

// database setup
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });


// app setup
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(expressSession({
    secret: 'I have a twelve inch cock his name is Stewey',
    resave: false,
    saveUninitialized: false
}));
// these must come after the expressSession statement
app.use(passport.initialize());
app.use(passport.session());

// passport setup
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Seed the db
var seedDB = require("./seeds");
seedDB();

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
//
// RESTful ROUTES comments
// name    url                                 verb     desc
// ------------------------------------------------------------------------------------
// NEW     /campgrounds/:id/comments/new       GET      Display form to create new comment
// CREATE  /campgrounds/:id/comments           POST     Add comment to DB, associate it with the campground,
//                                                      and redirect somewhere
//
// REST - A mapping from HTTP to CRUD
//
// CREATE
// READ
// UPDATE
// DESTROY


app.get("/", function(req, res) {
    res.render('landing');
});

// INDEX
app.get('/campgrounds', function(req, res) {
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
app.get('/campgrounds/new', function(req,res) {
    res.render('campgrounds/new');
});

// CREATE campground
app.post('/campgrounds', function(req, res) {
    // Get the data from the request
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = { name: name, image: image, description: description };

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
app.get('/campgrounds/:id', function(req,res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render('campgrounds/show', { campground: foundCampground });
        }
    });
});

//////////////////
// Comments routes
//////////////////

// NEW comment
app.get('/campgrounds/:id/comments/new', function(req,res) {
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
app.post('/campgrounds/:id/comments', function(req,res) {
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
                    // connect comment to campground
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

///////////////////////////
// Authoriziation routes //
///////////////////////////

// REGISTER
app.get('/register', function(req, res) {
    // render the new user form
    res.render('register');
});
app.post('/register', function(req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.render('register');
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/secret');
            });
        }
    });
});

// LOGIN
app.get('/login', function(req, res) {
    // render the login form
    res.render('login');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), function(req, res) {
});

// LOGOUT
app.get('/logout', function(req, res) {
    // logout and redirect to the root route
    req.logout();
    res.redirect('/');
});

// Verify that user is logged in and render the secret if successful
app.get('/secret', isLoggedIn, function(req, res) {
    res.render('secret');
});
// middleware to check login status
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Start the server
app.listen(3000, () => console.log('App listening on port 3000'));
