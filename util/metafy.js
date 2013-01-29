var scraper = require('scraper')
  , jsdom = require('jsdom');

function page(url, cb) {
	if (/^http:\/\/blip.tv\/.*-(\d+)$/.test(url)) return rss("http://blip.tv/rss/flash/"+RegExp.$1,cb);
	if (/^http:\/\/www.reddit.com\//.test(url)) return rss(url+".rss",cb);
	
	try {
		scraper(url, function(err, $) {
			if (err) return cb(err, null);
			var data = {
				url: url,
				rss: $('link[type="application/rss+xml"]').attr('href') || 
					null,
				type: $('meta[property="og:type"]').attr('content') || 'page',
				title: $('meta[property="og:title"]').attr('content') || 
					$('title').text() ||
					null,
				description: $('meta[property="og:description"]').attr('content') ||
					$('meta[name="description"]').attr('content') ||
					null,
				image: $('meta[property="og:image"]').attr('content') ||
					$('meta[name="twitter:image"]').attr('value') ||
					null
			};
	
			var video = $('meta[property="og:video"]').attr('content') ||
				$('meta[name="twitter:player"]').attr('value');
	
			if (video) {
				data.type = "video";
				data.video = { 
					url: video,
					type: $('meta[property="og:video:type"]').attr('content') || null,
						duration: $('meta[property="video:duration"]').attr('content') || null,
					width: $('meta[property="og:video:width"]').attr('content') ||
						$('meta[name="twitter:player:width"]').attr('value') ||
						null,
					height: $('meta[property="og:video:width"]').attr('content') ||
						$('meta[name="twitter:player:height"]').attr('value') ||
						null
				};
			}

			if (data.rss && (!data.image || !data.title || !data.description)) {
				console.log("Didn't get much data. Digging deeper using rss.");
				rss(data.rss, cb);
			}

			cb(null, data);
		});
	}
	catch (e) {
		console.log("Caught exception " + e);
		cb(e,null);
	}
}

function rss(url, cb) {
	jsdom.env(url, function(err,window) {
		if (err) return cb(err,null);

		var document = window.document;
		var channel = document.querySelector("channel");
		var items = document.getElementsByTagName('item');
		var data;

		try {
			if (items.length == 1) {
				var item = items[0];

				data = {
					type: 'page',
					url: sloppy.get(item,'item.querySelector("link").innerHTML'),
					rss: url,
					title: sloppy.get(item,'item.querySelector("title").innerHTML'),
					description: sloppy.get(item,'item.querySelector("description").innerHTML'),
					image: sloppy.get(item,'item.getElementsByTagName("media:thumbnail")[0].getAttribute("url")'),
				};

				var video = sloppy.get(item,'item.getElementsByTagName("media:player")[0].innerHTML') ||
					sloppy.get(item,'item.getElementsByTagName("media:player")[0].getAttribute("url")');

				if (video) {
					data.type = "video";
					data.video = {
						url: video
					};
				}
			}
		}
		catch (e) { err = e };

		window.close();
		cb(err, data);
	});
}

module.exports.page = page;
module.exports.rss = rss;
