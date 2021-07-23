const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');
const Campground = require('./models/campground.js');                         //Campground model 
const { campgroundSchema,reviewSchema } = require('./schemas.js');            //joi schema 

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be logged in!');
        return res.redirect('/login');
    }
    next();               //if you are authenticated then go ahead
}

//middleware function to make sure user ne jo values bhari are valid and this will run before route ka cb function
module.exports.validateCampground=(req,res,next)=>{    
    //campgroundSchema is imported from schemas.js
    const {error} = campgroundSchema.validate(req.body);              //checking req.body has valid campground object
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400);                              //handled down by error handler which send error object to error template
    }else{
        next();             
    }
}

module.exports.isAuthor = async (req,res,next)=>{
    const { id } = req.params;                                               //get id from req.body by destructuring
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){                      //if you arent the author then redirect hojaega you cant edit
        req.flash('error','You do not have the permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {                              //middleware to validate review using joi schema 
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//call before deleting a review 
module.exports.isReviewAuthor = async (req,res,next)=>{               
    const { id, reviewId } = req.params;                                               //get id from req.body by destructuring
    const review = await Review.findById(reviewId);                   //find that review in db
    if(!review.author.equals(req.user._id)){                         //if you arent the author then redirect hojaega you cant edit
        req.flash('error','You do not have the permission!');
        return res.redirect(`/campgrounds/${id}`);                  //redirect to show page of that campground
    }
    next();
}