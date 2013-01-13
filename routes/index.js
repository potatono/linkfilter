
/*
 * GET home page.
 */

exports.index = function(req, res){
	var user = req.isAuthenticated() ? req.getAuthDetails().user : null;
	
	res.render('index', { title:'Home', user:JSON.stringify(user), sid:req.sessionID });
};
