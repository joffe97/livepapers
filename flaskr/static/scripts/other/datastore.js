let ALERT_TYPES = ["danger", "success", "warning"]

class Wallpaper {
    constructor(id) {
        this.id = id;           // Int      Id
        this.width = null;      // Int      Width
        this.height = null;     // Int      Height
        this.views = null;      // Int      Number of views
        this.date = null;       // Date     Upload date
        this.tags = null;       // [str]:   List of tags
        this.likes = null;      // Int:     Number of likes
    }
}

class Wallpapers {
    constructor() {
        this.wallpapers = {};  // wpId[wp]: Object containing loaded wallpapers
    }
    get_wp(id) {
        let wallpaper = this.wallpapers[id];
        if (wallpaper) {
            return wallpaper;
        } else {
            this.wallpapers[id] = new Wallpaper(id);
        }
    }
}

class User {
    constructor() {
        this.username = null;   // Str:     Username
        this.type = null;       // Int:     Account type
        this.settings = null;   // Obj:     Settings
        this.wpStarred = [];    // [int]:   List containing ids of starred wallpapers
        this.wpUploded = [];    // [int]:   List containing ids of uploaded wallpapers
        this.wallpapers = new Wallpapers(); // Wps: Object containing loaded wallpapers
    }
    get_img_url() {
        return "static/assets/user_default_img.jpg";  // TODO: Get image from server or database. Needs research on how to.
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
            user: null
        });
    }
    get_user () {
        // TODO: Get user from database, and fill this.state.user
    }
}

let store = new DataStore();

function setAlert(message, type = "danger") {  // TODO: Put into DataStore
    store.state.alertMessage = message
    if (ALERT_TYPES.includes(type.toLowerCase())) {
        store.state.alertType = type;
    } else {
        store.state.alertType = "danger";
    }
}
