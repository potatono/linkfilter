var LF = (function() {
	var self = {};
	var user = { username: 'anon' + Math.floor(Math.random()*100000) };
	var socket = io.connect(':8080');
	var lastId = 0;

	function modal(url, title) {
		$('#modal h3').text(title);
		$('#modal').modal({
			remote:url
		}).modal('show');
	};

	function inputReceived() {
		var msg = $(this).val();

		if (/^\s*http(?:s)?:\/\//.test(msg)) {
			showLinkForm(msg);
			socket.emit('link', msg);
		}
		else {
			$(this).val('');
			socket.emit('message', msg);
		}
	};

	function receiveMessage(message) {
		if (message.id < 0 || message.id > lastId) {
			lastId = message.id;
			$('#feed').append('<div class="message"><span class="user">' + message.username + 
				'</span><span class="body">' + 
				$('<div />').text(message.body).html() + 
				'</span>'
			);
		}
	};

	function postLink() {
		receiveMessage({ id: -1, username: "linkfilter", body: "Doesn't work yet, sorry." });

		$('#controls').height(50).html($('<input id="input">')).change(inputReceived).focus();
		resizeFeed(50);
		scroll();
	}

	function showLinkForm(url) {
		$('#controls').height(200).html(
				'<div class="busy" />' + 
				'<div class="thumbnail hide" />'+
				'<input id="url" placeholder="Enter link url" value="' + url + '" />' +
				'<input id="title" placeholder="Enter a title for this link" />' +
				'<textarea id="description" placeholder="Enter a description for this link" />'
		).append(
			$('<div class="button-group" />').append(
			$('<a href="#" class="btn btn-primary">Post</a>').click(postLink))
		);

		resizeFeed(200);
		scroll();
	};

	function fillLinkForm(data) {
		if (data) {
			$('#title').val(data.title);
			$('#description').text(data.description);
			if (data.image) {
				$('#thumbnail').css('background-image',data.image).show();
			}
		}
		$('#controls .busy').hide();
		$('#title').focus();
	};

	function scroll() {
		$('#feed').animate({ scrollTop: $('#feed').prop("scrollHeight") }, 500);
	};

	function resizeFeed(height) {
		if (!height) height = $('#controls').height();
		$('#feed').height($('#main').height()-(height+5));
	};

	socket.on('message', function(message) {
		receiveMessage(message);
		scroll();
	});
	socket.on('messages', function(messages) {
		messages.forEach(receiveMessage);
		scroll();
	});
	socket.on('linkmeta', function(data) {
		fillLinkForm(data);
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

	$('#input').change(inputReceived).focus();
	$(window).resize(resizeFeed);


	resizeFeed();

	return self;
}());

