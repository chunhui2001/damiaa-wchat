var _ 				= require('underscore');

var devConfig 		= require('./config-dev');
var localConfig 	= require('./config-local');
var prodConfig 		= require('./config-prod');
var stagingConfig 	= require('./config-staging');


var externalConfig 	= null;

switch(process.env.NODE_ENV) {
	case "development":
		externalConfig = devConfig;
		break;
	case "local":
		externalConfig = localConfig;
		break;
	case "production":
		externalConfig = prodConfig;
		break;
	case "staging":
		externalConfig = stagingConfig;
		break;
	default:
		externalConfig = devConfig;
}



var globalConfig 	= {	
	ENVIRONMENT: 'local',
	PORT: '8009',
	DAMIAA_API_HOSTNAME: 'api-staging.damiaa.com',
	//STATIC_SERVER_HOSTNAME: 'static-local.damiaa.com',

	client_sign_token: 'damiaa0029damiaa0029damiaa0029da',
	client_encodingAESKey: '368efzUP97lf34owkeVyUqpEceZfkPsCLyFX2Hd17ej',

	wchat_damiaa_appid: 'wxbfbeee15bbe621e6',	
	wchat_damiaa_secret: 'bce17ac69d41807ccfcdeb639a39e008',

	pay_api_key: 'damiaa0029damiaa0029damiaa0029da',

	merchant_id: '1315577401',
	
	current_access_token: 'LGRd7JBmEePy5bfPHiNlB5_ZNen1vjJDLLJ6OHwPw--I1JWcJuiB0TBl5vhviQ7AC1dT2uaRWIpOjGH81cfE_94hEmfVRCP3iKIe58-zAqKj4FVWX3pWYlNUG6iJ8rysOMAfAJACAO',

	menuKeys: {
		KEY_SetupOrder_AUTO: 'K_setup_order_auto', 					// 上传头像
		KEY_UploadHeadPhoto: 'K_upload_head_photo', 					// 上传头像
		KEY_GOOD: 'K_V1001_GOOD', 										// 赞一下我们
		KEY_BOSS: 'K_BOSS',
		MY_QRCODE: 'K_MY_QRCODE'
	},
	R_KEY_ACCESS_TOKEN: 'WX_ACCESS_TOKEN_EceZfK'
}



module.exports = _.extend(globalConfig, externalConfig);

