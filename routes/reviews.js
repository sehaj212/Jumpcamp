const express = require('express');
const router = express.Router({mergeParams:true});                    //create the router object

const Campground = require('../models/campground.js');                   //require the model
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { validateReview , isLoggedIn , isReviewAuthor } = require('../middleware'); 
const reviews = require('../controllers/reviews');

//for creating a review
router.post('/', isLoggedIn, validateReview ,catchAsync(reviews.createReview))

//to delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;            //export the router object