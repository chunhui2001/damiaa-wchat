var CronJob 		= require('cron').CronJob;
var moment 			= require('moment');

var globalConfig 	= require('../config/global');
var _REFRESH_TOKEN 	= require('./wchatapi').getAccessToken;

var R_KEY_ACCESS_TOKEN 	= globalConfig.R_KEY_ACCESS_TOKEN;




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

function worker(redisClient) {
	if (['production', 'staging'].indexOf(globalConfig.ENVIRONMENT) == -1) {
		console.log(moment().format("YYYY/MM/DD HH:mm:ss"));
	    console.log('The current access token is: ' + globalConfig.current_access_token);
		return;
	}

	// get a new accesstoken
	_REFRESH_TOKEN(function (err, result) {
		if (err) {
			// TODO 
			// should be send a email to administrator
			console.log(err, "_REFRESH_TOKEN ERROR.");
			return;
		}

		redisClient.set(R_KEY_ACCESS_TOKEN, result.access_token, function (err, reply) {
    	
	    	console.log('A new access token store to redis: ' + result.access_token);
	    	//redisClient.expire(R_KEY_ACCESS_TOKEN, 720);
	    });
	});
	
}


function refreshToken(redisClient) {	

    console.log('connect to redis successful');
	console.log('');
 	console.log('A Refresh Token job is working at ' + moment().format("YYYY/MM/DD HH:mm:ss"));
	console.log('==============================================================================');

 	worker(redisClient);

	
	var job = new CronJob('0 */1 * * *', function() {
	  
		console.log('');
 		console.log('A Refresh Token job is working at ' + moment().format("YYYY/MM/DD HH:mm:ss"));
		console.log('==============================================================================');
 		worker(redisClient);

	}, function () {
	    /* This function is executed when the job stops */

	},
	true, 				/* Start the job right now */
	'Asia/Shanghai' 		/* Time zone of this job. */
	);

	job.start();
}


module.exports = {
	refreshToken: refreshToken
}
