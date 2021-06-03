EMOJI_SCREAMING = "&#128561";	// Screaming emoji

// Types of string checks
const STRING_CHECKS = {
	ALPHA: 1,
	NUM: 1 << 1
};

// Time conversions
const SEC_IN_MIN = 60;
const SEC_IN_HOUR = SEC_IN_MIN * 60;
const SEC_IN_DAY = SEC_IN_HOUR * 24;
const SEC_IN_WEEK = SEC_IN_DAY * 7;
const SEC_IN_YEAR = SEC_IN_DAY * 365;
const SEC_IN_MONTH = Math.floor(SEC_IN_YEAR / 12);

// Checks if user is logged in
async function cmnIsLoggedIn() {
	let reply = await fetch("/validate");
	if (reply.status !== 200) return false;
	let json = await reply.json();
	return json.loggedIn === true;
}

// Returns url to wallpaper video
function cmnGetVideoUrl (wpId) {
	return 'static/wallpapers/videos/' + wpId + '.mp4';
}

// Returns url to wallpaper image
function cmnGetImageUrl (wpId) {
	return wpId ? 'static/wallpapers/images/' + wpId + '.jpg' : 'static/assets/no_wallpaper.png';
}

// Scroll to top
function cmnScrollTop () {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

// Returns true if char is a big or small letter between A and Z
function cmnCharIsAlpha (ch) {
	return (ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z");
}

// Returns true if char is a number
function cmnCharIsNum (ch) {
	return (ch >= "0" && ch <= "9");
}

// Returns true if the given string is fill all the criterias in checkFlags
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

// Remove a value from an array
function cmnPopValue(array, value) {
	if (!array) return 1;
	let index = array.indexOf(value);
	if (index === -1) return 1;
	array.splice(index, 1);
	return 0;
}

// Convert seconds to another time format
function cmnConvertSeconds(seconds, format, toInt) {
	let time = seconds / format;
	return toInt ? Math.floor(time) : time;
}

// Return the greatest common divisor between a and b
function cmnGcd(a, b) {
	return b === 0 ? a : cmnGcd(b, a % b);
}

// Returns true if the hex color is more dark than light
function cmnIsDarkColor(hexcolor) {
	let colorstr = hexcolor.substring(1);
	let color = parseInt(colorstr, 16);
	let r = (color >> 16) & 0xff;
	let g = (color >> 8) & 0xff;
	let b = (color >> 0) & 0xff;
	return 299 * r + 587 * g + 114 * b < 120000;
}
