var _ 		= require('underscore');

var _HTTP_CLIENT 				= require('./http-client').httpClient;
var _DAMIAA_API_ENDPOINTS 		= require('../config/endpoints-damiaapi-basic');


var _CUSTOMER_TOKEN 			= 'BudbXmq1bgnyJWXL';
var _ENDPOINTS_UPLOAD_IMAGE 	= _DAMIAA_API_ENDPOINTS.upload_image;
var _ENDPOINTS_GET_OPENID 		= _DAMIAA_API_ENDPOINTS.get_openid;
var _ENDPOINTS_VALIDATE_ORDER		= _DAMIAA_API_ENDPOINTS.validate_order;
var _ENDPOINTS_PAYMENT_COMPLEMENT	= _DAMIAA_API_ENDPOINTS.payment_complement;
var _ENDPOINTS_GET_ORDERS			= _DAMIAA_API_ENDPOINTS.get_orders;
var _ENDPOINTS_PUSH_EVENTS			= _DAMIAA_API_ENDPOINTS.push_events;
var _ENDPOINTS_ME					= _DAMIAA_API_ENDPOINTS.me;
var _ENDPOINTS_PARTNERS				= _DAMIAA_API_ENDPOINTS.partners;


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


if (require.main == module) {

} else {
	module.exports = {
		uploadImage: uploadImage,
		getOpenId: getOpenId,
		validateOrder: validateOrder,
		paymentComplement: paymentComplement,
		getOrderList: getOrderList,
		pushEvents: pushEvents,
		me: me,
		partnerList:partnerList
	}
}