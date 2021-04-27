let profileUploadC = {
    template: `
    <div class="mx-lg-3 row align-content-center flex-column">
        <alert-cross class="col-auto"></alert-cross>
        <div id="upload-wp" class="col-10 m-auto col-lg-8 bg-dark border border-2 border-primary p-0">
            <video v-if="userVideo" class="unclickable p-2 wallpaper-video m-0 mx-auto" 
            autoplay loop muted>
                <source :src="userVideo" id="upload-video">
            </video>
            <img v-else :src="getUploadImg" class="img-fluid w-100 p-2" :class="{'light-img': !userImg}" alt="Upload">
        </div>
        <div class="col-10 ms-lg-4 m-auto p-lg-3 mt-2">
            <div class="input-group row m-auto shadow-sm">
                <input @change="onUploadChange" class="form-control form-control-lg col-auto" accept="video/mp4" type="file"/>
                <button @click="uploadFile" class="btn btn-success col-lg-2 col-auto" type="button">Upload</button>
            </div>
            <div class="row mt-3 mx-lg-3">
                <div class=" rounded col-lg-8 p-0 h-auto">
                    <div class="bg-light rounded">
                        <div>
                            <div class="input-group">
                                <span class="input-group-text w-25" :class="{}">Name</span>
                                <input v-model="customName" type="text" class="form-control" placeholder="Example">
                            </div>
                            <div class="input-group">
                                <span class="input-group-text w-25">Type</span>
                                <input v-bind:value="type" type="text" class="form-control" disabled>
                            </div>
                        </div>            
                        <div class="input-group rounded-0">
                            <span class="input-group-text w-25">
                                <span class="d-none d-lg-inline">Width ✕ height</span>
                                <span class="d-lg-none">W ✕ H</span>
                            </span>
                            <input v-bind:value="displayWidth" type="text" class="form-control text-end" disabled>
                            <span class="input-group-text">✕</span>
                            <input v-bind:value="displayHeight" type="text" class="form-control text-start" disabled>
                        </div>
                    </div>
                </div>
                <div class="col-lg p-0 mx-lg-3 mt-lg-0 mt-3">
                    <form class="input-group" @submit.prevent @submit="addTag">
                        <input v-model="tagInput" class="form-control" type="text" placeholder="Tagname"/>
                        <button class="btn btn-success" type="submit">Add tag</button>
                    </form>
                    <div class="list-group py-0 border-lg m-lg-1 m-0 my-1 portrait-h">
                        <div v-for="tag in tags.slice().reverse()" role="button"
                        class="list-group-item list-group-item-action text-capitalize alert-dismissible">
                            {{ tag }}
                            <button type="button" class="btn-close p-0 h-100 pe-4"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userImg: null,
            userVideo: null,
            video: null,
            type: "",
            width: null,
            height: null,
            customName: "",
            tags: [],
            tagInput: ""
        }
    },
    computed: {
        getUploadImg: function () {
            return this.userImg ? this.userImg : DEFAULT_UPLOAD_IMAGE;
        },
        displayWidth: function () {
            return this.displayData(this.width);
        },
        displayHeight: function () {
            return this.displayData(this.height);
        }
    },
    methods: {
        displayData: function (data) {
            return (this.userImg || this.userVideo) && data ? data : "";
        },
        addTag: function () {
            if (!this.tagInput) {
                setAlert("Cannot add an empty tag.", "danger");
                return;
            } else if (!cmnIsGoodString(this.tagInput, STRING_CHECKS.ALPHA)) {
                setAlert("Tag cannot contain numbers or special signs.", "danger");
                return;
            }
            let lowerStr = this.tagInput.toLowerCase();
            if (this.tags.includes(lowerStr)) {
                setAlert("Tag is already added to the list", "danger");
                return;
            }
            clearAlert();
            this.tags.push(lowerStr);
            this.tagInput = "";
        },
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
        createVideo: function (file) {
            console.log(file)
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
        vidUpdateRes: function (src) {
            let comp = this;
            let video = document.createElement("video");
            video.src = src;
            video.addEventListener("loadedmetadata", function () {
                 comp.width = this.videoWidth;
                 comp.height = this.videoHeight;
            });
        },
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
                console.log(MEDIA_TYPES)
                setAlert("The current file format is not supported.", "danger");
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
            })
            this.tags = [];
            if (reply.status !== 200) {
                console.log(2)
                setAlert("Internal error occurred.");
                return;
            }
            let json = await reply.json();
            if (json.status !== "success"){
                let msg = json.msg ? json.msg : "unknown";
                setAlert("Internal error occurred: " + msg, json.status);
                return;
            }
            setAlert("Successfully uploaded " + type + ".", "success");
        },
    }
};