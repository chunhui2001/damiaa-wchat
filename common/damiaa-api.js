var _HTTP_CLIENT 				= require('./http-client').httpClient;
var _DAMIAA_API_ENDPOINTS 		= require('../config/endpoints-damiaapi-basic');


var _CUSTOMER_TOKEN 			= 'BudbXmq1bgnyJWXL';
var _ENDPOINTS_UPLOAD_IMAGE 	= _DAMIAA_API_ENDPOINTS.upload_image;
var _ENDPOINTS_GET_OPENID 		= _DAMIAA_API_ENDPOINTS.get_openid;
var _ENDPOINTS_VALIDATE_ORDER	= _DAMIAA_API_ENDPOINTS.validate_order;





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

function getOpenId (token, tokenType, callback) {
	_HTTP_CLIENT(_ENDPOINTS_GET_OPENID, null, 'get',  {type: tokenType, token: token}, function(error, result) {
		if (error) return callback(error);

		if (result.error) {

			return callback(result);
		}

		return callback(null, result);
	});
}

function validateOrder (openid, prepayid, token, tokenType, callback) {
	_HTTP_CLIENT(
		_ENDPOINTS_VALIDATE_ORDER.replace('{{{openid}}}', openid)
			.replace('{{{prepayid}}}', prepayid)
		, null, 'get',  {type: tokenType, token: token}, function(error, result) {
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
		uploadImage: uploadImage,
		getOpenId: getOpenId,
		validateOrder: validateOrder
	}
}