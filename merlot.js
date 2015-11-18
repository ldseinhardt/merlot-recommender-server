var fs = require('fs');
var http = require('http');
var url = require('url') ;

var recommendations = JSON.parse(fs.readFileSync('merlot.json', 'utf8'));

http.createServer(function (req, res) {

  var args = url.parse(req.url, true);

  var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  switch (args.pathname.replace(/\/$/, '')) {

    case '/recommender':
      console.log(date + ': user ' + args.query.user + ', requested recommendation');
      var rec = recommendations.filter(function(recommendation) {
        return recommendation.user == args.query.user;
      }, this);
      if (rec.length) {
        var reply = JSON.stringify(rec[0]);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': reply.length
        });
        res.end(reply);
      } else {
        res.writeHead(404);
        res.end();
      }
      break;

    case '/feedback':
      console.log(date + ': user ' + args.query.user + ', sent feedback ' + args.query.feedback);
      fs.writeFile('feedback.csv', '"' + date + '", "' + args.query.user + '", "' + args.query.feedback + '"\n', {
        encoding: 'utf8',
        flag: 'a'
      });
      res.writeHead(200);
      res.end();
      break;

    default:
      res.writeHead(404);
      res.end();
  }

}).listen(8080, function() {
  console.log('Merlot.org Recommender server running on 8080 ...');
});