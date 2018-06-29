var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');

var User = require('./models/user');

mongoose.connect('mongodb://127.0.0.1:27017/demo',function(error){
    if(error){
        console.log('error while connecting to database');
        process.exit(1);
    }else{
        console.log('database connection successful');
    }
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var app = express();

app.set('view engine', 'ejs');
app.use(session({
    secret:'pistah.suma.kira.somari.jama.kiraya',
    resave:false,
    saveUninitialized:false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static('public'));

app.get('/',authenticate,function(request,response){
    response.render('pages/home',{user:request.user});
});

app.get('/about',authenticate,function(request,response){
    response.render('pages/about',{user:request.user});
});

app.get('/register',sendToHome,function(request,response){
    response.render('pages/register',{error:request.flash('error')});
});

app.get('/login',sendToHome,function(request,response){
    response.render('pages/login',{
        error:request.flash('error'),
        message:request.flash('message')
    });
});

app.post('/register',function(request,response){
    User.register(new User({
        name:request.body.name,
        username:request.body.username,
    }),request.body.password,function(error,user){
        if(error){
            request.flash('error',error);
            response.redirect('/register');
        }else{
            passport.authenticate('local',{
                successRedirect : '/'
            })(request,response);
        }
    });
});

app.post('/login',function(request,response,next){
    passport.authenticate('local',{
        failureRedirect: '/login',
        successRedirect : '/',
        failureFlash : true,
        badRequestMessage : 'missing credentials',
    })(request,response,next);
    // passport.authenticate('local',{
    //     failureRedirect: '/login'
    // })(request,response,function(){
    //     response.redirect('/');
    // });
});

app.get('/logout',function(request,response){
    request.logout();
    request.flash('message','logged out successfully');
    response.redirect('/');
});

app.listen(8080,function(){
    console.log('Listening on 8080...');
});

function authenticate(request,response,next){
    if(!request.user){
        response.redirect('/login');
    }else{
        next();
    }
}

function sendToHome(request,response,next){
    if(request.user){
        response.redirect('/');
    }else{
        next();
    }
}