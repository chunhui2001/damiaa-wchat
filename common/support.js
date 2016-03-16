var redis 			= require('redis');


var globalConfig 	= require('../config/global');
var _WCHAT_API 		= require('./wchatapi');


var _REDISCLIENT	= redis.createClient("redis://127.0.0.1:6379/2");

var R_KEY_ACCESS_TOKEN 	= globalConfig.R_KEY_ACCESS_TOKEN;
var isOpen 				= false;


function fetchAccessToken(callback) {

	if (['production', 'staging'].indexOf(globalConfig.ENVIRONMENT) == -1) {
		return callback(null, globalConfig.current_access_token);
	}


	if (!isOpen) {
		_REDISCLIENT.on('connect', function(err) {
			isOpen = true;
			if (err) return console.log('Try to connect to redis server failed, ' + err);

			return _REDISCLIENT.get(R_KEY_ACCESS_TOKEN, callback);
		});
	}


	return _REDISCLIENT.get(R_KEY_ACCESS_TOKEN, callback);
}




// if (require.main == module) {
// 	orderMessageAlert('2345342343', function(err, callback) {
// 		console.log(err || callback);
// 	});
// } else {
// 	module.exports = {
// 		fetchAccessToken: fetchAccessToken,
// 		orderMessageAlert: orderMessageAlert
// 	}
// }


module.exports = {
	fetchAccessToken: fetchAccessToken
}

