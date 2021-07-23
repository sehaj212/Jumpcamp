const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');                                      //array of objects cities
const {places,descriptors} = require('./seedHelpers');                   //destructure and get places and descriptors arrays

mongoose.connect('mongodb://localhost:27017/yelp-camp',{                   //name of our db is yelp-camp
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;                                //taki bar bar mongoose.connection na likhna pade uski jagah db
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("database connected");
});

const sample = (array)=> array[Math.floor(Math.random() * array.length)]       //sample function to return a random element from array...it takes an array

const seedDB = async() =>{
    await Campground.deleteMany({ });                      //delete all documents in campgrounds collection 

    for(let i=0; i<200; i++)
    {
        const price = Math.floor(Math.random()*20)+10;
        const random1000 = Math.floor(Math.random() * 1000);                 //to select a random city out of 1000 in cities.js
        const camp = new Campground({                                                   //create a new document 
            author : '60f3d0d8ea58e83b4c175ba7',                                          //Sehaj user ki object id 
            location : `${cities[random1000].city}, ${cities[random1000].state}`,  
            title : `${sample(descriptors)} ${sample(places)}`,                   //descriptors and places are imported as arrays and title me random descriptor and random places
            images : [
                {
                  url: 'https://res.cloudinary.com/dylibjfcj/image/upload/v1626692485/YelpCamp/une0tblyex3ympslkujq.jpg',
                  filename: 'YelpCamp/une0tblyex3ympslkujq'
                },
                {
                  url: 'https://res.cloudinary.com/dylibjfcj/image/upload/v1626692490/YelpCamp/pjkeeuwpwngesncgluiz.jpg',
                  filename: 'YelpCamp/pjkeeuwpwngesncgluiz'
                }
              ],
            description :'Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            price : price,
            geometry: { 
                type: 'Point',
                coordinates: [ 
                    cities[random1000].longitude,                   //random cities ke latitude longitude
                    cities[random1000].latitude,
                 ]                    
            }
        })
        await camp.save();                               //insert the new document and do this 50 times
    }
}

seedDB().then(() => {
    mongoose.connection.close();                 //after creating 50 docs close the db connection
})
