var _HTTP_CLIENT 				= require('./http-client').httpClient;
var _DAMIAA_API_ENDPOINTS 		= require('../config/endpoints-damiaapi-basic');


var _CUSTOMER_TOKEN 			= 'BudbXmq1bgnyJWXL';
var _ENDPOINTS_UPLOAD_IMAGE 	= _DAMIAA_API_ENDPOINTS.upload_image;





function uploadImage (openid, imguri, callback) {

	_HTTP_CLIENT(_ENDPOINTS_UPLOAD_IMAGE, {
		uri: imguri, uploadType: 'headimg', unionid: null, openid: openid, customerToken: _CUSTOMER_TOKEN
	}, 'post', null, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}

		return callback(null, result);
	});
}


if (require.main == module) {

} else {
	module.exports = {
		uploadImage: uploadImage
	}
}