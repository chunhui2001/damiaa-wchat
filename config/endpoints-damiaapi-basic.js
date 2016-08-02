var globalConfig 	= require('./global.js');

module.exports = {
	upload_image: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/upload/',
	get_openid: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/openid/',
	validate_order: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/order/{{{openid}}}/{{{prepayid}}}/',
	payment_complement: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/payment-completed/',
	get_orders: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/orderlist/SENDED/',
	create_order: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/create-order-auto/',
	push_events: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/push-events/{{{deliveryStatus}}}',
	me: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/me',
	partners: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/partners/',
	get_qrcode: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/get-qrcode/{{{openid}}}',
	user_register: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/register',
}