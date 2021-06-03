const DEFAULT_UPLOAD_IMAGE = "static/assets/upload_default_img.png";    // Path to upload image placeholder

const DEFAULT_PROFILE_IMAGE = "static/assets/user_default_img.jpg";     // Path to default profile picture

const PROFILE_IMAGE_DIRECTORY = "static/profileimages/";   // Path to profile picture

// Accepted wallpaper media
const MEDIA_TYPES = {
    "video": ["mp4"]
};

const ALERT_TYPES = ["danger", "success", "warning"];   // Types of alerts

const ALERT_MODES = ["tmp", "cross"];   // Names of alert modes

// Class containing user type flags
const USER_TYPES = {
    WP_ADD: 1,              // Add wallpapers
    PROFILE_IMG: 1 << 1,    // Have profile image
    ADMIN: 1 << 2,          // Manage users and userdata (except of admins and managers)
    MANAGER: 1 << 3,        // Manage all users and userdata
    BLOCKED: 1 << 4         // Blocked user
};


// Returns description of user type
function getUserTypeDesc(type) {
    switch (type) {
        case USER_TYPES.WP_ADD:
            return "Add wallpapers";
        case USER_TYPES.PROFILE_IMG:
            return "Profile picture";
        case USER_TYPES.ADMIN:
            return "Admin";
        case USER_TYPES.MANAGER:
            return "Manager";
        case USER_TYPES.BLOCKED:
            return "Blocked";
    }
}

// Class used for wallpaper data
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

    // Return tags. Fetch from server if it is not yet defined.
    async getTags() {
        if (this.tags === undefined) {
            let reply = await fetch("/wallpaperdata/" + this.id + "/tags");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.tags = json.tags;
        }
        return this.tags;
    }

    // Adds tag to wallpaper
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

    // Removes tag from wallpaper
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

    // Return likes. Fetch from server if it is not yet defined.
    async getLikes() {
        if (this.likes === undefined) {
            let reply = await fetch("/wallpaperdata/" + this.id + "/likes");
            if (reply.status !== 200) return null;
            let json = await reply.json();
            this.likes = json.likes;
        }
        return this.likes;
    }

    // Increment number of views on wallpaper
    async incrementViews () {
        let reply = await fetch("/wallpaperdata/" + this.id + "/views", {
            method: "PUT"
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.views += 1;
        return 0;
    }

    // Returns upload date of wallpaper
    getDateString() {
        return this.date.toLocaleString();
    }

    /* Returns a string that displays how long ago it is since the wallpaper got updated.
       Ex: "5 years", "1 month", "53 seconds"
     */
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

    // Calculates and returns the acpect ratio of the wallpaper
    getAspectRatio() {
        let gcd = cmnGcd(this.width, this.height);
        return {width: this.width / gcd, height: this.height / gcd};
    }

    // Returns the resolution of the wallpaper
    getResolution() {
        return this.width + " x " + this.height;
    }
}

// A class used for multiple wallpapers
class Wallpapers {
    constructor() {
        this.dict = {};  // wpId[wp]: Object containing loaded wallpapers
    }

    // Returns the wallpaper with the given id, if the wallpaper is loaded
    getWallpaper(id) {
        return this.dict[id];
    }

    // Gets the wallpaper with the given id from the server, stores it, and then returns it
    async loadWallpaper(id) {
        if (!this.dict[id]) {
            let reply = await fetch("/wallpaperdata/" + id);
            if (reply.status !== 200) return null;
            let json = await reply.json();
            this.saveWallpaper(json)
        }
        return this.dict[id];
    }

    // Stores the given wallpaper object
    saveWallpaper(wpObject) {
        if (this.dict[wpObject.aid]) return;
        let date = new Date();
        date.setTime(wpObject.date);
        this.dict[wpObject.aid] = new Wallpaper(wpObject.aid, wpObject.username, wpObject.width, wpObject.height,
            wpObject.views, date);
        if (wpObject.tags !== undefined) this.dict[wpObject.aid].likes = wpObject.tags;
        if (wpObject.stars !== undefined) this.dict[wpObject.aid].likes = wpObject.stars;
    }
}

// Class used for user data
class User {
    constructor(username, type, style, img, filters) {
        if (filters && !filters.filterUploadTime) filters.filterUploadTime = 0;
        this.username = username;       // Str:     Username
        this.type = type;               // Int:     Account type
        this.wpUploaded = undefined;    // [int]:   List containing ids of uploaded wallpapers
        this.wpStarred = undefined;     // [int]:   List containing ids of starred wallpapers
        this.receivedStars = undefined; // Int:     Number of stars received on uploaded wallpapers
        this.style = getStyleObjFromJson(style);    // Obj: Object containing style for user
        this.img = img;                 // Str      Filename of profile picture
        this.filters = filters;         // Obj      Object containing filters
    }

    // Returns url for profile picture
    getImgUrl() {
        return this.img ? `${PROFILE_IMAGE_DIRECTORY}${this.img}` : DEFAULT_PROFILE_IMAGE;
    }

    // Return ids of uploaded wallpapers. Fetch from server if it is not yet defined.
    async getUploaded() {
        if (this.wpUploaded === undefined) {
            let reply = await fetch("/userdata/uploaded");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.wpUploaded = json.uploaded;
        }
        return this.wpUploaded;
    }

    // Return ids of starred wallpapers. Fetch from server if it is not yet defined.
    async getStarred() {
        if (this.wpStarred === undefined) {
            let reply = await fetch("/userdata/favorites");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.wpStarred = json.favorite;
        }
        return this.wpStarred;
    }

    // Return number of stars gotten on uploaded wallpapers. Fetch from server if it is not yet defined.
    async getReceivedStars() {
        if (this.receivedStars === undefined) {
            let reply = await fetch("/userdata/receivedstars");
            if (reply.status !== 200) return [];
            let json = await reply.json();
            this.receivedStars = json.receivedStars;
        }
        return this.receivedStars;
    }

    // Remove a wallpaper from favorites
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

    // Adds a wallpaper to favorites
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

    // Returns true if user is of the given type
    hasType(type) {
        return !!(this.type & type);
    }

    // Returns true if user is admin or manager
    isAnyAdmin() {
        return this.hasType(USER_TYPES.ADMIN | USER_TYPES.MANAGER);
    }

    // Updates the users style
    async updateStyle(style) {
        if (!style) return 1;
        let reply = await fetch("/userdata/style", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "style": style
            })
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.style = style;
        return 0;
    }

    // Updates the users browsing filters
    async updateFilters(filters) {
        if (!filters) return 1;
        let reply = await fetch("/userdata/filters", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "filters": filters
            })
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success") return 1;
        this.filters = filters;
        return 0;
    }

    // Updates the users profile picture
    async updateImg(imgdata) {
        if (!imgdata) return 1;
        let reply = await fetch("/userdata/img", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "img": imgdata
            })
        });
        if (reply.status !== 200) return 1;
        let json = await reply.json();
        if (json.status !== "success" || !json.img) return 1;
        this.img = json.img;
        return 0;
    }
}

// Class used to store application data
class DataStore {
    constructor() {
        this.state = Vue.reactive({
            isInited: false,    // True if application is initialized
            isLoggedIn: false,  // True if user is logged in
            pageId: 0,          // Id of the current page. 0 if not important
            alertMessage: "",   // Message in the current alert
            alertType: "",      // Type of the current alert. Ex: "error", "success"
            alertMode: "",      // Mode of the current alert type. Ex: "tmp", "cross"
            user: null,         // Current logged in user
            wallpapers: new Wallpapers(),  // Wps: Object containing loaded wallpapers
            filterRatio: "",    // The selected ratio filter for the browse pages
            filterColor: "",    // The selected color filter for the browse pages
            filterUploadTime: 0,    // The selected "uploaded after" filter for the browse pages
            filterSearch: "",   // The current search query in the the browse pages
            filterSearchTrigger: 0  // A trigger that empties the filterSearch every time it changes
        });
    }

    // Returns the logged in user. Fetches from server if it doesn't exist
    async getUser () {
        if (!this.state.isLoggedIn) this.state.isLoggedIn = await cmnIsLoggedIn();
        if (!this.state.user) {
            let reply = await fetch("/userdata/user");
            if (reply.status !== 200) return null;
            let json = await reply.json();
            let style = json.style ? JSON.parse(json.style) : null;
            let img = json.img ? json.img : null;
            let filters = json.filters ? JSON.parse(json.filters) : null;
            if (json.username !== undefined && json.type !== undefined) {
                this.state.user = new User(json.username, json.type, style, img, filters);
            }
        }
        return this.state.user;
    }

    // Fetches a given wallpaper from the server
    async loadWallpaper (wpId) {
        return await this.state.wallpapers.loadWallpaper(wpId);
    }

    // Fetches a list of wallpapers from the server
    async loadManyWallpapers (wpIds) {
        for (let i = 0; i < wpIds.length; i++) {
            await this.loadWallpaper(wpIds[i]);
        }
    }

    // Fetches tags for a list of wallpapers
    async loadManyWallpaperTags (wpIds) {
        for (let i = 0; i < wpIds.length; i++) {
            let wp = await this.loadWallpaper(wpIds[i]);
            wp.tags = await wp.getTags();
        }
    }

    // Fetches favorite count for a list of wallpapers
    async loadManyWallpaperFavorites (wpIds) {
        for (let i = 0; i < wpIds.length; i++) {
            let wp = await this.loadWallpaper(wpIds[i]);
            wp.likes = await wp.getLikes();
        }
    }

    // Returns the wallpaper with the given id, if it is loaded
    getWallpaper (wpId) {
        return this.state.wallpapers.getWallpaper(wpId);
    }

    // Returns a string of the given wallpapers upload time
    getWpDateStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.getDateString() : "";
    }

    // Returns the username of the given wallpapers uploader
    getWpUploaderStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.username : "";
    }

    // Returns the number of views a given wallpaper has
    getWpViewsStr (wpId) {
        let wp = this.getWallpaper(wpId);
        if (!wp) return 0;
        return wp.views ? wp.views : 0;
    }

    // Returns the number of stars a given wallpaper has
    getWpStarsStr (wpId) {
        let wp = this.getWallpaper(wpId);
        if (!wp) return 0;
        return wp.likes ? wp.likes : 0;
    }

    // Returns a string of the given wallpapers resolution
    getWpResolutionStr (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.getResolution() : "";
    }

    // Returns a string of the given wallpapers aspect ratio
    getWpAspectRatioStr (wpId) {
        let wp = this.getWallpaper(wpId);
        if (!wp) return "";
        let ratio = wp.getAspectRatio();
        return ratio.width + ":" + ratio.height;
    }

    // Returns a list of the given wallpapers tags
    getWpTags (wpId) {
        let wp = this.getWallpaper(wpId);
        return wp ? wp.tags : [];
    }

    // Removes the given wallpaper and values associated with it
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

    // Returns the current users style
    getStyle() {
        if (this.state.user) {
            let style = this.state.user.style;
            if (style) return style;
        }
        return DEFAULT_STYLE;
    }

    // Returns a css string of the current users style
    getStyleStr() {
        return this.getStyle().getStr();
    }

    // Returns a user object of another user with a given username
    async getOtherUser(username) {
        if (!this.state.user || !username || this.state.user.username === username.toLowerCase()) return null;
        let reply = await fetch(`/allusers/${username}/data`);
        if (reply.status !== 200) return null;
        let json = await reply.json();
        let style = json.style ? JSON.parse(json.style) : null;
        let img = json.img ? json.img : null;
        let filters = json.filters ? JSON.parse(json.filters) : null;
        if (json.username !== undefined && json.type !== undefined) {
            return new User(json.username, json.type, style, img, filters);
        }
        return null;
    }
}

// Creates the data storage
let store = new DataStore();

// Set an alert of a given type
function setAlert(message, type = "danger", mode = "tmp") {
    store.state.alertMessage = message;
    store.state.alertType = ALERT_TYPES.includes(type.toLowerCase()) ? type : "danger";
    store.state.alertMode = ALERT_MODES.includes(mode.toLowerCase()) ? mode : "tmp";
}

// Clear any alert
function clearAlert() {
    store.state.alertMode = "";
    this.timeout = setTimeout(() => store.state.alertMessage = "", 800);
}
