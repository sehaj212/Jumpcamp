const User = require('../models/user');

module.exports.renderRegister = (req,res)=>{
    res.render('users/register');                         //res.render automatically looks in views folder for templates to render
}

module.exports.register = async (req,res,next)=>{
    try{
    const {username,email,password}=req.body;
    const user = new User({email,username});           //create a new Instance of User model and fill username and email field in it
    const newUser = await User.register(user,password);   //User.register will insert in our db
    req.login(newUser, err =>{
        if(err) return next(err);  
        req.flash('success','Welcome to JumpCamp!');
        res.redirect('/campgrounds');            
    })             //pass the user instance and register method will create a new user in our db with hashed password and salt
    }catch(err){
        req.flash('error',err.message);          //if any error occurs in try block then flash that error and redirect 
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req,res)=>{   
    res.render('users/login');
}

module.exports.login = (req,res)=>{             //passport.authenticate is a middleware will run before we actually log in
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';               //if session.returnTo is empty then we'll redirect to index page
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();                                    //logout method bcoz of passport
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}