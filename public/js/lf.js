var LF = (function() {
	var self = {};
	var user = { username: 'anon' + Math.floor(Math.random()*100000) };
	var socket = io.connect('http://linkfilter.net:8080');
	var lastId = 0;

	function inputReceived() {
		var msg = $(this).val();
		$(this).val('');
		socket.emit('message', msg);
	};

	function receiveMessage(message) {
		if (message.id > lastId) {
			lastId = message.id;
			$('#feed').append('<div class="message"><span class="user">' + message.username + 
				'</span><span class="body">' + 
				$('<div />').text(message.body).html() + 
				'</span>'
			);
			$('#feed').animate({ scrollTop: $('#feed').prop("scrollHeight") }, 500);
		}
	};

	function resizeFeed() {
		$('#feed').height($('#main').height()-55);
	};

	socket.on('message', receiveMessage);
	socket.on('messages', function(messages) {
		messages.forEach(receiveMessage);
	});

	self.setUser = function(u,s) {
		if (u) {
			user = u;
			$('#login').text(u.username)
				.addClass('btn-success')
				.addClass('dropdown-toggle')
				.append('&nbsp;<span class="caret" />')
				.attr('data-target','')
				.dropdown();

			if (u.requires_update) {
				$('#modal h3').text('Welcome!  Please update your profile.');
				$('#modal').modal({ remote:'/login/edit', show:true });
			}

			console.log("Sending session " + s);
			socket.emit('session', s);
		}
	};

	$('#input').change(inputReceived);
	$(window).resize(resizeFeed);

	resizeFeed();

	return self;
}());

