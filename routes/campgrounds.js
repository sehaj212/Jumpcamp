const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground.js');                         //Campground model 
const router = express.Router();
const { isLoggedIn,validateCampground,isAuthor } = require('../middleware');                    //the middleware function to check if user is logged in or not
const campgrounds = require('../controllers/campgrounds');             //controller object 
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });                //destination of files

router.route('/')
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn , upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground))

//New Campground form
router.get('/new', isLoggedIn , campgrounds.renderNewForm);

router.route('/:id')
    .get( catchAsync(campgrounds.showCampground) )
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground) )
    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground) )
    
//Edit form
router.get('/:id/edit', isLoggedIn, isAuthor ,catchAsync(campgrounds.renderEditForm))

module.exports = router;