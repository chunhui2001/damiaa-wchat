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
	PORT: '8108',
	DAMIAA_API_HOSTNAME: 'api-staging.damiaa.com',
	STATIC_SERVER_HOSTNAME: 'static-local.damiaa.com',


	client_sign_token: 'damiaa0029damiaa0029damiaa0029da',
	client_encodingAESKey: '368efzUP97lf34owkeVyUqpEceZfkPsCLyFX2Hd17ej',
	wchat_damiaa_appid: 'wxbfbeee15bbe621e6',	
	wchat_damiaa_secret: 'bce17ac69d41807ccfcdeb639a39e008',
	current_access_token: 'atLFHGvdfKWUT0T7vOuKKLm_Tlcj8oruABPEAj2Fc-EDRXCWb4zz2cU3GoTUzeD83lfLh6-43jk_qJ7MeASV-I5OigVh0W2JxyfAegXlyK5ne4_HJGB_A02OsIy6cdwCYUYeAGARNR',


	menuKeys: {
		KEY_UploadHeadPhoto: 'K_upload_head_photo', 			// 上传头像
		KEY_GOOD: 'K_V1001_GOOD', 										// 赞一下我们
		KEY_BOSS: 'K_BOSS'
	}
}



module.exports = _.extend(globalConfig, externalConfig);