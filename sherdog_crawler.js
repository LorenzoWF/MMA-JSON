var request = require('request');
var cheerio = require('cheerio');

exports.fighter = function(data, callback){
  google_search(data, function(link){
    if (link != 0){
      sherdog_access(link, function(data){
        return callback(JSON.stringify(data));
      });
    } else {
      return callback(0);
    }
  });
};

google_search = function(query, callback){

  String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  query = query.split('-').join(' ');
  query = query.toLowerCase();
  query = query.capitalize();
  query = query.split(' ').join('-');

  console.log("Search in google for: "+query);

  request('https://www.google.com.br/search?q=sherdog+'+query, function(err, res, body){
    if (err) console.log('Error: ' + err);

    var $ = cheerio.load(body);

    var link = $('a[href*="http://www.sherdog.com/fighter/'+query+'"]').attr("href");

    console.log(query);

    if (!link){
      return callback(0);
    };

    link = link.replace("/url?q=", "");
    link = link.split("&")[0];

    return callback(link);

  });
}

sherdog_access = function(link, callback){

  request(link, function(err, res, body){
    if (err) console.log('Error: ' + err);

    var $ = cheerio.load(body);

    var name = $('span.fn').text();
    var nickname = $('span.nickname em').text();
    var birthday = $('span.item.birthday span').text();
    var age = $('span.item.birthday strong').text();
    age = age.replace('AGE: ', '');
    var nationality = $('span.item.birthplace strong').text();
    var locality = $('span.item.birthplace span.locality').text();
    var height = $('span.item.height strong').text();
    //var height_cm = $('span.item.height').text();
    var weight = $('span.item.weight strong').text();
    //var weight_kg = $('span.item.height').text();
    var association = $('a.association span').text();
    var wclass = $('h6.item.wclass strong').text();
    var wins_total = $('div.bio_graph span.counter').text();
    wins_total = wins_total.substring(0,2);
    var loses_total = $('div.bio_graph.loser span.counter').text();

    var img = $('img.profile_image.photo').attr("src");

    //console.log(img);

    var data = {
      name: name,
      nickname: nickname,
      birthday: birthday,
      age: age,
      nationality: nationality,
      locality: locality,
      height: height,
      weight: weight,
      association: association,
      wclass: wclass,
      wins_total: wins_total,
      loses_total: loses_total,
      img: img
    };

    //console.log(data);

    return callback(data);

  });

}
