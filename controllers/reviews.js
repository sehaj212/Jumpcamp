const Campground = require('../models/campground.js');                   //require the model
const Review = require('../models/review');

module.exports.createReview = async (req,res)=>{
    const campground = await Campground.findById(req.params.id);                 //find the campground via its id
    const review = new Review(req.body.review);                                 //create a new review document
    review.author = req.user._id;                                         //jo logged in hai uski id author field me store krado
    campground.reviews.push(review);                                          //push in reviews array of campground
    await review.save();                                                      //save both of them n the database
    await campground.save();
    req.flash('success','Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);                        //redirect to show page of campground
}

module.exports.deleteReview = async (req,res)=>{
    const { id, reviewId } = req.params;                                              //both from url                                        
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });          //pull operator to delete objectIds from reviews array
    await Review.findByIdAndDelete(reviewId);                                          //delete the review 
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);                                                //redirect to show page of the campground
}