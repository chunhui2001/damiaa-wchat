var httpClient 	= require('./http-client').httpClient;
var endpoints 	= require('../config/endpoints');

var accessToken	= require('../config/global').current_access_token;

var ENDPOINTS_GET_ACCESS 	= endpoints.wchat_get_access_token;
var ENDPOINTS_IP_LIST 		= endpoints.wchat_ip_list;
var ENDPOINTS_GEN_MENU 		= endpoints.wchat_gen_menu;





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

function genMenu(meun, callback) {
	// http://mp.weixin.qq.com/wiki/10/0234e39a2025342c17a7d23595c6b40a.html

	var theMeun 	= {
			"button":[
				{	
					"type":"view",
					"name":"AA精米",
					"url":"http://damiaa.com:8100/"
				}, 
				{
					"type": "pic_weixin", 
					"name": "上传头像", 
					"key": "upload_head_photo", 
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
						   "key":"V1001_GOOD"
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
			console.log(11);
			return callback(result);
		}

		return callback(null, result);
	});
}



if (require.main == module) {
	/*
	getAccessToken(function(error, result) {
		if (error) return console.log(error);

		console.log(result);
	});*/

	/*
	getIPList(function(error, result) {
		if (error) return console.log(error);

		console.log(result);
	});*/

	genMenu(null, function(error, result) {
		if (error) return console.log(error);

		console.log(result);
	});
} else {
	module.exports 	= {
		getAccessToken: getAccessToken,
		getIPList: getIPList,
	}
}





