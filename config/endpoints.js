var globalConfig 	= require('./global.js');

module.exports = {
	// 获取 access_token
	wchat_get_access_token: 
		'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
		 + globalConfig.wchat_damiaa_appid
		 + '&secret=' + globalConfig.wchat_damiaa_secret,

	// 获取微信服务器ip地址列表
	wchat_ip_list: 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token={{{ACCESS_TOKEN}}}',

	// 创建自定义菜单
	wchat_gen_menu: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token={{{ACCESS_TOKEN}}}',
}