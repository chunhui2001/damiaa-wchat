var moment 			= require('moment');
var wchatAPI 		= require('./wchatapi');
var _DAMIAA_API 	= require('./damiaa-api');


function onView (message, callback) {

}

function onSubscribe(message, callback) {	
	console.log(message, 'onSubscribe');

	// { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1458720422' ],
	// 	msgtype: [ 'event' ],
	// 	event: [ 'subscribe' ],
	// 	eventkey: [ 'qrscene_1' ],
	// 	ticket: [ 'gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==' ] 
	// }

	// 可根据 ticket　和 eventKey 关联到具体的经商信息

	// { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1458721177' ],
	// 	msgtype: [ 'event' ],
	// 	event: [ 'subscribe' ],
	// 	eventkey: [ '' ] 
	// }

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var content 		= '欢迎关注 "AA精米" 东北大米微信直销平台, 祝您生活愉快.';

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	wchatAPI.joinGroup(fromOpenId, null, function(err, result) {
		if (err) console.log(err, "joinGroup ERROR");

		console.log(result, "joinGroup Success");
		
		return callback(null, sendMessage);
	});
	
}



function onScan(message, callback) {
	console.log(message, 'onScan');

	// { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1458719860' ],
	// 	msgtype: [ 'event' ],
	// 	event: [ 'SCAN' ],
	// 	eventkey: [ '1' ],
	// 	ticket: [ 'gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==' ] 
	// }

	// 可在此处实现扫码下单逻辑

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var content 		= '欢迎关注 "AA精米" 东北大米微信直销平台, 祝您生活愉快 ：）';

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	wchatAPI.joinGroup(fromOpenId, null, function(err, result) {
		if (err) console.log(err, "joinGroup ERROR");

		console.log(result, "joinGroup Success");
		
		return callback(null, sendMessage);
	});
}

function onUnSubscribe(message, callback) {

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var content 		= '取消关注';

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	return callback(null, sendMessage);
}

function onClick (message, callback) {

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var eventKey 		= message.eventkey[0];

	var content 		= null;

	// V1001_GOOD

	if (eventKey == 'K_V1001_GOOD') {
		content 	= '欢迎来到 "AA精米".';
	}

	if (eventKey == 'K_BOSS') {
		content 	= 'Hi, BOSS.';
	}

	if (content == null) {
		content = '(null) ' + eventKey;
	}

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	return callback(null, sendMessage);
}

function onPicWeixin (message, callback) {

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var eventKey 		= message.eventkey[0];

	var content 		= null;

	if (eventKey == 'K_upload_head_photo') {
		content 	= '上传头像.';
	}

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	return callback(null, sendMessage);

}


function onImage (message, callback) {

	// http://mp.weixin.qq.com/wiki/1/6239b44c206cab9145b1d52c67e6c551.html

	// { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1457358458' ],
	// 	msgtype: [ 'image' ],
	// 	picurl: [ 'http://mmbiz.qpic.cn/mmbiz/LkTJ6asKHQwhYr7eZPvI9fr3pKWr3eNnzwOvnbZob9diblctbu1hMISCx9qvsfXPYAX2pDGrHYMjMLPmsiapg2GA/0' ],
	// 	msgid: [ '6259306916066696646' ],
	// 	mediaid: [ 'QBnPKfd7qM6r1YJA63PZxool1XyDfL7ADBXRB3N3ftR-tvlW2ugzSc4Z0Up1Os6t' ] 
	// }

	// 用户注册时需拿到用户的 openid 并存到数据库中

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var picurl 			= message.picurl[0];
	var mediaid 		= message.mediaid;

	// TODO:
	// 根据用户 openid 更新用户头像 
	_DAMIAA_API.uploadImage(fromOpenId, picurl, function(err, result) {

		var info 	= '上传成功头像.';

		if (err) {
			info = '上传头像失败. (' + err.message + ')';
		}


		var sendMessage 	='<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>1</ArticleCount><Articles>'
							+ '<item><Title><![CDATA[' 
							+ info + ']]></Title><PicUrl><![CDATA[' 
							+ picurl + ']]></PicUrl><Url><![CDATA[' 
							+ picurl + ']]></Url></item></Articles></xml>';

		return callback(err, sendMessage);

	});

}

function onText(message, callback) {
	// http://mp.weixin.qq.com/wiki/1/6239b44c206cab9145b1d52c67e6c551.html

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var content 		= message.content[0];


	// 根据用户发送消息的格式调用相应接口
	// 1. 如果用户发送的消息格式与订单号格式匹配则显示该订单号的详细信息
	// 2. ......

	
	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ 'Keesh say: ' + content + '' 
							+ ']]></Content></xml>';

	return callback(null, sendMessage);
}


function onPush (message, callback) {

	/*
		{
			tousername: [ 'gh_7a09008c1fd9' ],
			fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
			createtime: [ '1457358387' ],
			msgtype: [ 'event' ],
			event: [ 'CLICK' ],
			eventkey: [ 'V1001_GOOD' ] 
	     }

	    
	*/

	// event
	// image
	// text

	if (message.msgtype[0] == 'event') {
		switch(message.event[0].toLowerCase()) {
			case 'view':	
				return onView(message, callback);
				break;
			case 'click':
				return onClick(message, callback);
				break;
			case 'pic_weixin':
				return onPicWeixin(message, callback);
				break;
			case 'unsubscribe':
				return onUnSubscribe(message, callback);
				break;
			case 'subscribe':
				return onSubscribe(message, callback);
				break;
			case 'scan':
				return onScan(message, callback);
				break;
			default:
				console.log('未能捕捉到事件: ' + message.event[0] + ", " + message.event[0].toLowerCase());
		}
	}

	if (message.msgtype[0] == 'image') return onImage(message, callback);

	if (message.msgtype[0] == 'text') return onText(message, callback);


	// nothing to 
	// should be send out an email to administrator
}


if (require.main == module) {

	// onImage( { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1457358458' ],
	// 	msgtype: [ 'image' ],
	// 	picurl: [ 'http://mmbiz.qpic.cn/mmbiz/LkTJ6asKHQwhYr7eZPvI9fr3pKWr3eNnzwOvnbZob9diblctbu1hMISCx9qvsfXPYAX2pDGrHYMjMLPmsiapg2GA/0' ],
	// 	msgid: [ '6259306916066696646' ],
	// 	mediaid: [ 'QBnPKfd7qM6r1YJA63PZxool1XyDfL7ADBXRB3N3ftR-tvlW2ugzSc4Z0Up1Os6t' ] 
	// }, function(err, result) {
	// 	if (err) return console.log(err, 'onImage err');

	// 	console.log(result, 'onImage success');
	// });

} else {
	module.exports 	= {
		onPush: onPush
	}
}