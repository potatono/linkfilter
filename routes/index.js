
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log(req.isAuthenticated());
	console.log(req.getAuthDetails());
	console.log(req.session);
	res.render('index', { title: 'Home' });
};
