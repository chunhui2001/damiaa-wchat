var moment 			= require('moment');
var wchatAPI 		= require('./wchatapi');
var _DAMIAA_API 	= require('./damiaa-api');
var _TMPL_MESSAGE 	= require('./message-template');


function onView (message, callback) {

}

function onSubscribe(message, callback) {	

	console.log(message, "关注~");



	// 1. 搜索公众号关注
	// 2. 扫码关注
	// 3. 名片关注

    // 1. { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1458721177' ],
	// 	msgtype: [ 'event' ],
	// 	event: [ 'subscribe' ],
	// 	eventkey: [ '' ] 
	// }

	// 2. { 
	// 	tousername: [ 'gh_7a09008c1fd9' ],
	// 	fromusername: [ 'ofnVVw9aVxkxSfvvW373yuMYT7fs' ],
	// 	createtime: [ '1458720422' ],
	// 	msgtype: [ 'event' ],
	// 	event: [ 'subscribe' ],
	// 	eventkey: [ 'qrscene_1' ],
	// 	ticket: [ 'gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==' ] 
	// }

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var eventKey 		= message.eventkey && message.eventkey[0];
	var ticket 			= message.ticket && message.ticket[0];

	wchatAPI.getUserInfo(fromOpenId, null, function(err, userinfo) {

		var headimgurl 	= userinfo.headimgurl;
		var unionid 	= userinfo.unionid;

		// 1. 根据用户 openid 查看该用户是否已经注册, 如果没有注册则帮其自动注册
		// 2. 可根据 ticket　和 eventKey 到 QRCODES 表中查到扫的是哪个二维码
		// 3. 如果扫的是公众号二维码, 则无 ticket 和 eventKey 字段, 如果不是扫码关注则，不自动下单


		// 1. register
		_DAMIAA_API.user_register(null, null, fromOpenId, unionid, headimgurl, function(err, result) {

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

			});

			console.log(err || result, '_DAMIAA_API.user_register');

			if (err && err.message.indexOf('exists:') == -1) { 
				console.log(userinfo, "自动注册失败，需手动帮用户注册！(需给管理员发送消息提醒)");

				return callback(null, sendMessage);
			}

			if (!(eventKey && ticket)) {
				// 3. 不是扫码关注，不自动下单
				return callback(null, sendMessage);
			}

			// 注册成功, 帮用户自动下单
			createOrderAuto(fromOpenId, toMasterName, ticket, function(err, messageResult) {
				return callback(null, messageResult);
			});

		});

	});


	

	
	
}

// 一键扫码下单
// function onScancodeWaitmsg(message, callback) {

// 	console.log(message, 'onScancodeWaitmsg');
// 	console.log(message.scancodeinfo[0]['scanresult'], 'scanresult');
// 	console.log(message.scancodeinfo[0]['scantype'], 'scantype');

// 	// 可以通过 qrcodeUri 找到 qrcode entity
// 	// http://weixin.qq.com/r/qDipsY-EKdJWrcvS9226
// 	var qrcodeUri 	= message.scancodeinfo[0]['scanresult'];
	

// 	var fromOpenId 		= message.fromusername[0];
// 	var toMasterName 	= message.tousername[0];
// 	var eventKey 		= message.eventkey[0];

// 	var content 		= null;
// 	var picurl 			= 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==';

// 	// V1001_GOOD

// 	if (eventKey == 'K_setup_order_auto') {
// 		// 1. 根据用户的ｏｐｅｎｉｄ查看是否已经注册
// 		// 2. 如果用户没有注册则显示用户注册网页链接

// 		var isReg 	= false;

// 		if (!isReg) {
// 			content 	= '您还没有注册， 请先去注册！';

// 			var sendMessage 	='<xml><ToUserName><![CDATA[' 
// 							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
// 							+ toMasterName + ']]></FromUserName><CreateTime>' 
// 							+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>2</ArticleCount><Articles>'
// 							+ '<item><Title><![CDATA[' 
// 							+ content + ']]></Title><PicUrl><![CDATA[' 
// 							+ 'http://www.damiaa.com/img/miscellaneous/icon-reg.jpg' + ']]></PicUrl><Url><![CDATA[' 
// 							+ 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfbeee15bbe621e6&redirect_uri=http%3A%2F%2Fwww.damiaa.com%2Fregister&response_type=code&scope=snsapi_base&state=HbYFbj4CAlo72uPw#wechat_redirect' 
// 							+ ']]></Url></item>'
// 							+ '<item><Title><![CDATA[' 
// 							+ '现在就去注册吧.' + ']]></Title><PicUrl><![CDATA[' 
// 							+ 'http://www.damiaa.com/img/miscellaneous/icon-reg2.png' + ']]></PicUrl><Url><![CDATA[' 
// 							+ 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxbfbeee15bbe621e6&redirect_uri=http%3A%2F%2Fwww.damiaa.com%2Fregister&response_type=code&scope=snsapi_base&state=HbYFbj4CAlo72uPw#wechat_redirect' 
// 							+ ']]></Url></item></Articles></xml>';

// 			return callback(null, sendMessage);
// 		} else {
// 			// 1. 根据用户扫面的二维码地址取得该用户关联的商户
// 			var qrcodeAddress 	= message.scancodeinfo[0]['scanresult'];

// 			content 	= '下单成功.';
// 		}		
// 	}

// 	content 		= content == null ? '扫码推事件且弹出“消息接收中”提示框' : content;


// 	var sendMessage 	= '<xml><ToUserName><![CDATA[' 
// 							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
// 							+ toMasterName + ']]></FromUserName><CreateTime>' 
// 							+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
// 							+ content
// 							+ ']]></Content></xml>';

// 	return callback(null, sendMessage);
// }

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

function createOrderAuto(openid, tomaster_name, ticket, callback) {

	var content 	= '正在下单...';
	
	var sendMessage 	= '<xml><ToUserName><![CDATA[' + openid + ']]></ToUserName><FromUserName><![CDATA[' + tomaster_name 
						+ ']]></FromUserName><CreateTime>' 
						+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
						+ content + ']]></Content></xml>';

	callback(null, sendMessage);
	
	var goodsId 		= '941174731905';

	var orderData 	= {
	    "paymethod": 1,
	    "auto_create": true, 
	    "openid": openid, 
	    "ticket": ticket
	};

	orderData[goodsId] 	= 1;		// 商品数量

	_DAMIAA_API.createOrder(orderData, function(err, result) {
		if (err) {
			return callback(err, null);
		}

		var template_id 	= 'ZeegwAFvEv2sAgNdhOZk3nRyLf0NM1GTqR_kASIBepI';
		var postData 		= _TMPL_MESSAGE[template_id];

		console.log(err || result, 'postData');

		var totalPrice 		= result.itemMoney.toFixed(2); //'0.00（原价: 128.00）';
		var weight 			= '5kg';
		var isFree 			= false;

		if (totalPrice == 0.00) {
			isFree 	= true;
			totalPrice = totalPrice;
			weight 		= '1.25kg';
		}

		postData.first.value 			= 'AA精米' + (isFree ? '（特惠商品）' : '');

		postData.orderno.value 			= result.id;
		postData.refundproduct.value 	= '¥ ' + totalPrice;
		postData.refundno.value 		= '1袋（' + weight + '）';
		postData.remark.value 			= '\r\n' + (isFree ? '当前时间下单免费, ' : '') + '点击详情完善订单信息';

		// 通知用户下单成功
		wchatAPI.sendTemplateMessage(template_id
				, 'http://wap.damiaa.com/#/payment/' + result.id, '#FF0000', openid
				, postData, function(err, result) {

		});

	});

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

	var fromOpenId 		= message.fromusername[0];
	var toMasterName 	= message.tousername[0];
	var ticket 			= message.ticket[0];

	console.log(message, "扫码下单~");

	var content 	= '正在下单...';
	
	var sendMessage 	= '<xml><ToUserName><![CDATA[' + fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' + toMasterName 
						+ ']]></FromUserName><CreateTime>' 
						+ moment().unix() + '</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' 
						+ content + ']]></Content></xml>';

	callback(null, sendMessage);

	// 根据 fromusername 找用户, 根据用户下单
	// 根据 ticket 到 QRCODES 表中找 openid
	// 根据 openid 找 partner id

	// 帮用户自动下单
	createOrderAuto(fromOpenId, toMasterName, message.ticket[0], function(err, messageResult) {

		if (err) {
			wchatAPI.getUserInfo(fromOpenId, null, function(err, userinfo) {

				var headimgurl 	= userinfo.headimgurl;
				var unionid 	= userinfo.unionid;

				_DAMIAA_API.user_register(null, null, fromOpenId, unionid, headimgurl, function(err, result) {

					console.log(err || result, '_DAMIAA_API.user_register');

					if (err && err.message.indexOf('exists:') == -1) {
						console.log(userinfo, "自动注册失败，需手动帮用户注册！(需给管理员发送消息提醒)");
						return;
					}

					// 注册成功, 帮用户自动下单
					createOrderAuto(fromOpenId, toMasterName, ticket, function(err, messageResult) {
						
						console.log(messageResult, 'createOrderAuto messageResult');
					});

				});

			});
		} else {
			//return callback(null, sendMessage);
			console.log(messageResult, 'createOrderAuto messageResult');
		}

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

	if (eventKey == 'K_V1001_GOOD') {
		content 	= '欢迎来到 "AA精米".';
	}

	if (eventKey == 'K_BOSS') {
		content 	= 'Hi, BOSS.';
	}

	if (eventKey == 'K_MY_QRCODE') {

		content 	= '我的二维码.';

		// {
		// 	"media_id":"LtqIc6AyH_5v4_hP93hkiz58hVlEqqIjmLxVrniWIlk",
		// 	"url":"http:\/\/mmbiz.qpic.cn\/mmbiz\/yM1PhmSgm3f7ibc7GdiccUfq5DfuSicgAyLLyqc3Myq0fXDcuoufWOyLzgyoDNapTSvWBRvKNs1g6OV9nWPZgJ67g\/0?wx_fmt=jpeg"
		// }

		// var media_id 	= 'LtqIc6AyH_5v4_hP93hkiz58hVlEqqIjmLxVrniWIlk'; // 二维码海报
		// var media_id 	= 'LtqIc6AyH_5v4_hP93hki3UZODSTnWjeen8xrx9U3do'; // 二维码海报
		// var media_id 	= 'LtqIc6AyH_5v4_hP93hki6WMKsJTFHual7lmIZqPToI'; // 二维码海报
		var media_id 	= 'LtqIc6AyH_5v4_hP93hki2wdRZC6znGCduhBw1wE-2o';

		var sendMessage 	='<xml><ToUserName><![CDATA[' 
									+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
									+ toMasterName + ']]></FromUserName><CreateTime>' 
									+ moment().unix() + '</CreateTime><MsgType><![CDATA[image]]></MsgType><Image><MediaId><![CDATA[' 
									+ media_id + ']]></MediaId></Image></xml>';

		return callback(null, sendMessage);					

		// 根据用户的 openid 取得用户二维码
		// _DAMIAA_API.getQrcode(fromOpenId, function(err, result) {

		// 	var sendMessage 	= null;

		// 	if (!result.mediaId) {
		// 		var picurl 		= err ? '' : result.gen;

		// 		if (err) content 	= '未能取得您的二维码!'

		// 		sendMessage 	='<xml><ToUserName><![CDATA[' 
		// 							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
		// 							+ toMasterName + ']]></FromUserName><CreateTime>' 
		// 							+ moment().unix() + '</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>2</ArticleCount><Articles>'
		// 							+ '<item><Title><![CDATA[' 
		// 							+ content + ']]></Title><PicUrl><![CDATA[' 
		// 							+ picurl + ']]></PicUrl><Url><![CDATA[' 
		// 							+ picurl
		// 							+ ']]></Url></item>'
		// 							+ '<item><Title><![CDATA[' 
		// 							+ '点击查看原图' + ']]></Title><PicUrl><![CDATA[' 
		// 							+ picurl + ']]></PicUrl><Url><![CDATA[' 
		// 							+ picurl + ']]></Url></item></Articles></xml>';
		// 	} else {
		// 		var sendMessage 	='<xml><ToUserName><![CDATA[' 
		// 							+ fromOpenId + ']]></ToUserName><FromUserName><![CDATA[' 
		// 							+ toMasterName + ']]></FromUserName><CreateTime>' 
		// 							+ moment().unix() + '</CreateTime><MsgType><![CDATA[image]]></MsgType><Image><MediaId><![CDATA[' 
		// 							+ result.mediaId + ']]></MediaId></Image></xml>';
		// 	}


		// 	return callback(null, sendMessage);
		// });
		
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

	// 注册成功, 帮用户自动下单
	createOrderAuto('ofnVVw9aVxkxSfvvW373yuMYT7fs', 'gh_7a09008c1fd9', 
		'gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==', 
		function(err, messageResult) {
		console.log(err || messageResult);
	});

} else {
	module.exports 	= {
		onPush: onPush
	}
}



