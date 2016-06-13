var moment 			= require('moment');
var wchatAPI 		= require('./wchatapi');
var _DAMIAA_API 	= require('./damiaa-api');
var _TMPL_MESSAGE 	= require('./message-template');


function onView (message, callback) {

}

function onSubscribe(message, callback) {	
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

// 一键扫码下单
function onScancodeWaitmsg(message, callback) {

	console.log(message, 'onScancodeWaitmsg');
	console.log(message.scancodeinfo[0]['scanresult'], 'scanresult');
	console.log(message.scancodeinfo[0]['scantype'], 'scantype');

	// 可以通过 qrcodeUri 找到 qrcode entity
	// http://weixin.qq.com/r/qDipsY-EKdJWrcvS9226
	var qrcodeUri 	= message.scancodeinfo[0]['scanresult'];
	

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var eventKey 		= message.eventkey[0];

	var content 		= null;
	var picurl 			= 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==';

	// V1001_GOOD

	if (eventKey == 'K_setup_order_auto') {
		// 1. 根据用户的ｏｐｅｎｉｄ查看是否已经注册
		// 2. 如果用户没有注册则显示用户注册网页链接

		var isReg 	= false;

		if (!isReg) {
			content 	= '您还没有注册， 请先去注册！';

			var sendMessage 	='<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>2</ArticleCount><Articles>'
							+ '<item><Title><![CDATA[' 
							+ content + ']]></Title><PicUrl><![CDATA[' 
							+ 'http://www.damiaa.com/img/miscellaneous/icon-reg.jpg' + ']]></PicUrl><Url><![CDATA[' 
							+ 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfbeee15bbe621e6&redirect_uri=http%3A%2F%2Fwww.damiaa.com%2Fregister&response_type=code&scope=snsapi_base&state=HbYFbj4CAlo72uPw#wechat_redirect' 
							+ ']]></Url></item>'
							+ '<item><Title><![CDATA[' 
							+ '现在就去注册吧.' + ']]></Title><PicUrl><![CDATA[' 
							+ 'http://www.damiaa.com/img/miscellaneous/icon-reg2.png' + ']]></PicUrl><Url><![CDATA[' 
							+ 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfbeee15bbe621e6&redirect_uri=http%3A%2F%2Fwww.damiaa.com%2Fregister&response_type=code&scope=snsapi_base&state=HbYFbj4CAlo72uPw#wechat_redirect' 
							+ ']]></Url></item></Articles></xml>';

			return callback(null, sendMessage);
		} else {
			// 1. 根据用户扫面的二维码地址取得该用户关联的商户
			var qrcodeAddress 	= message.scancodeinfo[0]['scanresult'];

			content 	= '下单成功.';
		}		
	}

	content 		= content == null ? '扫码推事件且弹出“消息接收中”提示框' : content;


	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	return callback(null, sendMessage);
}

function onScancodePush(message, callback) {
	console.log(message, 'onScancodePush');

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var content 		= '微信客户端将调起扫一扫工具';

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	return callback(null, sendMessage);
}

function onSendTemplateMsgFinished(message, callback) {

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var content 		= 'onSendTemplateMsgFinished';

	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';

	return callback(null, sendMessage);
}

// 打开 “微信扫一扫” 时可触发该消息推送
// 长按维码时也可以触发该消息推送
// 扫 "公众号二维码" 时不会有消息推送
// 扫 "下发二维码" 时可触发该消息推送
function onScan(message, callback) {

	// { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1458719860' ],
	// 	msgtype: [ 'event' ],
	// 	event: [ 'SCAN' ],
	// 	eventkey: [ '1' ],
	// 	ticket: [ 'gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==' ] 
	// }

	// 根据 fromusername 找用户, 根据用户下单
	// 根据 ticket 到 QRCODES 表中找 openid
	// 根据 openid 找 partner id

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];

	var content 		= null;
	var isReg 			= false;

	var goodsId 		= '941174731905';

	var orderData 	= {
	    "paymethod": 1,
	    "auto_create": true, 
	    "openid": message.fromusername ? message.fromusername[0]: null, 
	    "ticket": message.ticket ? message.ticket[0] : null
	};

	orderData[goodsId] 	= 1;

	_DAMIAA_API.createOrder(orderData, function(err, result) {
		if (err) {
			if (err.status == 'NOT_ACCEPTABLE') {
				content 	= '您还没有注册， 请先去注册！';

				var sendMessage 	='<xml><ToUserName><![CDATA[' 
				+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
				+ toMasterName + ']]></FromUserName><CreateTime>' 
				+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>2</ArticleCount><Articles>'
				+ '<item><Title><![CDATA[' 
				+ content + ']]></Title><PicUrl><![CDATA[' 
				+ 'http://www.damiaa.com/img/miscellaneous/icon-reg.jpg' + ']]></PicUrl><Url><![CDATA[' 
				+ 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfbeee15bbe621e6&redirect_uri=http%3A%2F%2Fwww.damiaa.com%2Fregister&response_type=code&scope=snsapi_base&state=HbYFbj4CAlo72uPw#wechat_redirect' 
				+ ']]></Url></item>'
				+ '<item><Title><![CDATA[' 
				+ '现在就去注册吧...' + ']]></Title><PicUrl><![CDATA[' 
				+ 'http://www.damiaa.com/img/miscellaneous/icon-reg2.png' + ']]></PicUrl><Url><![CDATA[' 
				+ 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfbeee15bbe621e6&redirect_uri=http%3A%2F%2Fwww.damiaa.com%2Fregister&response_type=code&scope=snsapi_base&state=HbYFbj4CAlo72uPw#wechat_redirect' 
				+ ']]></Url></item></Articles></xml>';

				return callback(null, sendMessage);
			} else {
				// 下单失败稍后再试
			}

			return;
		}
		
		// TODO
		content 	= '下单成功.';
		
		var sendMessage 	= '<xml><ToUserName><![CDATA[' 
							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
							+ toMasterName + ']]></FromUserName><CreateTime>' 
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
							+ content
							+ ']]></Content></xml>';
		// var picurl 			= 'http://www.damiaa.com/img/miscellaneous/icon-reg2.png';
		// var sendMessage 	='<xml><ToUserName><![CDATA[' 
		// 						+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
		// 						+ toMasterName + ']]></FromUserName><CreateTime>' 
		// 						+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>2</ArticleCount><Articles>'
		// 						+ '<item><Title><![CDATA[' 
		// 						+ content + ']]></Title><PicUrl><![CDATA[' 
		// 						+ picurl + ']]></PicUrl><Url><![CDATA[' 
		// 						+ picurl
		// 						+ ']]></Url></item>'
		// 						+ '<item><Title><![CDATA[' 
		// 						+ '详情' + ']]></Title><Url><![CDATA[' 
		// 						+ picurl + ']]></Url></item></Articles></xml>';

		var template_id 	= 'ZeegwAFvEv2sAgNdhOZk3nRyLf0NM1GTqR_kASIBepI';
		var postData 		= _TMPL_MESSAGE[template_id];

		postData.first.value 			= 'AA精米';
		postData.orderno.value 			= result.id;
		postData.refundproduct.value 	= '0.00（原价: 128.00）';
		postData.refundno.value 		= '1袋/5千克';
		postData.remark.value 			= '\r\n点击详情完善订单信息';

		// 通知用户下单成功
		wchatAPI.sendTemplateMessage(template_id
				, 'http://wap.damiaa.com/', '#FF0000', fromOpenId
				, postData, function(err, result) {

		});


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

	if (eventKey == 'K_MY_QRCODE') {

		content 	= '我的二维码.';

		// 根据用户的 openid 取得用户二维码
		_DAMIAA_API.getQrcode(fromOpenId, function(err, result) {
			var picurl 		= err ? '' : result.gen;

			if (err) content 	= '未能取得您的二维码!'

			var sendMessage 	='<xml><ToUserName><![CDATA[' 
								+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
								+ toMasterName + ']]></FromUserName><CreateTime>' 
								+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>2</ArticleCount><Articles>'
								+ '<item><Title><![CDATA[' 
								+ content + ']]></Title><PicUrl><![CDATA[' 
								+ picurl + ']]></PicUrl><Url><![CDATA[' 
								+ picurl
								+ ']]></Url></item>'
								+ '<item><Title><![CDATA[' 
								+ '点击查看原图' + ']]></Title><PicUrl><![CDATA[' 
								+ picurl + ']]></PicUrl><Url><![CDATA[' 
								+ picurl + ']]></Url></item></Articles></xml>';

			// TODO
			// var sendMessage 	='<xml><ToUserName><![CDATA[' 
			// 					+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
			// 					+ toMasterName + ']]></FromUserName><CreateTime>' 
			// 					+ moment().unix() + '</CreateTime><MsgType><![CDATA[image]]></MsgType><Image><MediaId><![CDATA[' 
			// 					+ 'LtqIc6AyH_5v4_hP93hki2_BfW9M61tatl-i-4tjEyQ' + ']]></MediaId></Image></xml>';

			return callback(null, sendMessage);
		});
		
	} else {

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
	
}

function onPicWeixin (message, callback) {

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var eventKey 		= message.eventkey[0];

	var content 		= null;

	if (eventKey == 'K_upload_head_photo') {
		content 	= '弹出微信相册发图器.';
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
							+ moment().unix() + '</CreateTime><MsgType><![CDATA[¬s]]></MsgType><ArticleCount>1</ArticleCount><Articles>'
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

	if (message.msgtype[0] == 'image') return onImage(message, callback);
	if (message.msgtype[0] == 'text') return onText(message, callback);

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
			case 'scancode_push':
				return onScancodePush(message, callback);
				break;
			case 'scancode_waitmsg':
				return onScancodeWaitmsg(message, callback);
				break;
			case 'templatesendjobfinish':
				return onSendTemplateMsgFinished(message, callback);
				break;
			default:
				console.log('未能捕捉到事件: ' + message.event[0] + ", " + message.event[0].toLowerCase());
		}
	}

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