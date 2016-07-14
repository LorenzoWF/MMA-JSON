var express = require('express');
var app = express();

var sherdog = require('./sherdog_crawler.js');
var file = require('fs');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'))

app.get('/', function(req, res){

  file.readFile(__dirname+'/index.html', function(err, html){
      res.setHeader('Content-Type', 'text/html');

      if (err) res.write("ERROR, File not found!");

      res.send(html);
  });

});

app.get('/fighter', function(req, res){

  res.setHeader('Content-Type', 'application/json');

  var fighter = req.query.name;

  if(!fighter){
    res.send("ERRORR!");
  } else {
    sherdog.fighter(fighter, function(data){
      console.log(data);
      res.send(data);
    });
  }


});

//app.listen(3000);

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
