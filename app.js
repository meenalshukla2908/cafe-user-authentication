const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql');
const app = express();
const config = require("./db/config");
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"];
var sha256 = require('js-sha256');
var session = require('express-session');
var flash = require('connect-flash');

app.use(cookieParser());
app.use(session({
    secret: 'cafecoffee', 
    cookie: { maxAge: 60000 },
    resave: true,    
    saveUninitialized: true 
  }));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({
   extended:true
 }));

 app.set('views', path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection(config);

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('connected');
});

app.get('/',(req,res) =>{
    let sql = 'SELECT * FROM users LEFT JOIN schedules ON users.ID = schedules.ID_user';
     db.query(sql,(err,results) =>{
        if(err) throw err;
         console.log(results);
         res.render('home',{schedules:results,days,title:'Welcome to Our Cafe'});
    });
});

app.get('/login',(req,res) =>{
    res.render('login',{title:'WELCOME TO CAFE'});
});

app.post('/login',(req,res) =>{
 var data ={
     email: req.body.email,
     password: req.body.password
 };
var userEmail=data[0],
    userPassword=data[1];
  db.query('SELECT email,password FROM users WHERE email AND password =?',[userEmail,userPassword],function(err,results){
     if(results) {
        req.session.regenerate(function() {
            req.session.login = true;
            res.redirect('/schedule');
            });
        } else {
              res.render('/');
            }
  });

   
 
});

app.get('/signup',(req,res) =>{
    res.render('signup',{title:'WELCOME TO CAFE'});
});
app.post('/signup',(req,res)=>{
    let surname = req.body.surname;
    let firstname = req.body.firstname;
    let email = req.body.email;
    //if(db.query('SELECT COUNT * FROM users WHERE email == New.email'))
     //req.flash('message','Users already exists');
    //throw new Error('User already exists');
    if(req.body.password !== req.body.confirmPassword)
     throw new Error('Passwords must be same');
     //req.flash('message','Enter same password');
     else{
         let password = sha256(req.body.password);
     db.query('INSERT INTO users(surname,firstname,email,password) VALUES(?,?,?,?)',
      [surname,firstname,email,password],function(err)
      {
              if (err) {
                return console.log(err.message);
              }
              console.log("Sign up successful");
              res.render('signup',{
                  surname:surname,
                  firstname:firstname,
                  email:email,
                  password:password,
              });
              //res.render('login');
            });
        }
    }); 
           

app.get('/schedule',(req,res) =>{
    let sql = 'SELECT * FROM users LEFT JOIN schedules ON users.ID = schedules.ID_user';
     db.query(sql,(err,results) =>{
        if(err) throw err;
         console.log(results);
         res.render('schedule',{schedules:results,days,title:'User Schedules'});
    });
});

app.post('/schedule',(req,res)=>{
    let userId = req.body.ID_user;
    let day = req.body.day;
    let start = req.body.start;
    let end = req.body.end;
      db.query('INSERT INTO schedule(ID_user,day,start,end) VALUES(?,?,?,?)',
      [userId,day,start,end],function(err)
      {
              if (err) {
                return console.log(err.message);
              }
              console.log("New schedule has been added");
              res.render('schedule',{
                  userId:userId,
                  day:day,
                  start_at:start,
                  end_at:end,
                  days
              });
              
      
     });
    });
/*app.get('/user/new', function (req, res) {
    res.render('user',{title: "Add New User"});
   });
    app.post('/user/new',(req,res)=>{
        let surname = req.body.surname;
        let firstname = req.body.firstname;
        let email = req.body.email;
        let password = sha256(req.body.password);
         db.query('INSERT INTO users(surname,firstname,email,password) VALUES(?,?,?,?)',
          [surname,firstname,email,password],function(err)
          {
                  if (err) {
                    return console.log(err.message);
                  }
                  console.log("New user has been added");
                  res.render('user',{
                      surname:surname,
                      firstname:firstname,
                      email:email,
                      password:password,
                  });
                });    
    const newUser = req.body;
    newUser.password = sha256(newUser.password);
    users.push(newUser);
    res.redirect('/users');*/
    
    

app.listen('3000',()=>{
    console.log('server started on port 3000');
});