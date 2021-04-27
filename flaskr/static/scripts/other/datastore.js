const DEFAULT_UPLOAD_IMAGE = "/static/assets/upload_default_img.png";

const MEDIA_TYPES = {
    "video": ["mp4"]
};

const ALERT_TYPES = ["danger", "success", "warning"];

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
        this.tags = [];         // [str]:   List of tags
        this.likes = null;      // Int:     Number of likes
    }
    async getTags() {
        if (!this.tags || this.tags.length === 0) {
            let reply = await fetch("/wallpaperdata/" + this.id + "?data=tags");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.tags = json.tags;
        }
        return this.tags;
    }
    async getLikes() {
        if (!this.likes) {
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
            this.dict[id] = new Wallpaper(json.aid, json.username, json.width, json.height,
                json.views, date);
        }
        return this.dict[id];
    }
}

class User {
    constructor(username, type, settings) {
        this.username = username;   // Str:     Username
        this.type = type;           // Int:     Account type
        this.settings = settings;   // Obj:     Settings
        this.wpUploaded = [];       // [int]:   List containing ids of uploaded wallpapers
        this.wpStarred = [];        // [int]:   List containing ids of starred wallpapers
        this.receivedStars = null   // Int:     Number of stars received on uploaded wallpapers
    }
    getImgUrl() {
        return "static/assets/user_default_img.jpg";  // TODO: Get image from server or database. Needs research on how to.
    }
    async getUploaded() {
        if (!this.wpUploaded || this.wpUploaded.length === 0) {
            let reply = await fetch("/userdata?data=uploaded");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.wpUploaded = json.uploaded;
        }
        return this.wpUploaded;
    }
    async getStarred() {
        if (!this.wpStarred || this.wpStarred.length === 0) {
            let reply = await fetch("/userdata?data=favorite");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.wpStarred = json.favorite;
        }
        return this.wpStarred;
    }
    async getReceivedStars() {
        if (!this.receivedStars) {
            let reply = await fetch("/userdata?data=receivedstars");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.receivedStars = json.receivedStars;
        }
        return this.receivedStars;
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
            alertType: "danger",
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
    getWpViewsStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.views : "";
    }
    getWpStarsStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.likes : "";
    }
    getWpResolutionStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? (wp.width + " x " + wp.height) : "";
    }
    getWpTags (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.tags : [];
    }
}

let store = new DataStore();

function setAlert(message, type = "danger") {
    store.state.alertMessage = message;
    if (ALERT_TYPES.includes(type.toLowerCase())) {
        store.state.alertType = type;
    } else {
        store.state.alertType = "danger";
    }
}

function clearAlert() {
    store.state.alertMessage = "";
}
