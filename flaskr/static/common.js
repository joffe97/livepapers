async function cmnIsLoggedIn() {
    let reply = await fetch("/userdata");
	if (reply.status !== 200) return;
	return await reply.text();
}

function cmnGetVideoUrl (wpId) {
	return 'static/wallpapers/videos/' + wpId + '.mp4'
}

function cmnGetImageUrl (wpId) {
	return 'static/wallpapers/images/' + wpId + '.jpg'
}
