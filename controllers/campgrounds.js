const Campground = require('../models/campground.js'); 
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req,res)=>{                      //views me campgrounds ke andar
    const campgrounds = await Campground.find({});             //sare hi ajenge in campgrounds array
    res.render('campgrounds/index',{campgrounds});             //pass all documents to show all campgrounds
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res,next)=>{                      //post request is listened by our server when form is submitted in new.ejs 
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    
    const campground = new Campground(req.body.campground);      //req.body ke andar campground object ke andar hai apna object jo data bhara user ne form me 
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();                                     //save that new document in our db
    //console.log(campground);  
    //redirect to show page of this newly created campground
    req.flash('success','Successfully created a new campground');      //flash this msg just before redirect
    res.redirect(`/campgrounds/${campground._id}`)               //and so that we dont keep creating it again and again so we need to redirect 
}

module.exports.showCampground = async (req,res)=>{                        //to show one campground details so we need its id in route
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');     //same id wala labbho campground and pass it to show.ejs
    if(!campground){
        req.flash('error','Cannot find the desired campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});                     //is campground object me ._id bhi hai from db
}

module.exports.renderEditForm = async (req,res)=>{                //look up for the campground that we are editing so that we can pre populate the form
    const campground = await Campground.findById(req.params.id);   //find the one by id...server ko req ayi usme se id nikal lo     
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }   
    res.render('campgrounds/edit',{campground});                   //jo campground update krna hai that is available in edit.ejs
}

module.exports.updateCampground = async (req, res) => {                           //to edit a campground
    const { id } = req.params;                                               //get id from req.body by destructuring
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });       //req.body.campground is the object that contains data that user filled in form
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success','Successfully updated campground!');       
    res.redirect(`/campgrounds/${campground._id}`)              //redirect to the show page of the updated campground
}

module.exports.deleteCampground = async (req, res) => {              //show wale page se hi delete request aegi using method override
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);                         //id nikalo uski and delete krdo
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');                               //delete ke bad all campgrounds wale page pe le jao
}