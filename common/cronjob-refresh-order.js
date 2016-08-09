var CronJob 		= require('cron').CronJob;
var moment 			= require('moment');

var globalConfig 	= require('../config/global');
var _DAMIAA_API 	= require('./damiaa-api');
var _HTTP_CLIENT 	= require('./http-client').httpClient;


/*
* '00 30 11 * * 1-7'
* Runs every weekday (Monday through Friday)
* at 11:30:00 AM. It does not run on Saturday
* or Sunday.
*/

/*
* '* * * * *'
* Runs every minutes
*/

/*
* '30 * * * * *'
*  This runs at the 30th mintue of every hour. 
*/

// '0 */2 * * *'
/* 
*  Running Cron every 2 hours
*/
function worker() {
	// if (['production', 'staging'].indexOf(globalConfig.ENVIRONMENT) == -1) {
	// 	console.log(moment().format("YYYY/MM/DD HH:mm:ss"));
	//     console.log('The current access token is: ' + globalConfig.current_access_token);
	// 	return;
	// }

	// 0:物流单号暂无结果；
	// 3:在途，快递处于运输过程中；
	// 4:揽件，快递已被快递公司揽收并产生了第一条信息；
	// 5:疑难，快递邮寄过程中出现问题；
	// 6:签收，收件人已签收；
	// 7:退签，快递因用户拒签、超区等原因退回，而且发件人已经签收；
	// 8:派件，快递员正在同城派件；
	// 9:退回，货物处于退回发件人途中；

	// 4, 3, 8, 6
	
	// 取得所有已发货订单, 
	// 根据发货单号调用快递查询接口
	// 当快递接口返回的状态是签收(6)时，　更新订单的状态为已签收
	// 当快递接口返回的状态是签收(9)时，　发送邮件给客服人员
	// 当快递接口返回的状态是签收(3或4)时，　更新订单的状态为onDelivery

	_DAMIAA_API.getOrderList(function(err, result) {
		if (err) {
			console.log(err, '取得订单列表时报错');
			return;
		}

		if (!result || result.length == 0) {
			console.log('当前时间没有新的订单列表！' + moment().format("YYYY-MM-DD HH:mm:ss"));
			return;
		}

		result.forEach(function(order) {
			var orderid 		= order.id;
			var userid 			= order.userId;
			var openid 			= order.openId;
			var lastEventTime 	= order.lastEventTime ? moment(order.lastEventTime) : false;

			var deliveryNo 	= order.deliveryNo;
			var companyName	= order.deliveryCompany;

			getDeliveryInfo(deliveryNo, companyName, function(err, result) {
				if (err) {
					console.log('调用快递接口时报错!');
				}

				if (result && !result.success) {
					console.log('未能成功取得快递信息!');
				}

				if (result && result.success) {
					var deliveryInfo 	= result.data;
					var deliveryStatus 	= result.status;
					var deliveryNu 		= result.nu;

					// 当快递接口返回的状态是签收(6)时，　更新订单的状态为已签收
					// 当快递接口返回的状态是签收(9)时，　发送邮件给客服人员
					// 当快递接口返回的状态是签收(3或4)时，　更新订单的状态为onDelivery

					var eventObj 		= {};


					// 取得 lastEventTime 之后的所有 context
					deliveryInfo.forEach(function(info) {
						var infoTime 	= moment(info.time, "YYYY-MM-DD HH:mm:ss");
						var context 	= info.context;

						if (!lastEventTime || infoTime.isAfter(lastEventTime)) {
							eventObj[infoTime.format("YYYY-MM-DD HH:mm:ss")] = context;
						}
					});

					console.log(deliveryInfo ? deliveryInfo.length : null, deliveryNo + ': deliveryInfo && deliveryInfo.length');

                    if (Object.keys(eventObj).length == 0 && deliveryInfo && deliveryInfo.length == 0) {
                            console.log('发货单号可能有误! (' + orderid + ', ' + deliveryNo + ')');
                            return;
                    }
					
					if (Object.keys(eventObj).length > 0) {
						_DAMIAA_API.pushEvents(deliveryStatus, orderid, userid, openid, eventObj
							, function(err, result) {
								console.log(err || result);
						});
					} else {
						console.log('暂无新订单事件! (' + orderid + ', ' + deliveryNo + ')');
                        return;
					}
				}
			});
		});
	});
}


function getDeliveryInfo(deliveryNo, companyName, callback) {
	var apiurl 	= null;
	var result 	= null;

	switch (companyName) {
		case "EMS":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-ems.html';
			break;
		case "YOUZHENG":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-youzhengguonei.html';
			break;
		case "SHENTONG":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-shentong.html';
			break;
		case "YUNDA":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-yunda.html';
			break;
		case "YUANTONG":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-yuantong.html';
			break;
		case "SHUNFENG":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-shunfeng.html';
			break;
		case "ZHONGTONG":
			apiurl 	= 'http://www.kuaidi.com/index-ajaxselectcourierinfo-'+deliveryNo+'-zhongtong.html';
			break;
		default:

	}

	if (apiurl == null) {
		console.log('未能匹配到快递公司名字!');
		return callback(null, result);
	} else {
		_HTTP_CLIENT(apiurl, null, 'get', null, callback);
	}
	
}


function refreshOrder() {	

	console.log('');
 	console.log('A Refresh Order job is working at ' + moment().format("YYYY/MM/DD HH:mm:ss"));
	console.log('==============================================================================');

 	worker();

	
	var job = new CronJob('0 */1 * * *', function() {
	  
		console.log('');
 		console.log('A Refresh Order job is working at ' + moment().format("YYYY/MM/DD HH:mm:ss"));
		console.log('==============================================================================');
 		worker();

	}, function () {
	    /* This function is executed when the job stops */

	},
	true, 				/* Start the job right now */
	'Asia/Shanghai' 		
	);

	job.start();
}

if (require.main == module) {
	// 9974408638450
	refreshOrder();
} else {

	module.exports = {
		refreshOrder: refreshOrder
	}
}
