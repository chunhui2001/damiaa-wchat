var http 		= require('http');
var express 	= require('express');
var _ 			= require('underscore');
var crypto 		= require('crypto');

var globalConfig 	= require('./config/global');
var wchatEvent 		= require('./common/wchat-event');


console.log(globalConfig);

var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var xmlParser 		= require('express-xml-bodyparser');
var session 		= require('express-session');


var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(xmlParser());

app.use(function(req, res, next) {
	req.isXml 		= req.headers['content-type'] == 'text/xml';
	req.isEncrypt 	= req.isXml && req.body.xml.encrypt;

	next();
});




app.set('port', process.env.NODE_WCHAT_PORT || 8108);

app.get('/', function(req, res) {
  
	console.log('coming a get request...');

	var signature 		= req.query['signature'];
	var timestamp 		= req.query['timestamp'];
	var nonce 			= req.query['nonce'];
	var echostr 		= req.query['echostr'];


	var token 			= globalConfig.client_sign_token;
	var encodingAESKey	= globalConfig.client_encodingAESKey;


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
			return res.send(false);
		}
	}

	var sendResult 	= {'msg':'no match', 'query': req.query, 'params':req.params, 'body': req.body};
	console.log(sendResult);
	return res.send(sendResult);
	
});

app.post('/', function(req, res) {

	var signature 		= req.query['signature'];
	var timestamp 		= req.query['timestamp'];
	var nonce 			= req.query['nonce'];

	var encrypt_type 	= req.query['encrypt_type'];	// 加密类型：aes
	var msg_signature 	= req.query['msg_signature'];	// 消息体签名：c3fbfe6a3f4b6b1f9476fa12899659ae246c476f

	var requestBody 	= req.isXml ? req.body.xml : req.body;
	var toUserName 		= null;
	var encrypt 		= null;

	var sendResult 	= {'msg':'post message', 'query': req.query, 'params':req.params, 'body': requestBody};


	//console.log(sendResult);

	if (req.isXml) {
		toUserName 	= requestBody.tousername;	// may be array

		var requestObject 	= null;

		if (!req.isEncrypt) {
			// get request body from req.body.xml
			requestObject 		= req.body.xml;
		} else {
			// TODO
			// http://mp.weixin.qq.com/wiki/14/70e73cedf9fd958d2e23264ba9333ad2.html
			/*var msg_sign 	= msg_signature;
			var timeStamp 	= timestamp;
			var from_xml 	= req.rawBody;
			var result 		= null;


			// $errCode = $pc->decryptMsg($msg_sign, $timeStamp, $nonce, $from_xml, $msg);
			encryptBody 		= requestBody.encrypt;
			sendResult.body 	= from_xml;*/
		}

		wchatEvent.onPush(requestObject, function(error, result) {
			if (error) return res.send('');

			return res.send(result);
		});
	}

});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});