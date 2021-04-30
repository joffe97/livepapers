const DEFAULT_UPLOAD_IMAGE = "/static/assets/upload_default_img.png";

const MEDIA_TYPES = {
    "video": ["mp4"]
};

const ALERT_TYPES = ["danger", "success", "warning"];

const ALERT_MODES = ["tmp", "cross"];

const USER_TYPES = {
    WP_ADD: 1,
    WP_REM: 1 << 1,
    ADMIN: 1 << 2,
    MANAGER: 1 << 3,
    BLOCKED: 1 << 4
};

function getUserTypeDesc(type) {
    switch (type) {
        case USER_TYPES.WP_ADD:
            return "Add wallpapers";
        case USER_TYPES.WP_REM:
            return "Remove wallpapers";
        case USER_TYPES.ADMIN:
            return "Admin";
        case USER_TYPES.MANAGER:
            return "Manager";
        case USER_TYPES.BLOCKED:
            return "Blocked";
    }
}

class Wallpaper {
    constructor(id, username, width, height, views, date) {
        this.id = id;           // Int      Id
        this.username = username; // Int    Username of uploader
        this.width = width;     // Int      Width
        this.height = height;   // Int      Height
        this.views = views;     // Int      Number of views
        this.date = date;       // Date     Upload date
        this.tags = undefined;  // [str]:   List of tags
        this.likes = undefined; // Int:     Number of likes
    }
    async getTags() {
        if (this.tags === undefined) {
            let reply = await fetch("/wallpaperdata/" + this.id + "?data=tags");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.tags = json.tags;
        }
        return this.tags;
    }
    async addTag(tag) {
        if (!tag || this.tags === undefined) return 1;
        tag = tag.toLowerCase();
        if (this.tags.includes(tag)) return 1;
        let reply = await fetch("/wallpaperdata/" + this.id + "/tags", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "tag": tag
            })
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.tags.push(tag);
        return 0;
    }
    async removeTag(tag) {
        if (!tag) return;
        tag = tag.toLowerCase();
        let index = this.tags.indexOf(tag);
        if (index === -1) return 1;
        let reply = await fetch("/wallpaperdata/" + this.id + "/tags/" + tag, {
            method: "DELETE"
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.tags.splice(index, 1);
        return 0;
    }
    async getLikes() {
        if (this.likes === undefined) {
            let reply = await fetch("/wallpaperdata/" + this.id + "?data=likes");
            if (reply.status !== 200) return null;
            let json = await reply.json();
            this.likes = json.likes;
        }
        return this.likes;
    }
    getDateString() {
        return this.date.toLocaleString();
    }
    getTimeSinceString() {
        if (!this.date) return "";
        let seconds = Math.floor((new Date() - this.date) / 1000);
        let interval, unit;

        if ((interval = cmnConvertSeconds(seconds, SEC_IN_YEAR, true)) >= 1) unit = "year";
        else if ((interval = cmnConvertSeconds(seconds, SEC_IN_MONTH, true)) >= 1) unit = "month";
        else if ((interval = cmnConvertSeconds(seconds, SEC_IN_DAY, true)) >= 1) unit = "day";
        else if ((interval = cmnConvertSeconds(seconds, SEC_IN_HOUR, true)) >= 1) unit = "hour";
        else if ((interval = cmnConvertSeconds(seconds, SEC_IN_MIN, true)) >= 1) unit = "minute";
        else {
            interval = seconds;
            unit = "second";
        }
        if (interval !== 1) unit += "s";
        return interval.toString() + " " + unit;
    }
}

class Wallpapers {
    constructor() {
        this.dict = {};  // wpId[wp]: Object containing loaded wallpapers
    }
    getWallpaper(id) {
        return this.dict[id];
    }
    async loadWallpaper(id) {
        if (!this.dict[id]) {
            let reply = await fetch("/wallpaperdata/" + id);
            if (reply.status !== 200) return null;
            let json = await reply.json();
            let date = new Date();
            date.setTime(json.date);
            this.dict[id] = new Wallpaper(json.aid, json.username, json.width, json.height, json.views, date);
        }
        return this.dict[id];
    }
}

class User {
    constructor(username, type, settings) {
        this.username = username;       // Str:     Username
        this.type = type;               // Int:     Account type
        this.settings = settings;       // Obj:     Settings
        this.wpUploaded = undefined;    // [int]:   List containing ids of uploaded wallpapers
        this.wpStarred = undefined;     // [int]:   List containing ids of starred wallpapers
        this.receivedStars = undefined  // Int:     Number of stars received on uploaded wallpapers
    }
    getImgUrl() {
        return "static/assets/user_default_img.jpg";  // TODO: Get image from server or database. Needs research on how to.
    }
    async getUploaded() {
        if (this.wpUploaded === undefined) {
            let reply = await fetch("/userdata?data=uploaded");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.wpUploaded = json.uploaded;
        }
        return this.wpUploaded;
    }
    async getStarred() {
        if (this.wpStarred === undefined) {
            let reply = await fetch("/userdata?data=favorite");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.wpStarred = json.favorite;
        }
        return this.wpStarred;
    }
    async getReceivedStars() {
        if (this.receivedStars === undefined) {
            let reply = await fetch("/userdata?data=receivedstars");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.receivedStars = json.receivedStars;
        }
        return this.receivedStars;
    }
    async removeFavorite(wpId) {
        let index = this.wpStarred.indexOf(wpId);
        if (index === -1) return 1;
        let reply = await fetch("/userdata/favorites/" + wpId, {
            method: "DELETE"
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.wpStarred.splice(index, 1);
        return 0;
    }
    async addFavorite(wpId) {
        if (!wpId) return 1;
        let reply = await fetch("/userdata/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "wpId": wpId
            })
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.wpStarred.push(wpId);
        return 0;
    }
    isAnyAdmin() {
        return (this.type & (USER_TYPES.ADMIN | USER_TYPES.MANAGER)) !== 0;
    }
}

class DataStore {
    constructor() {
        this.state = Vue.reactive({
            isInited: false,
            isLoggedIn: false,
            pageId: 0,
            alertMessage: "",
            alertType: "",
            alertMode: "",
            user: null,
            wallpapers: new Wallpapers() // Wps: Object containing loaded wallpapers
        });
    }
    async getUser () {
        if (!this.state.user) {
            let reply = await fetch("/userdata?data=user");
            if (reply.status !== 200) return null;
            let json = await reply.json();
            this.state.user = new User(json.username, json.type, json.settings);
        }
        return this.state.user;
    }
    async loadWallpaper (wpId) {
        return await this.state.wallpapers.loadWallpaper(wpId);
    }
    async loadManyWallpapers (wpIds) {
        for (let i = 0; i < wpIds.length; i++) {
            await this.loadWallpaper(wpIds[i]);
        }
    }
    async loadManyWallpaperTags (wpIds) {
        for (let i = 0; i < wpIds.length; i++) {
            let wp = await this.loadWallpaper(wpIds[i]);
            wp.tags = await wp.getTags();
        }
    }
    async loadManyWallpaperFavorites (wpIds) {
        for (let i = 0; i < wpIds.length; i++) {
            let wp = await this.loadWallpaper(wpIds[i]);
            wp.likes = await wp.getLikes();
        }
    }
    getWallpaper (wpId) {
        return this.state.wallpapers.getWallpaper(wpId);
    }
    getWpDateStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.getDateString() : "";
    }
    getWpUploaderStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.username : "";
    }
    getWpViewsStr (wpId) {
        let wp = this.getWallpaper(wpId);
        if (!wp) return "0"
        return wp.views ? wp.views : "0";
    }
    getWpStarsStr (wpId) {
        let wp = this.getWallpaper(wpId);
        if (!wp) return "0"
        return wp.likes ? wp.likes : "0";
    }
    getWpResolutionStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? (wp.width + " x " + wp.height) : "";
    }
    getWpTags (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.tags : [];
    }
    async removeWallpaper(wpId) {
        if (!this.state.wallpapers.dict[wpId]) return 1;
        let reply = await fetch("/wallpaperdata/" + wpId, {
            method: "DELETE"
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        delete this.state.wallpapers.dict[wpId];

        cmnPopValue(this.state.user.wpUploaded, wpId);
        cmnPopValue(this.state.user.wpStarred, wpId);

        return 0;
    }

}

let store = new DataStore();

function setAlert(message, type = "danger", mode = "tmp") {
    store.state.alertMessage = message;
    store.state.alertType = ALERT_TYPES.includes(type.toLowerCase()) ? type : "danger";
    store.state.alertMode = ALERT_MODES.includes(mode.toLowerCase()) ? mode : "tmp";
}

function clearAlert() {
    store.state.alertMessage = "";
    store.state.alertType = "";
    store.state.alertMode = "";
}
