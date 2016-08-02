var _ 		= require('underscore');

var _HTTP_CLIENT 				= require('./http-client').httpClient;
var _DAMIAA_API_ENDPOINTS 		= require('../config/endpoints-damiaapi-basic');


var _CUSTOMER_TOKEN 			= 'BudbXmq1bgnyJWXL';
var _ENDPOINTS_UPLOAD_IMAGE 	= _DAMIAA_API_ENDPOINTS.upload_image;
var _ENDPOINTS_GET_OPENID 		= _DAMIAA_API_ENDPOINTS.get_openid;
var _ENDPOINTS_VALIDATE_ORDER		= _DAMIAA_API_ENDPOINTS.validate_order;
var _ENDPOINTS_PAYMENT_COMPLEMENT	= _DAMIAA_API_ENDPOINTS.payment_complement;
var _ENDPOINTS_GET_ORDERS			= _DAMIAA_API_ENDPOINTS.get_orders;
var _ENDPOINTS_CREATE_ORDER			= _DAMIAA_API_ENDPOINTS.create_order;
var _ENDPOINTS_PUSH_EVENTS			= _DAMIAA_API_ENDPOINTS.push_events;
var _ENDPOINTS_ME					= _DAMIAA_API_ENDPOINTS.me;
var _ENDPOINTS_PARTNERS				= _DAMIAA_API_ENDPOINTS.partners;
var _ENDPOINTS_GET_QRCODE			= _DAMIAA_API_ENDPOINTS.get_qrcode;
var _ENDPOINTS_USER_REGISTER		= _DAMIAA_API_ENDPOINTS.user_register;



function user_register(username, password, openid, unionid, photo, callback) {
	_HTTP_CLIENT(_ENDPOINTS_USER_REGISTER, {
		name: username, passwd: password, openId:openid, unionId:unionid, photo:photo
	}, 'post', null, function(error, result) {

		return callback(false);

		if (error) {
    		// sendResult.error 	= true;
    		// sendResult.data 	= error;
    		// sendResult.message 	= error.message;
    		return callback(error);
    	}

    	if (result) {
	    	sendResult.data 	= result.data;
	    	sendResult.message 	= result.message;
	    	sendResult.error 	= result.error;
    	}

		return callback(error, sendResult);

	});

}


function paymentComplement(userid, openid, orderid, paymentInfo, callback) {
	_HTTP_CLIENT(_ENDPOINTS_PAYMENT_COMPLEMENT, {
		userid: userid, openid: openid, orderid: orderid, paymentInfo: paymentInfo
	}, 'post', null, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}

		return callback(null, result);
	});
}


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

function getOrderList (callback) {
	_HTTP_CLIENT(
		_ENDPOINTS_GET_ORDERS
		, {token: 'BudbXmq1bgnyJWXL'}, 'post', null, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}

		return callback(null, result.data);
	});
}

function pushEvents(deliveryStatus, orderid, userid, openid, events, callback) {
	var params  = {
		token: 'BudbXmq1bgnyJWXL', 
		orderid: orderid,
		userid: userid,
		openid: openid
	};

	params = _.extend(params, events);

	_HTTP_CLIENT(
		_ENDPOINTS_PUSH_EVENTS.replace('{{{deliveryStatus}}}', deliveryStatus)
		, params, 'post', null, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}
		
		return callback(null, result.data);
	});
}

function me(token, tokenType, callback) {
	_HTTP_CLIENT(
		_ENDPOINTS_ME
		, null, 'get',  {type: tokenType, token: token}, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function partnerList(token, tokenType, callback) {
	_HTTP_CLIENT(
		_ENDPOINTS_PARTNERS
		, null, 'get',  {type: tokenType, token: token}, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}

		return callback(null, result);
	});
}

function getQrcode(openid, callback) {
	_HTTP_CLIENT(
		_ENDPOINTS_GET_QRCODE.replace('{{{openid}}}', openid)
		, null, 'get',  null, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}

		return callback(null, result.data);
	});
}

function createOrder(params, callback) {
	var orderData 	= {
	    "paymethod": 1,
	    "941174731905": 3,
	    "auto_create": true, 
	    "openid": "ofnVVw9aVxkxSfvvW373yuMYT7fs", 
	    "ticket": ""
	}

	orderData = _.extend(orderData, params);
	
	_HTTP_CLIENT(
		_ENDPOINTS_CREATE_ORDER
		, orderData, 'post', null, function(error, result) {
		if (error) return callback(error);

		if (result.error) {
			return callback(result);
		}
		
		return callback(null, result.data);
	});
}


if (require.main == module) {
	getQrcode('ofnVVw9aVxkxSfvvW373yuMYT7fs', function(err, result) {
		console.log(err || result);
	});
} else {
	module.exports = {
		uploadImage: uploadImage,
		getOpenId: getOpenId,
		validateOrder: validateOrder,
		paymentComplement: paymentComplement,
		getOrderList: getOrderList,
		pushEvents: pushEvents,
		me: me,
		partnerList: partnerList,
		getQrcode: getQrcode,
		createOrder: createOrder,
		user_register: user_register
	}
}