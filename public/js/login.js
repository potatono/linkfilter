	function checkRegex(regex, ele, yr, nr) {
		if (regex.test($(ele).val())) {
			if (yr) {
				$(ele).popover({ 'trigger':'manual', 'content':yr, 'selector':true }).popover('show');
				return false;
			}
			else {
				$(ele).popover('destroy');
				return true;
			}
		}
		else {
			if (nr) {
				$(ele).popover({ 'trigger':'manual', 'content':nr, 'selector':true }).popover('show');
				return false;
			}
			else {
				$(ele).popover('destroy');
				return true;
			}
		}
	}

	function checkUnique(key, ele, yr, nr,cb) {
		$.getJSON(
			"/login/check-" + key + "/" + escape($(ele).val()), 

			function(data) {
				if (data.unique) {
					if (yr) {
						$(ele).popover({ 'trigger':'manual', 'content':yr, 'selector':true }).popover('show');
						if (cb) cb(false);
					}
					else {
						$(ele).popover('destroy');
						if (cb) cb(true);
					}
				}
				else {
					if (nr) {
						$(ele).popover({ 'trigger':'manual', 'content':nr, 'selector':true }).popover('show');
						if (cb) cb(false);
					}
					else {
						$(ele).popover('destroy');
						if (cb) cb(true);
					}
				}
			}
		);
	}

	function checkPassword(ele) {
		if ($('#password').val() != $(ele).val()) {
			$(ele).popover({'trigger':'manual', 'content':'Passwords do not match', 'selector':true }).popover('show');
			return false;
		}
		else {
			$(ele).popover('destroy');
			return true;
		}
	}

	function signUp() {
		if ($('#signup-btn').hasClass('btn-primary')) {
			saveUser();
		}
		else {
			$('#signup-email').collapse('show');
			$('#signup-password').collapse('show');
			$('#email').removeAttr('disabled');
			$('#repeat').removeAttr('disabled');
			$('#form').attr('action','/login/signup');
			$('#signup-btn').addClass('btn-primary');
			$('#signin-btn').removeClass('btn-primary');
			$('#username').attr('onblur',"checkUsername(this)");
			checkUnique('username', $('#username').get(0), null, 'Username is not unique');
			checkUnique('email', $('#email').get(0), null, 'Email is not unique');
			$('#username').focus();
		}
	}

	function signIn() {
		if ($('#signin-btn').hasClass('btn-primary')) {
			$('#form').submit();
		}
		else {
			$('#signup-email').collapse('hide');
			$('#signup-password').collapse('hide');
			$('#email').attr('disabled','disabled');
			$('#repeat').attr('disabled','disabled');
			$('#form').attr('action','/login/signin');
			$('#signup-btn').removeClass('btn-primary');
			$('#signin-btn').addClass('btn-primary');
			$('#username').attr('onblur',"checkUnique('username', this, 'No such user', null)");
			//checkUnique('username', $('#username').get(0), 'No such user', null);
			$('#username').popover('destroy');
			$('#email').popover('destroy');
			$('#username').focus();
		}
	}

	function checkUsername(ele,cb) {
		return checkRegex(/\W/,ele,'The username contains invalid characters',null) &&
			checkRegex(/^\w{0,2}$/,ele,'Username is too short',null) &&
			checkRegex(/^\w{21}/,ele,'Username is too long',null) &&
			checkUnique('username',ele,null,'That username is taken',cb);
	}

	function checkEmail(ele,cb) {
		return checkRegex(/^[\w\-\.\+]+@[\w\-\.]+$/,ele,null,'Email is invalid') &&
			checkRegex(/@twitter\.com$/,ele,'That\'s not really an email address') &&
			checkUnique('email',ele,null,'That email is already on file',cb);
	}

	function saveUser() {
		checkUsername($('#username'), function(ok) {
			if (ok) checkEmail($('#email'), function(ok) {
				if ($('#password').length == 0 || checkPassword($('#repeat')))
					$('#form').submit();
			});
		});
	}

	window.setTimeout(function() { $('#username').focus(); }, 100);
