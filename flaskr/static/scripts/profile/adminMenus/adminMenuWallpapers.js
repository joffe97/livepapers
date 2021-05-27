let adminMenuWallpapersC = {
    template: `
    <div class="d-flex justify-content-between mb-2 flex-wrap">
        <div class="btn-group col-12 col-sm-auto mb-3 mb-sm-0">
            <button 
            class="btn btn-success py-sm-3 px-sm-4"
            @click="updateWallpaper"
            :disabled="!wp">
                Apply
            </button>
            <button 
            class="btn btn-danger py-sm-3 px-sm-2"
            @click="deleteWallpaper"
            :disabled="!wp">
                Delete
            </button>
        </div>
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
    <div class="d-flex flex-fill justify-content-sm-between flex-column flex-sm-row flex-wrap mt-3">
        <wallpaper-square v-bind:wpId="wpId" class="mx-auto"></wallpaper-square>
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
        wpId: function () {
            return this.wp ? this.wp.id : null;
        },
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
            let wp = await store.loadWallpaper(this.wallpaperInput);
            if (!wp) {
                this.validWallpaperInput = false;
                return;
            }
            this.wp = wp;
            this.validWallpaperInput = true;
        },
        updateWallpaper: async function () {

        },
        deleteWallpaper: async function () {
            if (!confirm("Delete selected wallpaper?")) return;
            let error = await store.removeWallpaper(this.wpId);
            if (error) {
                setAlert("Could not delete the selected wallpaper.");
                return;
            }
            setAlert(`Successfully deleted wallpaper ${this.wpId}.`, "success");
            this.wp = undefined;
        }
    },
    watch: {
        wallpaperInput: function () {
            this.validWallpaperInput = undefined;
            this.wp = undefined;
        }
    }
}