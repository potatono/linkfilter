function loginWith(method, req, res, next) {
	req.authenticate([method], function(error, authenticated) {
		if (error) { 
			console.log(error);
			res.end();
		}
		else {
			if (authenticated === undefined) {
				// Browser interaction required, do nothing.
			}
			else {
				next();
			}
		}
	});
}

exports.facebook = function(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect("/");
	}
	else {
		loginWith("facebook", req, res, next);
	}
};


exports.twitter = function(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect("/");
	}
	else {
		loginWith("twitter", req, res, next);
	}
};

exports.index = function(req, res){
	res.render('login', { title: 'Login' });
};

