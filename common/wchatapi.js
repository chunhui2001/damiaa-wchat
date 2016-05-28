var _ 			= require('underscore');
var crypto 		= require('crypto');
var xml2json 	= require('xml2json');
var uuid 		= require('node-uuid');

var httpClient 		= require('./http-client').httpClient;
var endpoints 		= require('../config/endpoints');
var globalConfig 	= require('../config/global');

var _FETCH_TOKEN 	= require('./support').fetchAccessToken;

var accessToken		= globalConfig.current_access_token;
var MENU_KEYS		= globalConfig.menuKeys;

var ENDPOINTS_GET_ACCESS 	= endpoints.wchat_get_access_token;
var ENDPOINTS_IP_LIST 		= endpoints.wchat_ip_list;

var ENDPOINTS_GEN_MENU 		= endpoints.wchat_gen_menu;
var ENDPOINTS_GEN_SPEC_MENU	= endpoints.wchat_gen_spec_menu;
var ENDPOINTS_DEL_SPEC_MENU	= endpoints.wchat_del_spec_menu;
var ENDPOINTS_GET_MENU 		= endpoints.wchat_get_menu;

var ENDPOINTS_CREATE_GROUP 			= endpoints.wchat_create_group;
var ENDPOINTS_JOIN_GROUP 			= endpoints.wchat_join_group;
var ENDPOINTS_GET_ALL_GROUPS		= endpoints.wchat_get_all_groups;
var ENDPOINTS_GET_GROUPID_BYUSER	= endpoints.wchat_get_groupid_by_user

var ENDPOINTS_GET_USERLIST			= endpoints.wchat_get_userlist;
var ENDPOINTS_GET_USERINFO			= endpoints.wchat_get_userinfo;

var ENDPOINTS_GET_USER_ACCESS_TOKEN		= endpoints.wchat_get_user_access_token;
var ENDPOINTS_PAY_UNIFIEDORDER			= endpoints.wchat_pay_unifiedorder;

var ENDPOINTS_SEND_MESSAGE			= endpoints.wchat_send_message;
var ENDPOINTS_GET_JSAPI_TICKET		= endpoints.wchat_get_jsapi_ticket;
var ENDPOINTS_GEN_QRCODE_NONEXPIRED = endpoints.wchat_gen_qrcode_nonexpired;




function getUserAccessToken(code, grantType, callback) {
	httpClient(ENDPOINTS_GET_USER_ACCESS_TOKEN.replace('{{{CODE}}}', code).replace('{{{GRANT_TYPE}}}', grantType)
				, null, 'get', null, function(error, result) {

		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		// { 
		// 	access_token: 'OezXcEiiBSKSxW0eoylIeHY1i2IU6goc4iJ1rEpZEAT5ed4Xx1lB3BaaShDqg9SWCokh2mBp30k8vNrU9_xrtA6PCbuTRNyZm7GzDs9iSSoAMQRkS9fXEh7t31Yf3gTbqdM7quIiftA8V59-Z842sw',
		// 	expires_in: 7200,
		// 	refresh_token: 'OezXcEiiBSKSxW0eoylIeHY1i2IU6goc4iJ1rEpZEAT5ed4Xx1lB3BaaShDqg9SW4v_JtbKHbyJqYxVZB2zlmLc5QOGLPFWsp5k0MPGrVIlisKDaC04hU-3qGJ7xv_kNAMwWjRV2hmv-2MOPzNEynw',
		// 	openid: 'ofnVVw9aVxkxSfvvW373yuMYT7fs',
		// 	scope: 'snsapi_base' 
		// }

		var openid 	= result.openid;

		getUserInfo(openid, null, function(newError, newResult) {
			console.log(newError, "newError");
			if (newError) return callback(newError);

			if (newResult.errcode) {
				return callback(newResult);
			}

		// { 
		// 	subscribe: 1,
		// 	openid: 'ofnVVw9aVxkxSfvvW373yuMYT7fs',
		// 	nickname: 'Keesh',
		// 	sex: 1,
		// 	language: 'zh_CN',
		// 	city: '朝阳',
		// 	province: '北京',
		// 	country: '中国',
		// 	headimgurl: 'http://wx.qlogo.cn/mmopen/PiajxSqBRaEINIgLWEwQamb0O4c32QKE5yTLv01soN60Kia6HgJLkibiaYKTibZyR2Ea5jkosOIxJgFQdwzJXVJKQZQ/0',
		// 	subscribe_time: 1457519201,
		// 	unionid: 'oW9u5waS3S4BMyMj1oumo1gHRneY',
		// 	remark: '',
		// 	groupid: 100 
		// }

			//console.log(newResult, "newResult");
			return callback(null, newResult);
		});

	});
}

function getAccessToken(callback) {
	// http://mp.weixin.qq.com/wiki/14/9f9c82c1af308e3b14ba9b973f99a8ba.html

	httpClient(ENDPOINTS_GET_ACCESS, null, 'get', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});


	// httpClient(ENDPOINTS_GET_ACCESS, null, 'get', null).then(function(result) {
	// 	return callback(null, result);
	// });
}

function getIPList(callback) {
	// http://mp.weixin.qq.com/wiki/4/41ef0843d6e108cf6b5649480207561c.html

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;

		httpClient(ENDPOINTS_IP_LIST.replace('{{{ACCESS_TOKEN}}}', currentToken), null, 'get', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result.ip_list);
		});
	});
}

function getMenu(callback) {
	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;

		httpClient(ENDPOINTS_GET_MENU.replace('{{{ACCESS_TOKEN}}}', currentToken), null, 'get', null, function(error, result) {

			if (error) return callback(error);

			if (result.errcode) {
				return callback(result);
			}

			console.log(JSON.stringify(result.menu), 'menu');
			console.log(JSON.stringify(result.conditionalmenu), 'conditionalmenu');
			return callback(null, result);
		});
	});
}

function genMenu(meun, callback) {
	// http://mp.weixin.qq.com/wiki/10/0234e39a2025342c17a7d23595c6b40a.html

	var theMeun 	= {
			"button":[
				{	
					"type":"view",
					"name":"AA精米",
					"url":"http://wap.damiaa.com/"
				}, 
				// {
				// 	"type":"view",
				// 	"name":"历史订单",
				// 	"url":"http://wap.damiaa.com/account-orders"
				// }, 
				{
					"name":"菜单",
					"sub_button":[ {
		                    "type": "scancode_waitmsg", 
		                    "name": "一键扫码下单", 
		                    "key": MENU_KEYS.KEY_SetupOrder_AUTO
		                }, {
						   "type": "pic_weixin", 
							"name": "上传头像", 
							"key": MENU_KEYS.KEY_UploadHeadPhoto, 
						}, {
							"type":"view",
							"name":"用户登陆",
							"url":"http://wap.damiaa.com/login/"
						}
		                // , {
		                //     "type": "scancode_push", 
		                //     "name": "扫码推事件", 
		                //     "key": "rselfmenu_0_1"
		                // }
					]
				}
			]
	};	

	if (meun) theMeun = meun;

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;

		httpClient(ENDPOINTS_GEN_MENU.replace('{{{ACCESS_TOKEN}}}', currentToken), theMeun, 'post', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function delSpecMenu(menuid, callback) {	
	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		httpClient(ENDPOINTS_DEL_SPEC_MENU.replace('{{{ACCESS_TOKEN}}}', currentToken)
				, {"menuid":menuid}, 'post', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function genSpecMenu(specMenu, callback) {
	// http://mp.weixin.qq.com/wiki/0/c48ccd12b69ae023159b4bfaa7c39c20.html

	var theSpecMeun 	= {
			"button":[
				{	
					"type":"view",
					"name":"AA精米",
					"url":"http://wap.damiaa.com/"
				} , 
				// {
				// 	"type":"view",
				// 	"name":"历史订单",
				// 	"url":"http://wap.damiaa.com/account-orders"
				// } , 
				{
					"name":"菜单",
					"sub_button":[ {
		                    "type": "scancode_waitmsg", 
		                    "name": "一键扫码下单", 
		                    "key": MENU_KEYS.KEY_SetupOrder_AUTO
		                }, {
		                    "type": "click", 
		                    "name": "我的二维码", 
		                    "key": MENU_KEYS.MY_QRCODE
		                }, {
						   "type": "pic_weixin", 
							"name": "上传头像", 
							"key": MENU_KEYS.KEY_UploadHeadPhoto, 
						}, {
							"type":"view",
							"name":"用户登陆",
							"url":"http://wap.damiaa.com/#/login/"
						}, {
						   "type":"click",
						   "name":"BOSS专属",
						   "key": MENU_KEYS.KEY_BOSS
						}
		                // , {
		                //     "type": "scancode_push", 
		                //     "name": "扫码推事件", 
		                //     "key": "rselfmenu_0_1"
		                // }
					]
				}
			],
			"matchrule":{
				"group_id": 100
			}
	};	

	// theSpecMeun 	= {
	// 		"button":[
	// 			{	
	// 				"type":"view",
	// 				"name":"AA精米",
	// 				"url":"http://damiaa.com:8100/"
	// 			}, 
	// 			{
	// 				"type": "pic_weixin", 
	// 				"name": "上传头像", 
	// 				"key": MENU_KEYS.KEY_UploadHeadPhoto, 
	// 				"sub_button": [ ]
	// 			}, 
	// 			{
	// 				"name":"菜单",
	// 				"sub_button":[ 
	// 					{
	// 					   "type":"view",
	// 					   "name":"测试专用",
	// 					   "url":"http://v.qq.com/"
	// 					},
	// 					{
	// 					   "type":"view",
	// 					   "name":"视频",
	// 					   "url":"http://v.qq.com/"
	// 					}
	// 				]
	// 			}
	// 		],
	// 		"matchrule":{
	// 			"group_id": 101
	// 		}
	// }

	if (specMenu) theSpecMeun = specMenu;

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		
		httpClient(ENDPOINTS_GEN_SPEC_MENU.replace('{{{ACCESS_TOKEN}}}', currentToken), theSpecMeun, 'post', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function createGroup(groupName, callback) {
	if (_.isEmpty(groupName)) return callback('groupName 不可以为空！');

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		httpClient(ENDPOINTS_CREATE_GROUP.replace('{{{ACCESS_TOKEN}}}', currentToken)
						, {"group":{"name": groupName}}, 'post', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});

}

function joinGroup(openid, groupid, callback) {	
	if (_.isEmpty(openid)) return callback('openid 不可以为空！');

	var groupMapping 	= {
			"ofnVVw9aVxkxSfvvW373yuMYT7fs": "100",		// 100 => boss
			"asd": "101"									// 101 => developer
	};

	if (_.isEmpty(groupid)) {
		if (groupMapping[openid])
			groupid = groupMapping[openid];
		else {
			return callback('groupid 不可以为空！');
		}
	}


	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		httpClient(ENDPOINTS_JOIN_GROUP.replace('{{{ACCESS_TOKEN}}}', currentToken)
					, {"openid":openid,"to_groupid":groupid}, 'post', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function getAllGroups(callback) {
	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		httpClient(ENDPOINTS_GET_ALL_GROUPS.replace('{{{ACCESS_TOKEN}}}', currentToken)
					, null, 'get', null, function(error, result) {
			if (error) return callback(error);

			// {"errcode":40013,"errmsg":"invalid appid"}
			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function getGroupByUser(openid, callback) {
	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		httpClient(ENDPOINTS_GET_GROUPID_BYUSER.replace('{{{ACCESS_TOKEN}}}', currentToken)
						, {"openid": openid}, 'post', null, function(error, result) {

			if (error) return callback(error);

			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function getUserList(nextOpenId, callback) {	
	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		
		var endpoints 	= ENDPOINTS_GET_USERLIST.replace('{{{ACCESS_TOKEN}}}', currentToken);

		if (!_.isEmpty(nextOpenId)) {
			endpoints 	= endpoints.replace('{{{NEXT_OPENID}}}', nextOpenId);
		} else {
			endpoints 	= endpoints.replace('&next_openid={{{NEXT_OPENID}}}', '');
		}

		httpClient(endpoints, null, 'get', null, function(error, result) {
			if (error) {
				return callback(error);
			}

			if (result.errcode) {
				result.token 	= currentToken;
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function getUserInfo(openid, lang, callback) {
	if (_.isEmpty(openid)) return callback('openid 不可以为空！');
	if (_.isEmpty(lang)) lang 	= 'zh_CN';

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;
		
		httpClient(ENDPOINTS_GET_USERINFO
					  .replace('{{{ACCESS_TOKEN}}}', currentToken)
					  .replace('{{{OPENID}}}', openid)
					  .replace('{{{zh_CN}}}', lang)
					, null, 'get', null, function(error, result) {

			if (error) return callback(error);

			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

function getUserInfoList(openidArray, lang, callback) {
	if (_.isEmpty(openidArray) || _.isNull(openidArray) || _.isNaN(openidArray) || _.isUndefined(openidArray)) 
			return callback('openid 不可以为空！');
	if (_.isEmpty(lang)|| _.isNull(lang)) lang 	= 'zh_CN';
	if (_.isString(openidArray)) openidArray = [openidArray];

	var len 	= openidArray.length;
	var index 	= 0;
	var userList 	= [];

	
	
	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;

		openidArray.forEach(function(openid) {
			httpClient(ENDPOINTS_GET_USERINFO
					  .replace('{{{ACCESS_TOKEN}}}', currentToken)
					  .replace('{{{OPENID}}}', openid)
					  .replace('{{{zh_CN}}}', lang)
					, null, 'get', null, function(error, result) {

				if (error) return callback(error);

				if (result.errcode) {
					return callback(result);
				}

				index = index + 1;

				userList.push(result);

				if (len == index) return callback(null, userList);
			});
		});
		
	});
}

function unifiedOrder(params, callback) {
	// https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_4
	// https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
	// 
	var sign 			= '';
	var paramsArr 		= [];
	var paramsString 	= null;
	var paramsXML 		= null;

	var theParams 		= {
		appid 				: globalConfig.wchat_damiaa_appid,
		mch_id 				: globalConfig.merchant_id,
		nonce_str 			: uuid.v4().replace(/\D/g, '').substring(1,11),
		body 				: 'AA精米 2015特级新米',								//
		out_trade_no 		: '4234234234234326666',								//
		total_fee 			: 800,												//
		spbill_create_ip 	: '123.12.12.123',
		notify_url 			: 'http://wchat.damiaa.com/accept-notify-pay/',
		trade_type 			: 'JSAPI',
		userid 				: 'userid',											//
		openid 				: 'ofnVVw9aVxkxSfvvW373yuMYT7fs'					// 
	};

	theParams 	= _.extend(theParams, params);


	paramsArr.push('appid=' + theParams.appid);
	paramsArr.push('mch_id=' + theParams.mch_id);
	paramsArr.push('nonce_str=' + theParams.nonce_str);
	//paramsArr.push('sign=' + appid);
	paramsArr.push('body=' + theParams.body);
	paramsArr.push('out_trade_no=' + theParams.out_trade_no);
	paramsArr.push('total_fee=' + theParams.total_fee);
	paramsArr.push('spbill_create_ip=' + theParams.spbill_create_ip);
	paramsArr.push('notify_url=' + theParams.notify_url);
	paramsArr.push('trade_type=' + theParams.trade_type);
	paramsArr.push('attach=' + theParams.userid);					// 用户编号作为附加数据
	paramsArr.push('openid=' + theParams.openid);


	paramsString 	= _.sortBy(paramsArr, function(a){return a}).join('&') + "&key=" + globalConfig.pay_api_key;
	sign 			= crypto.createHash('md5').update(new Buffer(paramsString)).digest("hex").toUpperCase();	   
		
	paramsXML 	= '<xml>';

	for (var i = 0; i < paramsArr.length; i++) {
		paramsXML 	+= ('<' + paramsArr[i].substring(0, paramsArr[i].indexOf('=')) + '>' + paramsArr[i].substring(paramsArr[i].indexOf('=')+1) + '</' + paramsArr[i].substring(0, paramsArr[i].indexOf('=')) + '>');
	};

	paramsXML 	+= ('<sign>' + sign + '</sign></xml>');



	httpClient(ENDPOINTS_PAY_UNIFIEDORDER
				, {contentType:'xml', content:paramsXML}, 'post', null, function(error, result) {

		if (error) return callback(error);

		if (result.errcode) {
			return callback(result);
		}

		var jsonResult 	= JSON.parse(xml2json.toJson(result)).xml;

		if (jsonResult.result_code.toUpperCase() == 'SUCCESS' && jsonResult.return_code.toUpperCase() == 'SUCCESS') {
			// TODO
			// 应该验证签名是否正确
			// ..
			return callback(null, jsonResult);
		} else {
			return callback(jsonResult);
		}
		
		// <xml>
		// 	<return_code><![CDATA[SUCCESS]]></return_code>
		// 	<return_msg><![CDATA[OK]]></return_msg>
		// 	<appid><![CDATA[wxbfbeee15bbe621e6]]></appid>
		// 	<mch_id><![CDATA[1315577401]]></mch_id>
		// 	<nonce_str><![CDATA[60FDDHJ7FdL30m8e]]></nonce_str>
		// 	<sign><![CDATA[DC5247D557229E22B9D1D3CA0219A9BE]]></sign>
		// 	<result_code><![CDATA[SUCCESS]]></result_code>
		// 	<prepay_id><![CDATA[wx20160312184656286c8364a80903727171]]></prepay_id>
		// 	<trade_type><![CDATA[JSAPI]]></trade_type>
		// </xml>

	});
}

function sendMessage(toOpenid, msgtype, data, callback) {
	// http://mp.weixin.qq.com/wiki/11/c88c270ae8935291626538f9c64bd123.html

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var body = {
			"touser": toOpenid,
    		"msgtype": msgtype
		};

		body[msgtype] 	= data;

		var currentToken 	= result;

		httpClient(ENDPOINTS_SEND_MESSAGE
					  .replace('{{{ACCESS_TOKEN}}}', currentToken)
					, body, 'post', null, function(error, result) {

			if (error) return callback(error);

			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}



function orderMessageAlert(orderid, callback) {

	var content 	= '你有一个新订单, 订单号: ' + orderid;

	// 发送文本消息
	sendMessage('ofnVVw9aVxkxSfvvW373yuMYT7fs', 'text', {
			         "content": content
			    }, callback);
}

function getJSAPITicket(callback) {

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;

		httpClient(ENDPOINTS_GET_JSAPI_TICKET
					  .replace('{{{ACCESS_TOKEN}}}', currentToken)
					, body, 'get', null, function(error, result) {

			if (error) return callback(error);

			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}

// 生成永久二维码 (无过期时间)
function genQRCodeNonExpired(scene_id, callback) {	

	_FETCH_TOKEN(function (err, result) {
		if (err) {
			// TODO
			console.log('fetch token failed!');
			return;
		}

		var currentToken 	= result;

		httpClient(ENDPOINTS_GEN_QRCODE_NONEXPIRED
					.replace('{{{ACCESS_TOKEN}}}', currentToken)
					, {
						"action_name": "QR_LIMIT_SCENE", 
						"action_info": {
							"scene": {
								"scene_id": scene_id
							}
						}
					}
					, 'post', null, function(error, result) {

			if (error) return callback(error);

			if (result.errcode) {
				return callback(result);
			}

			return callback(null, result);
		});
	});
}


if (require.main == module) {
	
	// getAccessToken(function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });
	
	// getIPList(function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// getMenu(function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// genMenu(null, function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// delSpecMenu('407836341', function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	genSpecMenu(null, function(error, result) {
		if (error) return console.log(error);
		console.log(result);
	});

	// createGroup('developer', function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// joinGroup('ofnVVw9aVxkxSfvvW373yuMYT7fs', '100', function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// getAllGroups(function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// getGroupByUser('ofnVVw9aVxkxSfvvW373yuMYT7fs',function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// getUserList(null, function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// 'ofnVVw8L9-OAibNXOsofdhOQrSko',
 	// 'ofnVVw9aVxkxSfvvW373yuMYT7fs',
 	// 'ofnVVw5P3o2wAUxaGF-t08JDioYc'

	// getUserInfo('ofnVVw9aVxkxSfvvW373yuMYT7fs', null, function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

 	// unifiedOrder(null, function(err, result) {
 	// 	if (err) return console.log(err, 'unifiedOrder err');

 	// 	console.log(result, 'unifiedOrder successed.');
 	// });


	// 发送文本消息
	// sendMessage('ofnVVw9aVxkxSfvvW373yuMYT7fs', 'text', {
	// 		         "content":"Hello World<br />hhh"
	// 		    }, function(err, result) {
	//     if (err) return console.log(err);

	//     console.log(result);
 //    });


	// 发送图文消息
	// sendMessage('ofnVVw9aVxkxSfvvW373yuMYT7fs', 'news', {
 //        "articles": [
 //         {
 //             "title":"Happy Day",
 //             "description":"Is Really A Happy Day",
 //             "url":"http://mmbiz.qpic.cn/mmbiz/LkTJ6asKHQyNgzAFdubQeBkz2Yvx0HPNHvg6dPFpEBd8shVQMeP1BARvxIhI7tic906biafC4jxSDJjCMK8Ufk0A/0",
 //             "picurl":"http://mmbiz.qpic.cn/mmbiz/LkTJ6asKHQyNgzAFdubQeBkz2Yvx0HPNHvg6dPFpEBd8shVQMeP1BARvxIhI7tic906biafC4jxSDJjCMK8Ufk0A/0"
 //         },
 //         {
 //             "title":"Happy Day2",
 //             "description":"Is Really A Happy Day2",
 //             "url":"http://mmbiz.qpic.cn/mmbiz/LkTJ6asKHQyNgzAFdubQeBkz2Yvx0HPNHvg6dPFpEBd8shVQMeP1BARvxIhI7tic906biafC4jxSDJjCMK8Ufk0A/0",
 //             "picurl":"http://mmbiz.qpic.cn/mmbiz/LkTJ6asKHQyNgzAFdubQeBkz2Yvx0HPNHvg6dPFpEBd8shVQMeP1BARvxIhI7tic906biafC4jxSDJjCMK8Ufk0A/0"
 //         }
 //         ]
 //    }, function(err, result) {
	//     if (err) return console.log(err);

	//     console.log(result);
 //    });

	// orderMessageAlert('2345342343', function(err, callback) {
	// 	console.log(err || callback);
	// });

	// genQRCodeNonExpired(30, function(err, result) {
	// 	console.log(err || result);

	// 	// { 
	// 	//   ticket: 
	// 	// 	'gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==',
	// 	//   url: 'http://weixin.qq.com/q/ljgjBWHlxdK8tooGfRS6' 
	// 	// }


	// 	// https://mp.weixin.qq.com/cgi-bin/showqrcode?
	// 	// ticket=gQHk7zoAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xL2xqZ2pCV0hseGRLOHRvb0dmUlM2AAIE7UfyVgMEAAAAAA==

	// });

} else {
	module.exports 	= {
		getAccessToken: getAccessToken,
		getIPList: getIPList,
		joinGroup: joinGroup,
		getUserAccessToken: getUserAccessToken,
		unifiedOrder: unifiedOrder,
		sendMessage: sendMessage,
		orderMessageAlert: orderMessageAlert,
		getUserList: getUserList,
		getUserInfoList: getUserInfoList
	}
}





