async function cmnIsLoggedIn() {
	let reply = await fetch("/validate");
	if (reply.status !== 200) return false;
	return parseInt(await reply.text()) === 1
}

function cmnGetVideoUrl (wpId) {
	return 'static/wallpapers/videos/' + wpId + '.mp4'
}

function cmnGetImageUrl (wpId) {
	return 'static/wallpapers/images/' + wpId + '.jpg'
}
