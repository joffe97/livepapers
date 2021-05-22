let adminMenuWallpapersC = {
    template: `
    <div class="d-flex justify-content-between mb-2 flex-wrap">
        <div class="btn btn-success col-12 col-sm-auto mb-3 mb-sm-0 px-sm-5 py-sm-3" @click="updateWallpaper">Apply</div>
        <form class="input-group w-auto mx-sm-0 mx-auto flex-nowrap col-12 col-sm-auto" @submit.prevent 
        @submit="searchWallpaper">
            <div class="form-floating">
                <input id="wallpaper-search" class="form-control col-auto rounded-0 rounded-start" 
                :class="wallpaperValidatorClass"
                type="search" placeholder="Wallpaper id" v-model="wallpaperInput">
                <label for="wallpaper-search">Wallpaper id</label>
            </div>
            <div class="btn btn-secondary col-auto d-flex align-items-center" @click="searchWallpaper">
                <i class="bi bi-search"></i>
            </div>
        </form>
    </div>
    <hr>
    <div class="display-6">Permissions</div>
    <div class="d-flex flex-fill justify-content-sm-between flex-column flex-sm-row flex-wrap mt-3">
    </div>
    <hr>
    `,
    data() {
        return {
            wallpaperInput: "",
            validWallpaperInput: undefined,
            wp: undefined
        }
    },
    computed: {
        wallpaperValidatorClass: function () {
            switch (this.validWallpaperInput) {
                case true:
                    return "is-valid";
                case false:
                    return "is-invalid";
                default:
                    return "";
            }
        },
    },
    methods: {
        searchWallpaper: async function () {
            console.log(1232)
            let wp = await store.loadWallpaper(this.wallpaperInput);
            if (!wp) {
                this.validWallpaperInput = false;
                return;
            }
            this.wp = wp;
            this.validWallpaperInput = true;
        },
        updateWallpaper: async function () {

        }
    },
    watch: {
        wallpaperInput: function () {
            this.validWallpaperInput = undefined;
            this.wp = undefined;
        }
    }
}