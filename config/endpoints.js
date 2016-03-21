var globalConfig 	= require('./global.js');

module.exports = {
	// 获取用户 access_token
	wchat_get_user_access_token: 
	'https://api.weixin.qq.com/sns/oauth2/access_token?appid='
		+globalConfig.wchat_damiaa_appid+'&secret='
		+globalConfig.wchat_damiaa_secret+'&code={{{CODE}}}&grant_type={{{GRANT_TYPE}}}',

	// 获取 access_token
	wchat_get_access_token: 
		'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
		 + globalConfig.wchat_damiaa_appid
		 + '&secret=' + globalConfig.wchat_damiaa_secret,

	// 获取微信服务器ip地址列表
	wchat_ip_list: 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token={{{ACCESS_TOKEN}}}',

	// 创建自定义菜单
	wchat_gen_menu: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token={{{ACCESS_TOKEN}}}',

	// 获取自定义菜单列表
	wchat_get_menu: 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token={{{ACCESS_TOKEN}}}',

	// 创建个性化菜单
	wchat_gen_spec_menu: 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token={{{ACCESS_TOKEN}}}',

	// 创建个性化菜单
	wchat_del_spec_menu: 'https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token={{{ACCESS_TOKEN}}}',

	// 创建分组
	wchat_create_group: 'https://api.weixin.qq.com/cgi-bin/groups/create?access_token={{{ACCESS_TOKEN}}}',

	// 加入分组
	wchat_join_group: 'https://api.weixin.qq.com/cgi-bin/groups/members/update?access_token={{{ACCESS_TOKEN}}}',

	// 查询所有分组
	wchat_get_all_groups: 'https://api.weixin.qq.com/cgi-bin/groups/get?access_token={{{ACCESS_TOKEN}}}',

	// 取得关注者列表
	wchat_get_userlist: 'https://api.weixin.qq.com/cgi-bin/user/get?access_token={{{ACCESS_TOKEN}}}&next_openid={{{NEXT_OPENID}}}',

	// 获取用户基本信息
	wchat_get_userinfo: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token={{{ACCESS_TOKEN}}}&openid={{{OPENID}}}&lang={{{zh_CN}}}',

	// 查询用户所在分组
	wchat_get_groupid_by_user: 'https://api.weixin.qq.com/cgi-bin/groups/getid?access_token={{{ACCESS_TOKEN}}}',

	// 统一下单API
	wchat_pay_unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',

	// 发送消息
	wchat_send_message: 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={{{ACCESS_TOKEN}}}',
	wchat_get_jsapi_ticket: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={{{ACCESS_TOKEN}}}&type=jsapi'
}