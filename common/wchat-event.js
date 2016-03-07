var moment 		= require('moment');



function onView (message, callback) {

}


function onClick (message, callback) {

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var eventKey 		= message.eventkey[0];

	var content 		= null;

	// V1001_GOOD

	if (eventKey == 'V1001_GOOD') {
		content 	= '欢迎来到 "AA精米".';
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

	if (eventKey == 'upload_head_photo') {
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

	var picurl 			= message.picurl;
	var mediaid 		= message.mediaid;

	// TODO:
	// 根据用户 openid 更新用户头像 

	// http://mp.weixin.qq.com/wiki/1/6239b44c206cab9145b1d52c67e6c551.html

	var sendMessage 	='<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>1</ArticleCount><Articles>'
							+ '<item><Title><![CDATA[' 
							+ '上传成功头像.' + ']]></Title><PicUrl><![CDATA[' 
							+ picurl + ']]></PicUrl><Url><![CDATA[' 
							+ picurl + ']]></Url></item></Articles></xml>';

	return callback(null, sendMessage);
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
		if (message.event[0] == 'VIEW') {			
			return onView(message, callback);
		} else if (message.event[0] == 'CLICK'){
			return onClick(message, callback);
		} else if (message.event[0] == 'pic_weixin'){
			return onPicWeixin(message, callback);
		}
	}

	if (message.msgtype[0] == 'image') return onImage(message, callback);

	if (message.msgtype[0] == 'text') return onText(message, callback);


	// nothing to 
	// should be send out an email to administrator
}


if (require.main == module) {
	
} else {
	module.exports 	= {
		onPush: onPush
	}
}