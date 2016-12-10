
// dependencies
var express = require('express');
var app = express();

var request = require('request');
var cheerio = require('cheerio');

var mongojs = require('mongojs');
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// stablish mongojs 
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});


// Main route (simple Hello World Message)
app.get('/', function(req, res) {
  res.send("index.html");
});

// Retrieve data from the db
app.get('/all', function(req, res) {
  // find all the scrapedData
  db.scrapedData.find({}, function(err, found) {
    if (err) {
      console.log(err);
    } 
   
    else {
      res.json(found);
    }
  });
});

// Scrape data 
app.get('/scrape', function(req, res) {
  // make a request
  request('http://www.nytimes.com/trending/', function(error, response, html) {
    // load cheerio
    var $ = cheerio.load(html);
    // grab elemnts with class title
    $('.story-heading').each(function(i, element) {
      // save the text of each link 
      var title = $(this).children('a').text();
      // save the href value of each link 
            var link = $(this).children('a').attr('href');

      if (title && link) {
        db.scrapedData.save({
          title: title,
          link: link
        }, 
        function(err, saved) {
          if (err) {
            console.log(err);
          } 
          else {
            console.log(saved);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});


// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
