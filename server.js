var http 		= require('http');
var express 	= require('express');
var _ 			= require('underscore');
var crypto 		= require('crypto');




var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var session 		= require('express-session');


var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));




app.set('port', process.env.NODE_WCHAT_PORT || 8108);

app.get('/', function(req, res) {
  
	var signature 		= req.query['signature'];
	var timestamp 		= req.query['timestamp'];
	var nonce 			= req.query['nonce'];
	var echostr 		= req.query['echostr'];


	var token 			= 'damiaa0029damiaa0029damiaa0029da';
	var encodingAESKey	= '368efzUP97lf34owkeVyUqpEceZfkPsCLyFX2Hd17ej';


	if (!_.isEmpty(signature) && !_.isEmpty(timestamp) && !_.isEmpty(nonce) && !_.isEmpty(echostr)) {
		console.log('validate server from wchat server:');
		console.log('echostr:' + echostr);
		console.log('timestamp:' + timestamp);
		console.log('nonce:' + nonce);
		console.log('signature:' + signature);

		var sha1 = crypto
					.createHash('sha1')
					.update(_.sortBy([token, timestamp, nonce], function(a) { return a}).join(''))
					.digest("hex");
		console.log('sha1:' + sha1);
		console.log('sha1==signature:' + (sha1==signature));

		if (sha1==signature) {
			console.log('validate success');
			return res.send(echostr);
		} else {
			console.log('validate failed');
			return res.json(false);
		}
	}

	return res.json('no match');
	
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});