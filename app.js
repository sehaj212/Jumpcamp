if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path=require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const { campgroundSchema , reviewSchema } = require('./schemas.js');                   //defining schemas inside schemas.js with joi 
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
// const Campground = require('./models/campground.js');                   //require the model
// const Review = require('./models/review');                              //require the model that we exported 
const User = require('./models/user');                                     //require the User model 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');                    //require the /campgrounds wala router 
const reviewRoutes = require('./routes/reviews');                            //require the /campgrounds/:id/reviews wala router 

const MongoDBStore = require("connect-mongo");                        //to store sessions

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl,{                   //name of our db is yelp-camp
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});

const db=mongoose.connection;                                   //taki bar bar mongoose.connection na likhna pade uski jagah db
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("database connected");
});

const app = express();

app.engine('ejs', ejsMate)                           //to tell express that we are gonna use ejsMate engine instead of default one
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))


app.use(express.urlencoded({ extended: true }));                //to parse req.body
app.use(methodOverride('_method'));                             //middle ware to use method override and _method used in form
app.use(express.static(path.join(__dirname, 'public')));        //to serve static files from public folder
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
    // crypto: {
    //     secret: 'thisshouldbeabettersecret!'
    // }
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,                                        //the cookie cannot accessed through client side...for the security
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,           //expiration date after a week...added in miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7                            //no of miliseconds in a week
    }
}
app.use(session(sessionConfig));                         //pass the sessionConfig object
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dylibjfcj/",  
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));        //use the LocalStrategy ans use authenticate method 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');              //we will have access to success in our templates without passing it
    res.locals.error = req.flash('error');                 //if theres anything stored in flash under the key error
    next();                                               //coz its a middleware
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);                    //  /campgrounds is the common prefix to all routes in campgroundRoutes router
app.use('/campgrounds/:id/reviews',reviewRoutes);            //common prefix to all routes 

app.get('/' , (req,res)=>{
    res.render('home');                                  //the home.ejs in views folder
})

app.all('*',(req,res,next)=>{                                     //if upper routes arent matched                
    next(new ExpressError('Page Not Found',404));                //new ExpressError object is created and neeche next function pe sent
})

app.use((err,req,res,next)=>{                                 //error handler middleware 
    const { statusCode = 500 } = err;                           //destructure _ get statuscode from error object default calue is 500
    if (!err.message) err.message = 'Something Went Wrong!'       //if the msg is not defined only then set its value
    res.status(statusCode).render('error', { err })                 //render error template & pass the err object to error.ejs in views  
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("Serving at port 3000");
})