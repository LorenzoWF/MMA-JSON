var request = require('request');
var cheerio = require('cheerio');

exports.fighter = function(data, callback){
  google_search(data, function(link){
    if (link != 0){
      sherdog_access(link, function(data){
        return callback(JSON.stringify(data));
//        return callback(JSON.parse(data));
//        return callback(data);
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

  var numberPattern = /\d+/g;

  var id_sherdog = link.match(numberPattern);
  id_sherdog = id_sherdog[0];

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

    var height_cm = $('span.item.height').text();
    height_cm = height_cm.match(numberPattern);
    height_cm = height_cm[2] + "." + height_cm[3];

    var weight = $('span.item.weight strong').text();
    weight = weight.match(numberPattern);
    weight = weight[0];

    var weight_kg = $('span.item.weight').text();
    weight_kg = weight_kg.match(numberPattern);
    weight_kg = weight_kg[1] + "." + weight_kg[2];

    var association = $('h5.item.association strong').text();

    var wclass = $('h6.item.wclass strong').text();
    var wins_total = $('div.bio_graph span.counter').text();
    wins_total = wins_total.substring(0,2);
    var loses_total = $('div.bio_graph.loser span.counter').text();

    var draws = 0;

    if ( $("div.right_side").length ){
        var qtd = 0;
        $("div.right_side span.counter").each(function(){
          qtd ++;
        });

        if (qtd == 2){
          draws = $("div.right_side span.counter").text();
          var nc = draws.charAt(1);
          draws = draws.charAt(0);
        } else {
          if ($("div.right_side span.result").text() == "Draws"){
            draws = $("div.right_side span.counter").text();
          } else {
            var nc = $("div.right_side span.counter").text();
          }
        }
    }

    var record = wins_total+"-"+loses_total+"-"+draws;

    if (nc) record = record+"("+nc+")";

    var ko = [0, 0], sub = [0, 0], dec = [0, 0], others = [0, 0], k=0, s=0, d=0, o=0;

    $('div.bio_graph span.graph_tag').each(function(){
    	if ($(this).text().indexOf("KO") != '-1'){
    		ko[k] = $(this).text().match(numberPattern);
    		ko[k] = ko[k][0];
    		k++;
    	}

    	if ($(this).text().indexOf("SUBMISSIONS") != '-1'){
    		sub[s] = $(this).text().match(numberPattern);
    		sub[s] = sub[s][0];
    		s++;
    	}

    	if ($(this).text().indexOf("DECISIONS") != '-1'){
    		dec[d] = $(this).text().match(numberPattern);
    		dec[d] = dec[d][0];
    		d++;
    	}

    	if ($(this).text().indexOf("OTHERS") != '-1'){
    		others[o] = $(this).text().match(numberPattern);
    		others[o] = others[o][0];
    		o++;
    	}
    });

    var fights = new Array;

    $.fn.ignore = function(sel){
	     return this.clone().find(sel||">*").remove().end();
    };

    $('div.content.table tr').each(function(i){
    	if (i > 0){
    		fights[i - 1] = new Object;
    		fights[i - 1].event = $(this).children('td').eq(2).children('a').text();
    		fights[i - 1].url = $(this).children('td').eq(2).children('a').attr('href');
    		fights[i - 1].date = $(this).children('td').eq(2).children('span').text();
    		fights[i - 1].result = $(this).children('td').eq(0).text();
    		fights[i - 1].method = $(this).children('td').eq(3).ignore('span').text();
    		fights[i - 1].referee = $(this).children('td').eq(3).children('span').text();
    		fights[i - 1].round = $(this).children('td').eq(4).text();
    		fights[i - 1].time = $(this).children('td').eq(5).text();
    		fights[i - 1].opponent = $(this).children('td').eq(1).text();
      }
    });

    var img = $('img.profile_image.photo').attr("src");

    //console.log(img);

    var data = {
      id_sherdog: id_sherdog,
      name: name,
      nickname: nickname,
      birthday: birthday,
      age: age,
      nationality: nationality,
      locality: locality,
      height: height,
      height_cm: height_cm,
      weight: weight,
      weight_kg: weight_kg,
      association: association,
      wclass: wclass,
      record: record,
      wins:
      {
          wins_total: wins_total,
          wins_ko: ko[0],
          wins_submission: sub[0],
          wins_decision: dec[0],
          wins_others: others[0]
      },
      loses:
      {
          loses_total: loses_total,
          loses_ko: ko[1],
          loses_submission: sub[1],
          loses_decision: dec[1],
          loses_others: others[1]
      },
      fights: fights,
      img: img
    };

    //console.log(data);

    return callback(data);

  });

}
