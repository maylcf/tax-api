'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const ObjectID    = require("mongodb").ObjectID;
const engines     = require('consolidate');
const assert      = require('assert');
const Country     = require('./model/country');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var nunjucks = require('nunjucks');
nunjucks.configure('views', {
    autoescape: true,
    express: app
});


var router = express.Router();

//Connect to db
MongoClient.connect(process.env.MONGO, (err, db) => {
  
  let country = db.collection('country');
  let province = db.collection('province');
  
  // Routes

  app.get('/', function(req, res) {
    res.render('index.html', { title: 'Welcome'});
  });
  
  app.get('/country', function(req, res) {
    
    console.log("call > /country");
    res.render('country.html', { title: 'Welcome' });
  });
  
  app.get('/province', function(req, res) {
    res.render('province.html', { title: 'Welcome'});
  });
  
  app.post('/country/add', (req, res) => {
    
    let name = req.body.name;
    let code = req.body.code;
    
    if ( !name.trim() || !code.trim() )
    {
      res.render('country.html', { message: 'Name and code are required!', error: 'true' });
    }
    else
    {
      db.collection('country').insertOne({
        'name': name,
        'code': code
      },
      function (err, r) {
        if (err) {
          res.render('country.html', { message: err, error: 'true' });
        }
      });
      
      res.render('country.html', { message: 'Country saved!'});
    }
  }); 
  
  
  /***********************/
  /** Country ************/
  /***********************/
  
  app.get("/api/countries", (req, res) => {
    
    country.find({}).toArray(function (err,result) {
      if(err){
          res.send(err);
      }
      else {
        res.send(JSON.stringify(result));
      }
    });   
  });
  
  app.post('/api/country/add', (req, res) => {
    
    console.log("call > /api/country/add");
    console.log("--name: " + req.body.name);
    console.log("--code: " + req.body.code);
    
    let name = req.body.name;
    let code = req.body.code;
    
    if ( !name.trim() || !code.trim() )
    {
      res.status(400);
      res.json({message: 'Contry name and code are required!'});
    }
    else
    {
      db.collection('country').insertOne({
        'name': name,
        'code': code
      },
      function (err, r) {
        res.status(500);
        res.json({message: err});
      });

      res.status(200);
      res.json({message: 'Contry saved successfully.'});
    }
  });  
  
  /***********************/
  /** Provinces **********/
  /***********************/
  
  app.get("/api/provinces", (req, res) => {
    
    province.find({}).toArray(function (err,result) {
      if(err){
          res.send(err);
      }
      else {
        res.send(JSON.stringify(result));
      }
    });
  });
  
  app.post('/api/province/add/:id', (req, res) => {
    
    // get information
    
    let name = req.body.name;
    let code = req.body.code;
    let tax  = req.body.tax; 
    let id;;
    
    try {
      id = ObjectID(req.params.id);
    }
    catch(err) {
      res.status(400);
      res.json({message: 'Incorrect ID.'});
      return;
    }
    
    console.log("Name ..: " + name );
    console.log("Code ..: " + code );
    console.log("Tax ...: " + tax );
    console.log("ID ....: " + id );
    
    // Check information
    
    if (!id)
    {
      res.status(400);
      res.json({message: 'It is necessary to inform the Country.'});
      return;
    }
    
    if (!name || !tax || !code)
    {
      res.status(400);
      res.json({message: 'Province name, code and tax are required!'});
      return;
    }
    
    if ( !name.trim() || tax == null )
    {
      res.status(400);
      res.json({message: 'Province name, code and tax are required!'});
      return;
    }
    
    // Get the country
    
    country.findOne({_id: id}, function (err,result) {
      
      if(err) {
        res.status(500);
        res.send(err);
        return;
      }
      
      if (result == null) {
        res.status(400);
        res.json({message: 'Country not found. ID: ' + id});
        return;
      }
      
      console.log("Inserting Province...");
      
      province.insertOne({
        'name': name,
        'tax': tax,
        'code': code,
        'country': result._id
        },
        function (err, r) {
          res.status(500);
          res.json({message: err});
        });

        res.status(200);
        res.json({message: 'Province saved successfully.'});
      
    });    
  }); 
  
  // Get provinces by country
  
  app.get('/api/provinces/:id&:result', (req, res) => {
    
    // Get information
    
    let id = req.params.id;
    let result = req.params.result;
    
    // Validate information
    
    let idObj;
    
    if (!id || !result)
    {
      res.status(400);
      res.json({message: 'Id and Result type are required.'});
      return;
    }

    if (result != "full" && result != "prov")
    {
      res.status(400);
      res.json({message: "Result type should be either 'full' or 'prov'"});
      return;
    }
    
    try {
      idObj = ObjectID(id);
    }
    catch(err) {
      res.status(400);
      res.json({message: 'Incorrect ID.'});
      return;
    }

    // Get contry

    country.findOne({_id: idObj}, function (err,countryResult) {

      // Validate result
      if(err) {
        res.status(500);
        res.send(err);
        return;
      }

      if (countryResult == null) {
        res.status(400);
        res.json({message: 'Country not found. ID: ' + id});
        return;
      }

      // Get the pronvinces

      province.find({country: idObj}).toArray(function (err,provinceResult) {
        
        if(err) 
        {
          res.status(500);
          res.send(err);
          return;
        }
        
        var countryJson = JSON.stringify(countryResult);
        var provinceJson = JSON.stringify(provinceResult);
        
        if (result == "full")
        {
          var requestReturn = "{\"country\":" + countryJson + ",\"provinces\":" + provinceJson + "}";
        }
        else
        {
          var requestReturn = "{\"provinces\":" + provinceJson + "}";
        }
        
        // Return  
        res.status(200);
        res.send(requestReturn);
        
      }); // province
    }); // COUNTRY   
  });
  
}); // Database
  
//mongoose.connect(process.env.MONGO, {useMongoClient: true}); // Working

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});