const STRING_CHECKS = {
	ALPHA: 1,
	NUM: 1 << 1
}

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

function cmnScrollTop () {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

function cmnCharIsAlpha (ch) {
	return (ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z");
}

function cmnCharIsNum (ch) {
	return (ch >= "0" && ch <= "9");
}

function cmnIsGoodString (string, checkFlags) {
	if (typeof string !== "string") return false;
	for (let i = 0; i < string.length; i++) {
		let ch = string[i]
		if (	((checkFlags & STRING_CHECKS.ALPHA) && cmnCharIsAlpha(ch))
			|| 	((checkFlags & STRING_CHECKS.NUM) && cmnCharIsNum(ch))) {
			continue;
		}
		return false;
	}
	return true;
}