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

	// 获取自定义菜单列表
	wchat_get_menu: 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token={{{ACCESS_TOKEN}}}',

	// 创建个性化菜单
	wchat_gen_spec_menu: 'https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token={{{ACCESS_TOKEN}}}',

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
}