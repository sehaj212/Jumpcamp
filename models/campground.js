const mongoose = require('mongoose');
const Review = require('./review')
const Schema=mongoose.Schema;                      //so that we dont have to write mongoose.Schema again and again

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({                     //defining the structure of our document
    title : String,
    images : [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price : Number,
    description : String,
    location : String,
    author :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,                     //an array of object ids from Review model
            ref: 'Review'
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete',async function(doc){                //doc me deleted document aega as object 
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundSchema);       //name of model is Campground //campgrounds is collection in db