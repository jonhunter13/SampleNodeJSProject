//Import the request package by running 'npm install request'
//we could also use http.request to make our call, but I found this to be very helpful, clean and easy to use
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, '/')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var fs = require("fs");
var file = "data.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

// Database initialization, this will get complicated with more than 2 tables, but for the purposes of the exercise this will do
db.serialize(function() {
  if(!exists){
    db.run('CREATE TABLE "users" ' +
      '("id" INTEGER PRIMARY KEY AUTOINCREMENT,' +
      '"username" varchar(255) NOT NULL DEFAULT NULL,' +
      '"user_fname" varchar(255) DEFAULT NULL,' +
      '"user_lname" varchar(255) DEFAULT NULL,' +
      '"user_dob" date DEFAULT NULL,' +
      '"user_email" varchar(255) DEFAULT NULL,' +
      '"user_password" varchar(255) DEFAULT NULL,' +
      '"user_role" varchar(50) NOT NULL,' + //REFERENCES roles(user_role),' + //TODO link tables with foreign key reference
      '"user_gender" varchar(50) DEFAULT NULL,' +
      '"user_created_date" timestamp DEFAULT CURRENT_TIMESTAMP)',

      //In MySql world this is very handy, but it looks like you would need to create a trigger to get the behavior I'm looking for
      //'"user_modified_date" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)', 
      function(err) {
          (err !== null)
            ?console.log(err)
            :console.log("SQL Table 'users' initialized.");
    });

//  Only 2 roles currently, but in a bigger system this will be its own table with several roles (doctor, patient, nurse, lab tester, diagnostics, etc)
//     db.run('CREATE TABLE "roles" ' +
//       '("id" INTEGER PRIMARY KEY AUTOINCREMENT,' +
//       '"name" varchar(50) DEFAULT NULL)',
//     function(err) {
//         (err !== null)
//           ?console.log(err)
//           :console.log("SQL Table 'roles' initialized.");
//     });

    db.run('CREATE TABLE "appointments" ' +
      '("id" INTEGER PRIMARY KEY AUTOINCREMENT,' +
      '"app_user_id" INTEGER NOT NULL,' +
      '"app_assigned_to" INTEGER NOT NULL,' +
      '"app_date" datetime DEFAULT NULL,' +
      '"app_notes" TEXT,' +
      '"app_created_date" timestamp DEFAULT CURRENT_TIMESTAMP)', 
      function(err) {
          (err !== null)
            ?console.log(err)
            :console.log("SQL Table 'appointments' initialized.");
    });



     //Fill tables with test data
     //doctors
    db.run('INSERT INTO "users" (id, username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES (1, "DocRob", "Dr.", "Robert", "1980-02-01", "dRob@gmail.com", "PASSWORD", "doctor", "Male")');
    db.run('INSERT INTO "users" (id, username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES (2, "Dr K", "Dr.", "Kevorkian", "1980-03-01", "DocK@gmail.com", "PASSWORD", "doctor", "Female")');
    
    //patients
    db.run('INSERT INTO "users" (id, username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES (3, "BStrep", "Betty", "Strep", "1980-03-01", "BStrep@gmail.com", "PASSWORD", "patient", "Female")');
    db.run('INSERT INTO "users" (id, username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES (4, "DDraper", "Don", "Draper", "1930-03-01", "DDraper@gmail.com", "PASSWORD", "patient", "Male")');
    db.run('INSERT INTO "users" (id, username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES (5, "JStorm", "Johnny", "Storm", "1965-03-01", "flameon@gmail.com", "PASSWORD", "patient", "Male")');
    db.run('INSERT INTO "users" (id, username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES (6, "LilTim", "Little", "Timmy", "1995-03-01", "timmy@gmail.com", "PASSWORD", "patient", "Male")');

    //appointments
    db.run('INSERT INTO "appointments" (app_user_id, app_assigned_to, app_date, app_notes) ' + 
      'VALUES (3, 1, "2015-08-01 8:40:51", "I have a terrible cough, need to see if it\'s strep")');
    db.run('INSERT INTO "appointments" (app_user_id, app_assigned_to, app_date, app_notes) ' + 
      'VALUES (4, 1, "2015-08-11 8:40:51", "annual visit, check for cirrhosis")');
    db.run('INSERT INTO "appointments" (app_user_id, app_assigned_to, app_date, app_notes) ' + 
      'VALUES (5, 1, "2015-08-18 8:40:51", "Razor burn")');
    db.run('INSERT INTO "appointments" (app_user_id, app_assigned_to, app_date, app_notes) ' + 
      'VALUES (6, 2, "2015-08-12 8:40:51", "Take my cast off.")');

    //check data
    // db.each("SELECT * FROM users WHERE user_role='doctor'", function(err, row) {  
    //     console.log(row);
    //     (row !== undefined)
    //       ?console.log(row)
    //       :console.log(err);
    // });

    // db.each("SELECT * FROM appointments", function(err, row) {  
    //     (row !== undefined)
    //       ?console.log(row)
    //       :console.log(err);
    // });
  }
});



app.get('/doctors', function(req, res){
  db.all("SELECT * FROM users WHERE user_role='doctor'", 
    function(err,rows){
      if(rows !== undefined){
        res.setHeader('Content-Type', 'application/json');
        res.send(rows);
      }else
        console.log(err);
    }
  );  
  
  //JSON method before switching to SQLite
  // var data = fs.readFileSync('./data/doctors.json');
  // res.setHeader('Content-Type', 'application/json');
  // res.send(data);
});

app.get('/patients', function(req, res){
  db.all("SELECT * FROM users WHERE user_role='patient'", 
    function(err,rows){
      if(rows !== undefined){
        res.setHeader('Content-Type', 'application/json');
        res.send(rows);
      }else
        console.log(err);
    }
  );
});

app.get('/get_user', function(req, res){
  var id = req.query.id;
  db.all("SELECT * FROM users WHERE id="+id, 
    function(err,rows){
      if(rows !== undefined){
        res.setHeader('Content-Type', 'application/json');
        res.send(rows);
      }else
        console.log(err);
    }
  );
});

app.get('/get_schedule', function(req, res){
  var id = req.query.id;
  db.all("SELECT * FROM appointments WHERE app_assigned_to="+id, 
    function(err,rows){
      if(rows !== undefined){
        res.setHeader('Content-Type', 'application/json');
        res.send(rows);
      }else
        console.log(err);
    }
  );
});

app.post('/create_user', function(req, res) {
  var username = req.body.username;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var dob = req.body.dob;
  var email = req.body.email;
  var password = req.body.password;
  var role = req.body.role;
  var gender = req.body.gender;

  db.run('INSERT INTO "users" (username, user_fname, user_lname, user_dob, user_email, user_password, user_role, user_gender) ' + 
      'VALUES ("'+username+'", "'+fname+'", "'+lname+'", "'+dob+'", "'+email+'", "'+password+'", "'+role+'", "'+gender+'")', 
        function(err){
          if(err!==null)
            console.log(err);
        });
  res.end('Success');
});

app.post('/make_appointment', function(req, res) {
  var doc_id = req.body.doc_id;
  var pat_id = req.body.patients;
  var time   = req.body.time;
  var note   = req.body.note;

  db.run('INSERT INTO "appointments" (app_user_id, app_assigned_to, app_date, app_notes) ' + 
      'VALUES ('+pat_id+', '+doc_id+', "'+time+'", "'+note+'")', 
        function(err){
          if(err!==null)
            console.log(err);
        }
  );

  res.end('Success');
});

app.listen(8080, function(){
  console.log("Listening on port 8080");
});

