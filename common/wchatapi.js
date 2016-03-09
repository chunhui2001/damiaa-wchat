var _ 		= require('underscore');

var httpClient 		= require('./http-client').httpClient;
var endpoints 		= require('../config/endpoints');
var globalCOnfig 	= require('../config/global');

var accessToken		= globalCOnfig.current_access_token;
var MENU_KEYS		= globalCOnfig.menuKeys;

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

var ENDPOINTS_GET_USERLIST		= endpoints.wchat_get_userlist;
var ENDPOINTS_GET_USERINFO		= endpoints.wchat_get_userinfo;





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
}

function getIPList(callback) {
	// http://mp.weixin.qq.com/wiki/4/41ef0843d6e108cf6b5649480207561c.html

	httpClient(ENDPOINTS_IP_LIST.replace('{{{ACCESS_TOKEN}}}', accessToken), null, 'get', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result.ip_list);
	});
}

function getMenu(callback) {
	httpClient(ENDPOINTS_GET_MENU.replace('{{{ACCESS_TOKEN}}}', accessToken), null, 'get', null, function(error, result) {

		if (error) return callback(error);

		if (result.errcode) {
			return callback(result);
		}

		console.log(JSON.stringify(result.menu), 'menu');
		console.log(JSON.stringify(result.conditionalmenu), 'conditionalmenu');
		return callback(null, result);
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
				{
					"type": "pic_weixin", 
					"name": "上传头像", 
					"key": MENU_KEYS.KEY_UploadHeadPhoto, 
					"sub_button": [ ]
				}, 
				{
					"name":"菜单",
					"sub_button":[ 
						{	
						   "type":"view",
						   "name":"搜索",
						   "url":"http://www.soso.com/"
						}, {
						   "type":"view",
						   "name":"视频",
						   "url":"http://v.qq.com/"
						}, {
						   "type":"click",
						   "name":"赞一下我们",
						   "key": MENU_KEYS.KEY_GOOD
						}
					]
				}
			]
	};	

	if (meun) theMeun = meun;

	httpClient(ENDPOINTS_GEN_MENU.replace('{{{ACCESS_TOKEN}}}', accessToken), theMeun, 'post', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function delSpecMenu(menuid, callback) {	
	httpClient(ENDPOINTS_DEL_SPEC_MENU.replace('{{{ACCESS_TOKEN}}}', accessToken)
			, {"menuid":menuid}, 'post', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
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
				}, 
				{
					"type": "pic_weixin", 
					"name": "上传头像", 
					"key": MENU_KEYS.KEY_UploadHeadPhoto, 
					"sub_button": [ ]
				}, 
				{
					"name":"菜单",
					"sub_button":[ 
						{
						   "type":"view",
						   "name":"测试专用",
						   "url":"http://v.qq.com/"
						},
						{
						   "type":"view",
						   "name":"视频",
						   "url":"http://v.qq.com/"
						}, {
						   "type":"click",
						   "name":"BOSS专属",
						   "key": MENU_KEYS.KEY_BOSS
						}
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

	httpClient(ENDPOINTS_GEN_SPEC_MENU.replace('{{{ACCESS_TOKEN}}}', accessToken), theSpecMeun, 'post', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function createGroup(groupName, callback) {
	if (_.isEmpty(groupName)) return callback('groupName 不可以为空！');

	httpClient(ENDPOINTS_CREATE_GROUP.replace('{{{ACCESS_TOKEN}}}', accessToken)
					, {"group":{"name": groupName}}, 'post', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
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




	httpClient(ENDPOINTS_JOIN_GROUP.replace('{{{ACCESS_TOKEN}}}', accessToken)
					, {"openid":openid,"to_groupid":groupid}, 'post', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function getAllGroups(callback) {
	httpClient(ENDPOINTS_GET_ALL_GROUPS.replace('{{{ACCESS_TOKEN}}}', accessToken)
					, null, 'get', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function getGroupByUser(openid, callback) {
	httpClient(ENDPOINTS_GET_GROUPID_BYUSER.replace('{{{ACCESS_TOKEN}}}', accessToken)
					, {"openid": openid}, 'post', null, function(error, result) {

		if (error) return callback(error);

		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function getUserList(nextOpenId, callback) {	
	var endpoints 	= ENDPOINTS_GET_USERLIST.replace('{{{ACCESS_TOKEN}}}', accessToken);

	if (!_.isEmpty(nextOpenId)) {
		endpoints 	= endpoints.replace('{{{NEXT_OPENID}}}', nextOpenId);
	} else {
		endpoints 	= endpoints.replace('&next_openid={{{NEXT_OPENID}}}', '');
	}

	httpClient(endpoints, null, 'get', null, function(error, result) {
		if (error) return callback(error);

		// {"errcode":40013,"errmsg":"invalid appid"}
		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function getUserInfo(openid, lang, callback) {
	if (_.isEmpty(openid)) return callback('openid 不可以为空！');
	if (_.isEmpty(lang)) lang 	= 'zh_CN';

	httpClient(ENDPOINTS_GET_USERINFO
				  .replace('{{{ACCESS_TOKEN}}}', accessToken)
				  .replace('{{{OPENID}}}', openid)
				  .replace('{{{zh_CN}}}', lang)
				, null, 'get', null, function(error, result) {

		if (error) return callback(error);

		if (result.errcode) {
			return callback(result);
		}

		return callback(null, result);
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

	getMenu(function(error, result) {
		if (error) return console.log(error);
		console.log(result);
	});

	// genMenu(null, function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// delSpecMenu('407765872', function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

	// genSpecMenu(null, function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });

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

	// getUserInfo('ofnVVw8L9-OAibNXOsofdhOQrSko', null, function(error, result) {
	// 	if (error) return console.log(error);
	// 	console.log(result);
	// });
} else {
	module.exports 	= {
		getAccessToken: getAccessToken,
		getIPList: getIPList,
		joinGroup: joinGroup
	}
}





