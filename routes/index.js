
/*
 * GET home page.
 */

exports.index = function(req, res){
	var user = req.isAuthenticated() ? req.getAuthDetails().user : null;
	
	console.log("User");
	console.log(user);
	console.log("/User");

	res.render('index', { title:'Home', user:JSON.stringify(user) });
};
