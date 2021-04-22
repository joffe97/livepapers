let profileUploadC = {
    template: `
    <div class="mx-lg-3 row align-content-center flex-column">
        <div class="col-10 m-auto mb-2 col-lg-6">
            <video v-if="userVideo" class="unclickable p-0 wallpaper-video m-0 mx-auto" autoplay loop muted>
                <source :src="userVideo">
            </video>
            <img v-else :src="getUploadImg" class="img-fluid w-100" :class="{'light-img': !userImg}" alt="Upload">
        </div>
        <div class="col-10 ms-lg-4 m-auto p-lg-3">
            <div class="input-group row m-auto shadow-sm">
                <input @change="onUploadChange" class="form-control form-control-lg col-auto" accept="video/mp4" type="file"/>
                <button class="btn btn-success col-lg-2 col-auto" type="button">Upload</button>
            </div>
            <div class="row mt-3 mx-lg-3">
                <div class=" rounded col-lg-8 p-0 h-auto">
                    <div class="bg-light rounded">
                        <div class="">
                            <div class="input-group">
                                <span class="input-group-text w-25" :class="{}">Name</span>
                                <input v-model="customName" type="text" class="form-control">
                            </div>
                            <div class="input-group">
                                <span class="input-group-text w-25">Type</span>
                                <input v-bind:value="type" type="text" class="form-control" disabled>
                            </div>
                        </div>            
                        <div class="input-group rounded-0">
                            <span class="input-group-text w-25">Width x height</span>
                            <input v-bind:value="displayWidth" type="text" class="form-control text-end" disabled>
                            <span class="input-group-text">╳</span>
                            <input v-bind:value="displayHeight" type="text" class="form-control text-start" disabled>
                        </div>
                    </div>
                </div>
                <div class="col-lg p-0 mx-lg-3 mt-lg-0 mt-3">
                    <div class="input-group">
                        <input class="form-control" type="text"/>
                        <button class="btn btn-success" type="button">Add tag</button>
                    </div>
                    <div class="list-group py-0 border-lg m-lg-1 m-0 my-1">
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
            type: "",
            width: null,
            height: null,
            customName: "",
            tags: ["banan", "gul", "brun", "banan", "gul", "brun", "banan", "gul", "brun", "banan", "gul", "brun", ]
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
    watch: {
        userImg: function () {
            console.log(this.userImg);
        }
    },
    methods: {
        displayData: function (data) {
            return data ? data : "";
        },
        onUploadChange: function (e) {
            let files = e.target.files;
            if (!files.length) return;
            let file = files[files.length - 1];
            if (file.type.includes("image")) {
                return this.createImage(file);
            } else if (file.type.includes("video")) {
                return this.createVideo(file);
            } else {
                this.userImg = this.userVideo = null;
            }
        },
        createImage: function (file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.userImg = e.target.result;
                this.userVideo = null;
            };
            reader.readAsDataURL(file);
        },
        createVideo: function (file) {
            console.log(file)
            this.userVideo = null;
            let reader = new FileReader();
            reader.onload = (e) => {
                this.userVideo = e.target.result;
                this.userImg = null;
                this.type = file.type;
                console.log(e);
            };
            reader.readAsDataURL(file);
        },
        uploadFile: function () {

        }
    }
}