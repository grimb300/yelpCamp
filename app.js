// Require the packages
var express               = require('express'),
    mongoose              = require('mongoose'),
    passport              = require('passport'),
    bodyParser            = require('body-parser'),
    LocalStrategy         = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    expressSession        = require('express-session'),
    methodOverride        = require('method-override'),
    middleware            = require('./middleware'),
    flash                 = require('connect-flash');

// Require the routes
var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes    = require('./routes/comments'),
    indexRoutes      = require('./routes/index');

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

// passport setup
app.use(expressSession({
    secret: 'I have a twelve inch cock his name is Stewey',
    resave: false,
    saveUninitialized: false
}));
// these must come after the expressSession statement
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Method override, so we can use PUT and DELETE methods
app.use(methodOverride("_method"));

// Flash module
app.use(flash());

// Seed the db
// var seedDB = require("./seeds");
// seedDB();

// Middleware to pass info from the request to the response
// Another strange dependency, this must be done before the routes setup below
app.use(middleware.reqResPassthrough);

// routes setup
// Another strange dependency, this must be done after the copying of user info above
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);

// Start the server
app.listen(3000, () => console.log('App listening on port 3000'));
