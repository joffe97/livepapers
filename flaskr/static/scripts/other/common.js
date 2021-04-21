async function cmnIsLoggedIn() {
	let reply = await fetch("/validate");
	if (reply.status !== 200) return false;
	let json = await reply.json();
	console.log(json);
	return json.loggedIn === true;
}

function cmnGetVideoUrl (wpId) {
	return 'static/wallpapers/videos/' + wpId + '.mp4'
}

function cmnGetImageUrl (wpId) {
	return 'static/wallpapers/images/' + wpId + '.jpg'
}
