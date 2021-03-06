// Component for uploading wallpapers
let profileUploadC = {
    template: `
    <div class="mx-lg-3 row">
        <alert-cross class="col-auto"></alert-cross>
        <div id="upload-wp" class="col-10 m-auto col-lg-8 bg-dark border border-2 border-primary p-0">
            <video v-if="userVideo" class="unclickable p-2 wallpaper-video m-0 mx-auto" 
            autoplay loop muted>
                <source :src="userVideo" id="upload-video">
            </video>
            <img v-else :src="getUploadImg" class="img-fluid w-100 p-2" :class="{'light-img': !userImg}" alt="Upload">
        </div>
        <div class="col-10 mx-auto p-0 p-lg-3 mt-2">
            <div class="input-group row m-auto shadow-sm">
                <input @change="onUploadChange" class="form-control form-control-lg col-auto" accept="video/mp4" type="file"/>
                <button @click="uploadFile" class="btn btn-success col-lg-2 col-auto" type="button">Upload</button>
            </div>
            <div class="row mt-3 mx-auto col-12">
                <div class="rounded col-lg-8 p-0 h-auto">
                    <div class="bg-light rounded">
                        <div class="input-group">
                            <span class="input-group-text w-25">Type</span>
                            <input v-bind:value="type" type="text" class="form-control" disabled>
                        </div>
                        <div class="input-group rounded-0">
                            <span class="input-group-text w-25">
                                Resolution
                            </span>
                            <input v-bind:value="displayWidth" type="text" class="form-control text-end" disabled>
                            <span class="input-group-text">✕</span>
                            <input v-bind:value="displayHeight" type="text" class="form-control text-start" disabled>
                        </div>
                    </div>
                </div>
                <div class="col-lg p-0 ms-lg-3 mt-lg-0 mt-3">
                    <form class="input-group" @submit.prevent @submit="addTag">
                        <input v-model="tagInput" class="form-control" type="text" placeholder="Tagname"/>
                        <button class="btn btn-success" type="submit">Add tag</button>
                    </form>
                    <div class="list-group py-0 border-lg m-lg-1 m-0 my-1 portrait-h">
                        <transition-group name="tag-list-item">
                            <div role="button" v-for="tag in tags.slice().reverse()" :key="tag"
                            class="list-group-item list-group-item-action text-capitalize alert-dismissible overflow-hidden">
                                {{ tag }}
                                <div type="button" class="btn-close p-0 h-100 pe-4" @click="removeTag(tag)"></div>
                            </div>
                        </transition-group>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userImg: null,      // Added image
            userVideo: null,    // Added video
            type: "",           // Filetype
            width: null,        // Wallpaper width
            height: null,       // Wallpaper height
            tags: [],           // Tags added to wallpaper
            tagInput: ""        // Current tag input
        }
    },
    computed: {
        // Displaying image
        getUploadImg: function () {
            return this.userImg ? this.userImg : DEFAULT_UPLOAD_IMAGE;
        },

        // Displaying width
        displayWidth: function () {
            return this.displayData(this.width);
        },

        // Displaying height
        displayHeight: function () {
            return this.displayData(this.height);
        }
    },
    methods: {
        // Get display data
        displayData: function (data) {
            return (this.userImg || this.userVideo) && data ? data : "";
        },

        // Add tag to wallpaper
        addTag: function () {
            if (!this.tagInput) {
                setAlert("Cannot add an empty tag.", "danger", "cross");
                return;
            } else if (!cmnIsGoodString(this.tagInput, STRING_CHECKS.ALPHA)) {
                setAlert("Tag cannot contain numbers or special signs.", "danger", "cross");
                return;
            }
            let lowerStr = this.tagInput.toLowerCase();
            if (this.tags.includes(lowerStr)) {
                setAlert("Tag is already added to the list", "danger", "cross");
                return;
            }
            clearAlert();
            this.tags.push(lowerStr);
            this.tagInput = "";
        },

        // Remove tag from wallpaper
        removeTag: function (tag) {
            if (!tag || cmnPopValue(this.tags, tag)) {
                setAlert("Cannot remove tag.", "danger", "cross");
                return;
            }
            clearAlert();
        },

        // Change media in the wallpaper upload preview
        onUploadChange: function (e) {
            let files = e.target.files;
            if (!files.length) return;
            let file = files[0];
            clearAlert();
            if (file.type.includes("image")) {
                this.createImage(file);
            } else if (file.type.includes("video")) {
                return this.createVideo(file);
            } else {
                this.userImg = this.userVideo = null;
            }
            setAlert("The current file format is not supported.", "danger");
        },

        // Creates image from file
        createImage: function (file) {
            let reader = new FileReader();
            this.width = this.height = null;
            reader.onload = (e) => {
                this.userImg = e.target.result;
                this.userVideo = null;
                this.type = file.type;
            };
            reader.readAsDataURL(file);
        },

        // Creates video from file
        createVideo: function (file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.userVideo = e.target.result;
                this.userImg = null;
                this.type = file.type;
                this.vidUpdateRes(e.target.result);
            };
            this.userVideo = null;
            reader.readAsDataURL(file);
        },

        // Get dimentions from video
        vidUpdateRes: function (src) {
            let comp = this;
            let video = document.createElement("video");
            video.src = src;
            video.addEventListener("loadedmetadata", function () {
                 comp.width = this.videoWidth;
                 comp.height = this.videoHeight;
            });
        },

        // Upload wallpaper to server
        uploadFile: async function () {
            let mediatype = null;
            let type;
            for (type in MEDIA_TYPES) {
                if (this.type.includes(type)) {
                    mediatype = type;
                    break;
                }
            }
            if (!mediatype || !type) {
                setAlert("The current file format is not supported.", "danger", "cross");
                return;
            }
            let reply = await fetch("/wallpaperdata", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "data": this.userVideo,
                    "tags": this.tags
                })
            }).catch(()=>{});
            this.tags = [];
            if (!reply || reply.status !== 200) {
                setAlert("Internal error occurred.", "danger", "cross");
                return;
            }
            let json = await reply.json();
            if (json.status !== "success"){
                let msg = json.msg ? json.msg : "unknown";
                setAlert("Internal error occurred: " + msg, json.status, "cross");
                return;
            }
            setAlert("Successfully uploaded " + type + ".", "success", "cross");
            let wpId = json.id;
            if (wpId && store.state.user.wpUploaded) store.state.user.wpUploaded.push(wpId);
        },
    }
};