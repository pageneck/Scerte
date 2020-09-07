require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mysql = require("mysql")
const bcrypt = require("bcrypt")

// init express 
const app = express()
// set ejs, bodyParser
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
  res.render("home")
})

app.get("/login",function(req,res){
  res.render("login")
})

app.get("/register",function(req,res){
  res.render("register")
})
// connect to mysql and create a database connection
const conn = mysql.createConnection({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PASS,
  database:process.env.DB_DATABASE
})

conn.connect(function(error){
  if(error) throw error;
  console.log("connected");
  // create a database 
  conn.query("CREATE DATABASE IF NOT EXISTS userDB",function(error){
    if(error) throw error;
    console.log("Database Created");
  })
  // create a table for users
  conn.query("CREATE TABLE IF NOT EXISTS users(email VARCHAR(255), password VARCHAR(255))",function(err,result){
    console.log("Table cretaed");
  });
});

// post  request to register route
app.post("/register",function(req,res){
  const user = req.body.username;
  const pass = req.body.password;

  bcrypt.hash(pass,process.env.SALT_ROUNDS,function(err, hash){

    const sql = `INSERT INTO users(email,password) VALUES ?`
    const VALUES = [[user,hash]]
    conn.query(sql,[VALUES],function(error,result){
      if(error) throw error;
      res.render("secrets")
    })


  })
})

// post request to login route
app.post("/login",function(req,res){
  // get the form field values
  const username = req.body.username;
  const pass = req.body.password;


  const sql = `SELECT * FROM users WHERE email = ?`
  conn.query(sql,[username],function(error,results){
    // compare db password with user password
    bcrypt.compare(pass,results[0].password,function(err,result){
      if(result){
        res.render("secrets")
      }else{
        console.log("paswword mismatch");
      }
    })
  })
})

// listen on port 3000
app.listen(3000, function(){
  console.log("Serve running on port 3000");
})