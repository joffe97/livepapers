let ALERT_TYPES = ["danger", "success", "warning"]

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
    async get_tags() {
        if (!this.tags) {
            let reply = await fetch("/wallpaperdata/" + this.id + "?data=tags");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.tags = json.tags;
        }
        return this.tags;
    }
    async get_likes() {
        if (!this.likes) {
            let reply = await fetch("/wallpaperdata/" + this.id + "?data=likes");
            if (reply.status !== 200) return null;
            let json = await reply.json();
            this.likes = json.likes;
        }
        return this.likes;
    }
}

class Wallpapers {
    constructor() {
        this.wallpapers = {};  // wpId[wp]: Object containing loaded wallpapers
    }
    async getWallpaper(id) {
        if (!this.wallpapers[id]) {
            let reply = await fetch("/wallpaperdata/" + id);
            if (reply.status !== 200) return null;
            let json = await reply.json();
            this.wallpapers[id] = new Wallpaper(json.aid, json.username, json.width, json.height, json.date, json.views)
        }
        return this.wallpapers[id];
    }
}

class User {
    constructor(username, type, settings) {
        this.username = username;   // Str:     Username
        this.type = type;           // Int:     Account type
        this.settings = settings;   // Obj:     Settings
        this.wpStarred = [];        // [int]:   List containing ids of starred wallpapers
        this.wpUploaded = [];        // [int]:   List containing ids of uploaded wallpapers
    }
    async getImgUrl() {
        return "static/assets/user_default_img.jpg";  // TODO: Get image from server or database. Needs research on how to.
    }
    async getStarred() {
        let reply = await fetch("/userdata?data=favorite");
        if (reply.status !== 200) return [];
        let json = await reply.json();
        this.wpStarred = json.favorite;
        return this.wpStarred;
    }
    async getUploaded() {
        let reply = await fetch("/userdata?data=uploaded");
        if (reply.status !== 200) return [];
        let json = await reply.json();
        this.wpUploaded = json.uploaded;
        return this.wpUploaded;
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
    async getWallpaper (wpId) {
        return this.state.wallpapers.getWallpaper(wpId);
    }
}

let store = new DataStore();

function setAlert(message, type = "danger") {  // TODO: Put into DataStore
    store.state.alertMessage = message;
    if (ALERT_TYPES.includes(type.toLowerCase())) {
        store.state.alertType = type;
    } else {
        store.state.alertType = "danger";
    }
}
