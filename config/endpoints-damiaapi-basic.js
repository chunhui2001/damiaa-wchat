var globalConfig 	= require('./global.js');

module.exports = {
	upload_image: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/upload/',
	get_openid: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/openid/',
	validate_order: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/order/{{{openid}}}/{{{prepayid}}}/',
	payment_complement: 'http://' + globalConfig.DAMIAA_API_HOSTNAME + '/payment-completed/',
}