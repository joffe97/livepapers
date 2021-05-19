let profileSettingsC = {
    template: `
    <div class="col col-lg-11 mx-lg-auto pb-3">
        <div class="justify-content-between position-relative mx-lg-2">
            <div class="display-5 d-inline-block">Settings</div>
        </div>
        <hr>
        <div class="mx-lg-3">
            <div class="mx-lg-2">
                <h3 class="mb-4">Background</h3>
                <div class="d-flex justify-content-center flex-wrap mb-5">
                    <div 
                    v-for="s, i in custom_styles"
                    :style="s.getStr() + outline_style"
                    class="bg-show btn btn-info mx-3 my-2"
                    :class="{'outline-thick': i === selected_style}"
                    @click="selected_style = i"></div>
                </div>
                <button class="btn px-5 mx-auto translate-middle-x position-relative start-50" :style="button_style" 
                @click="changeStyle()">
                    Apply
                </button>
            </div>
            <hr>
            <div class="mx-lg-2">
                <h3 class="mb-4">Profile picture</h3>
                <div class="row mx-auto col-lg-4 col-sm-8 col-11 border border-primary rounded">
                    <img :src="imgurl" class="p-0 rounded-0 rounded-top profile-img" alt="Profile picture">
                    <div class="col-12 input-group p-0 border-top border-primary">
                        <input @change="onUploadChange" class="form-control rounded-bottom-left" accept="image/jpeg" type="file"/>
                        <div @click="uploadProfileImg" class="btn btn-success rounded-bottom-right" type="button">Upload</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            selected_style: this.getCurrentStyleIndex(),
            uploadProfileImg: null
        }
    },
    computed: {
        custom_styles: function () {
            return CUSTOM_STYLES;
        },
        button_style: function () {
            return store.getStyle().getButtonStr();
        },
        outline_style: function () {
            return store.getStyle().getOutlineColor();
        },
        user: function () {
            return store.state.user;
        },
        imgurl: function () {
            if (this.uploadProfileImg) return this.uploadProfileImg;
            return DEFAULT_PROFILE_IMAGE;
        }
    },
    methods: {
        getCurrentStyleIndex: function () {
            for (let i = 0; i < CUSTOM_STYLES.length; i++) {
                if (CUSTOM_STYLES[i].getStr() === store.getStyleStr()) return i;
            }
        },
        changeStyle: async function () {
            if (!this.user || this.selected_style < 0 || this.selected_style >= this.custom_styles.length) return;
            let new_style = this.custom_styles[this.selected_style];
            if (!new_style ) return;
            let error = await this.user.updateStyle(new_style);
            if (error) setAlert("An internal server error occurred.");
        },
        onUploadChange: function (e) {
            let files = e.target.files;
            if (!files.length) return;
            let file = files[0];
            clearAlert();
            if (file.type.includes("image")) {
                this.createImage(file);
                return;
            } else {
                this.uploadProfileImg = null;
            }
            setAlert("The current file format is not supported.", "danger");
        },
        createImage: function (file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.uploadProfileImg = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        uploadProfileImg: function () {

        }
    }
}