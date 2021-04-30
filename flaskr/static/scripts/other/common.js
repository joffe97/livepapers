const STRING_CHECKS = {
	ALPHA: 1,
	NUM: 1 << 1
};

const SEC_IN_MIN = 60;
const SEC_IN_HOUR = SEC_IN_MIN * 60;
const SEC_IN_DAY = SEC_IN_HOUR * 24;
const SEC_IN_WEEK = SEC_IN_DAY * 7;
const SEC_IN_YEAR = SEC_IN_DAY * 365;
const SEC_IN_MONTH = Math.floor(SEC_IN_YEAR / 12);

async function cmnIsLoggedIn() {
	let reply = await fetch("/validate");
	if (reply.status !== 200) return false;
	let json = await reply.json();
	return json.loggedIn === true;
}

function cmnGetTimeStamp (wpId) {
	return
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
		let ch = string[i];
		if (((checkFlags & STRING_CHECKS.ALPHA) && cmnCharIsAlpha(ch))
			|| ((checkFlags & STRING_CHECKS.NUM) && cmnCharIsNum(ch))) {
			continue;
		}
		return false;
	}
	return true;
}

function cmnPopValue(array, value) {
	if (!array) return 1;
	let index = array.indexOf(value);
	if (index === -1) return 1;
	array.splice(index, 1);
	return 0;
}

function cmnConvertSeconds(seconds, format, toInt) {
	let time = seconds / format;
	return toInt ? Math.floor(time) : time;
}
