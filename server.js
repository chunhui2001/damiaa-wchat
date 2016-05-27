var http 		= require('http');
var express 	= require('express');
var _ 			= require('underscore');
var crypto 		= require('crypto');
var redis 		= require('redis');
var moment 		= require('moment');
var uuid 		= require('uuid');
var xml2json 	= require('xml2json');
var nimble 		= require('nimble');

var globalConfig 	= require('./config/global');
var wchatEvent 		= require('./common/wchat-event');
var wchatAPI 		= require('./common/wchatapi');
var _DAMIAA_API		= require('./common/damiaa-api');


console.log(globalConfig);

var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var xmlParser 		= require('express-xml-bodyparser');
var session 		= require('express-session');



var redisClient 	= redis.createClient("redis://127.0.0.1:6379/2");


//url: null; The redis url to connect to 
//([redis:]//[user][:password@][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]] 
//For more info check IANA)

redisClient.on('connect', function(err) {
	if (err) return console.log('Try to connect to redis server failed, ' + err);	
	require('./common/wxjob-refresh-token').refreshToken(redisClient); 
	require('./common/cronjob-refresh-order').refreshOrder(); 
});

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(xmlParser());

app.use(function(req, res, next) {
	req.isXml 		= req.headers['content-type'] == 'text/xml';
	req.isEncrypt 	= req.isXml && req.body.xml.encrypt;

	next();
});




app.set('port', process.env.NODE_WCHAT_PORT || 8009);

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

app.get("/openid/:code/:granttype", function(req, res) {
	var code 		= req.params.code;		
	var grantType 	= req.params.granttype;

    var sendResult  = {error: false, message: null, data: {code:code, grant_type: grantType}};

    wchatAPI.getUserAccessToken(code, grantType, function(err, result) {
    	sendResult.error 	= err;
    	sendResult.data 	= result;

    	res.json(sendResult);
    });
});

app.post("/unifiedorder", function(req, res) {

	//TODO
	// should be get authentication and validate token exists 


	var sendResult  = {error: false, message: null, data: null};

	// var theParams 		= {
	// 	body 			: currentOrder, 			// 'AA精米 特级米 现磨现卖'
	// 	out_trade_no 	: currentOrder.id,			//
	// 	total_fee 		: 800,						//
	// 	userid 			: currentOrder.userId,		//
	// 	openid 			: currentOrder.openId		// 
	// };

	console.log(req.body.orderParams, 'req.body.orderParams');

	wchatAPI.unifiedOrder(req.body.orderParams, function(err, result) {

		sendResult.error 	= err ? true : false;
		sendResult.data 	= err ? err : result;
		sendResult.message 	= err ? '创建预支付订单失败！' : '创建预支付订单成功。';
		
    	res.json(sendResult);
	});
});

app.post("/accept-notify-pay", function(req, res) {
	// 1. 支付完成后，微信会把相关支付结果和用户信息发送到这里

	// 2. 对后台通知交互时，如果微信收到商户的应答不是成功或超时，微信认为通知失败，
	// 微信会通过一定的策略定期重新发起通知，尽可能提高通知的成功率，但微信不保证通知最终能成功。 
	// （通知频率为15/15/30/180/1800/1800/1800/1800/3600，单位：秒）

	// 3. 当收到通知进行处理时，
	// 3-1. 首先检查对应业务数据的状态，判断该通知是否已经处理过，
	// 3-2. 如果没有处理过再进行处理，如果处理过直接返回结果成功。
	// 3-3. 在对业务数据进行状态检查和处理之前，要采用数据锁进行并发控制，以避免函数重入造成的数据混乱。

	// 4. 商户系统对于支付结果通知的内容一定要做签名验证，防止数据泄漏导致出现“假通知”，造成资金损失。

	// 返回参数示例: 
	// <xml>
	//   <appid><![CDATA[wx2421b1c4370ec43b]]></appid>							// appid
	//   <attach><![CDATA[支付测试]]></attach>									// 附加数据原样返回(用户id)
	//   <bank_type><![CDATA[CFT]]></bank_type>									// 银行类型，采用字符串类型的银行标识，银行类型见
	//   <fee_type><![CDATA[CNY]]></fee_type>									// 货币类型
	//   <is_subscribe><![CDATA[Y]]></is_subscribe>								// 用户是否关注公众账号
	//   <mch_id><![CDATA[10000100]]></mch_id>									// 商户编号
	//   <nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>	// 随机字符串，不长于32位
	//   <openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>				// openid
	//   <out_trade_no><![CDATA[1409811653]]></out_trade_no>					// 商户订单号
	//   <result_code><![CDATA[SUCCESS]]></result_code>							// 业务结果 SUCCESS/FAIL
	//   <return_code><![CDATA[SUCCESS]]></return_code>							// 返回状态码 SUCCESS/FAIL
	//   <sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>				// 签名
	//   <sub_mch_id><![CDATA[10000100]]></sub_mch_id>
	//   <time_end><![CDATA[20140903131540]]></time_end>						// 支付完成时间，格式为yyyyMMddHHmmss，如2009年12月25日9点10分10秒表示为20091225091010
	//   <total_fee>1</total_fee>												// 支付金额
	//   <trade_type><![CDATA[JSAPI]]></trade_type>								// JSAPI、NATIVE、APP
	//   <transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>	// 支付订单号
	// </xml>

	// <xml>
	// 	<appid><![CDATA[wxbfbeee15bbe621e6]]></appid>
	// 	<attach><![CDATA[2c9f9b8f52463e380152463f2d310000]]></attach>
	// 	<bank_type><![CDATA[CFT]]></bank_type>
	// 	<cash_fee><![CDATA[1]]></cash_fee>
	// 	<fee_type><![CDATA[CNY]]></fee_type>
	// 	<is_subscribe><![CDATA[Y]]></is_subscribe>
	// 	<mch_id><![CDATA[1315577401]]></mch_id>
	// 	<nonce_str><![CDATA[9509538490]]></nonce_str>
	// 	<openid><![CDATA[ofnVVw9aVxkxSfvvW373yuMYT7fs]]></openid>
	// 	<out_trade_no><![CDATA[7961010630169125186]]></out_trade_no>
	// 	<result_code><![CDATA[SUCCESS]]></result_code>
	// 	<return_code><![CDATA[SUCCESS]]></return_code>
	// 	<sign><![CDATA[5FFA693E8B9ECABEC6E81056243407BA]]></sign>
	// 	<time_end><![CDATA[20160314211040]]></time_end>
	// 	<total_fee>1</total_fee>
	// 	<trade_type><![CDATA[JSAPI]]></trade_type>
	// 	<transaction_id><![CDATA[1003980736201603143990404855]]></transaction_id>
	// </xml>

	if (!req.isXml) {
		res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[返回数据不是xml格式！]]></return_msg></xml>');
		return;
	}

	var rtnDataObj 	= req.body.xml;
	var rtnDataKey 	= Object.keys(rtnDataObj);
	var rtnParams 	= [];
	var rtnParamStr 	= null;
	var rtnParamSign 	= null;

	rtnDataKey.forEach(function(key) {
		if (key != 'sign')
			rtnParams.push(key + '=' + rtnDataObj[key]);
	});

	rtnParamStr 	= _.sortBy(rtnParams, function(a) { return a; }).join('&') + "&key=" + globalConfig.pay_api_key;
	rtnParamSign 	= crypto.createHash('md5').update(new Buffer(rtnParamStr)).digest("hex").toUpperCase();	

	if (rtnParamSign != rtnDataObj.sign) {
		res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名失败！]]></return_msg></xml>');
		return;
	}

	var userid 		= rtnDataObj.attach[0];
	var orderid 	= rtnDataObj.out_trade_no[0];
	var openid 		= rtnDataObj.openid[0];


	if (!(rtnDataObj.result_code[0].toUpperCase() == 'SUCCESS'
			&& rtnDataObj.return_code[0].toUpperCase() == 'SUCCESS')) {
		console.log('支付失败！');
		res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败！]]></return_msg></xml>');
		return;
	}

	// 检查订单是否存在, 如果存在就更新订单状态 ORDER_STATUS=PENDING
	// 如果更新返回的结果等于1: 则更新成功, 如果等于0: 说明已经更新过, 本次通知属于重复通知, 如果返回3: 说明该订单不存在


	console.log('======================');
	console.log('接收到支付结果通知！');
	console.log('======================');


	_DAMIAA_API.paymentComplement(userid, openid, orderid, req.rawBody, function(err, result) {

		if (err || result.error) {
			res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[更新订单状态失败！]]></return_msg></xml>');
			return;
		}

		if (result.data == 3) {
			res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在！]]></return_msg></xml>');
			return;
		}

		if (result.data == 0 || result.data == 1) {
			if (result.data == 1) {
				// TODO
				// 用户支付完成, 需要给管理员发送邮件: 提醒发货
				wchatAPI.orderMessageAlert(orderid, function(err, result) {
					
					if (err) {
						console.log('发送提醒信息失败!');
					}

					if (result) {
						console.log(result);
					}
				});
			}



			res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
			return;
		}

		res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[未知错误！]]></return_msg></xml>');
		return;
	});

});


app.get('/gen-paysign/:prepayid', function(req, res) {
	// 取得 token
	// 根据 token 调用 api.damiaa.com 取得 openid
	var auth 		= req.headers.authorization;
	var prepayid 	= req.params.prepayid;

	var sendResult  			= {error: false, message: null, data: null};	

	if (!auth) {
		sendResult.error 	= true;
		sendResult.data 	= 'permission deny!';
		res.json(sendResult);
	}

	var tokenType 	= auth.split(' ')[0];
	var token 		= auth.split(' ')[1];

	if (!tokenType || !token) {
		sendResult.error 	= true;
		sendResult.message 	= 'invalidate token!';
		res.json(sendResult);
	}

	_DAMIAA_API.getOpenId(token, tokenType, function(err, result) {

		if (err) {
			sendResult.error = true;
			sendResult.data = err;
			sendResult.message 	= 'validate token failed!';
			return res.json(sendResult);
		} 

		var openid = result.data;

		// 验证订单是否存在: 根据 openid 和 prePayId 查询订单, 如果能查到说明是合法请求
		_DAMIAA_API.validateOrder(openid, prepayid, token, tokenType, function(newErr, newResult) {

			if (newErr) {
				sendResult.error = true;
				sendResult.data = newErr;
				sendResult.message 	= 'invalidate order!';
				return res.json(sendResult);
			} 

			if (newResult.data != true) {
				// 无效订单
				sendResult.error = true;
				sendResult.data = newResult;
				sendResult.message 	= 'invalidate order!' + newResult.data;
				return res.json(sendResult);
			}

			// 有效订单, 生成签名
			// "appId" : "wx2421b1c4370ec43b",     //公众号名称，由商户传入     
			// "timeStamp" :" 1395712654",         //时间戳，自1970年以来的秒数     
			// "nonceStr" : "e61463f8efa94090b1f366cccfbbb444", //随机串     
			// "package" : "prepay_id=" + currentOrder.prePayId,     
			// "signType" : "MD5",         //微信签名方式：     
			// "paySign" : "70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名 

			sendResult.data = moment().unix();

			var paySignArr 		= [];
			var paramsString 	= null;
			var paySignObj 	= {
				"appId" : globalConfig.wchat_damiaa_appid,     //公众号名称，由商户传入     
				"timeStamp" : ' ' + moment().unix(),         //时间戳，自1970年以来的秒数     
				"nonceStr" : uuid.v4().replace(/\D/g, '').substring(1,11), //随机串     
				"package" : "prepay_id=" + prepayid,     
				"signType" : "MD5",         //微信签名方式：     
				"paySign" : null //微信签名 
			};

			paySignArr.push('appId=' + paySignObj.appId);
			paySignArr.push('timeStamp=' + paySignObj.timeStamp);
			paySignArr.push('nonceStr=' + paySignObj.nonceStr);
			paySignArr.push('package=' + paySignObj['package']);
			paySignArr.push('signType=' + paySignObj.signType);

			paramsString 		= _.sortBy(paySignArr, function(a){return a}).join('&') + "&key=" + globalConfig.pay_api_key;
			paySignObj.paySign 	= crypto.createHash('md5').update(new Buffer(paramsString)).digest("hex").toUpperCase();	

			sendResult.data = paySignObj;
			sendResult.message 	= paramsString;

			console.log(sendResult.data);

			return res.json(sendResult);
		});
	});
});

app.get("/fanslist", function(req, res, next) {	
	// 取得 token, type: bearer
	// 根据 token 调用 api.damiaa.com 取得用户信息, 只有用户身份是管理员时才允许进一步操作

	var sendResult  = {error: false, message: null, data: null};	
	var auth 		= req.headers.authorization;

	if (!auth) {
		sendResult.error 	= true;
		sendResult.message 	= 'authoriaztion error!';
		res.json(sendResult);
	}

	var tokenType 	= auth.split(' ')[0];
	var token 		= auth.split(' ')[1];



	_DAMIAA_API.me(token, tokenType, function(err, result) {

		if (err) {
			sendResult.error 	= true;
			sendResult.data 	= err;
			sendResult.message 	= 'validate token failed!';
			return res.json(sendResult);
		} 

		if (!(result && result.data && result.data.isAdmin)) {
			sendResult.error 	= true;
			sendResult.data 	= 'permission deny!';
			return res.json(sendResult);
		}

		// 取得粉丝列表
		wchatAPI.getUserList(null, function(error, result) {
			if (error) {
				sendResult.error 	= true;
				sendResult.data 	= error;
				sendResult.message 	= 'wchatAPI.getUserList error!';
				return res.json(sendResult);
			} 

			var fansOpenidList 	= result && result.data ? result.data.openid : null;

			if (!(fansOpenidList && fansOpenidList.length > 0)) {
				sendResult.error 	= false;
				sendResult.data 	= null;
				sendResult.message 	= 'no fans in meantime';
				return res.json(sendResult);
			}
			
			var userInfoList 	= null;
			var partnerList 	= null;
			var isError 		= false;

			nimble.parallel([
				function(callback) {
					wchatAPI.getUserInfoList(fansOpenidList, '', function(err, result) {
						
						if (err) isError = true;

						result = _.sortBy(result, function(u) { return u.subscribe_time * -1});

						var context 	= result.map(function(user) {
							return _.extend(user, {subscribe_time: moment.unix(user.subscribe_time).format('YYYY/MM/DD HH:mm')})
						});
						
						userInfoList 	= context;

						callback();
					});
				}, function(callback) {
					_DAMIAA_API.partnerList(token, tokenType, function(err, result) {
						if (err) isError = true;
						partnerList = result ? result.data : [];

						callback();
					});
				} ]
			, function() {

				if (isError) {
					sendResult.error = true;
					return res.json(sendResult);
				}

				partnerList.forEach(function(partner) {
					userInfoList.forEach(function(user) {
						if (partner.unionid == user.unionid) {
							user.partnerType 	= partner.type;
							user.partnerId 		= partner.id;
							user.qrcode 		= partner.qrcode;
							user.gen 			= partner.gen;
						}
					});
				});

				sendResult.data 	= userInfoList;

				return res.json(sendResult);
			});

			
		});
		
	});

});


http.createServer(app).listen(app.get('port'), function() {
  	console.log('Express server listening on port ' + app.get('port'));
});