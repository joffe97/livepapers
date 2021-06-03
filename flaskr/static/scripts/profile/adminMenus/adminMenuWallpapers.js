// Component of the user setting menu for admins
let adminMenuWallpapersC = {
    template: `
    <div class="d-flex justify-content-between mb-2 flex-wrap">
        <button class="btn btn-danger col-12 col-sm-auto mb-3 mb-sm-0 px-sm-5 py-sm-3" 
        @click="deleteWallpaper"
        :disabled="!wp">
            Delete
        </button>
        <form class="input-group w-auto mx-sm-0 mx-auto flex-nowrap col-12 col-sm-auto" @submit.prevent 
        @submit="searchWallpaper">
            <div class="form-floating">
                <input id="wallpaper-search" class="form-control col-auto rounded-0 rounded-start" 
                :class="wallpaperValidatorClass"
                placeholder="Wallpaper id" v-model="wallpaperInput">
                <label for="wallpaper-search">Wallpaper id</label>
            </div>
            <div class="btn btn-secondary col-auto d-flex align-items-center" @click="searchWallpaper">
                <i class="bi bi-search"></i>
            </div>
        </form>
    </div>
    <div class="d-flex flex-fill justify-content-sm-between flex-column flex-sm-row flex-wrap mt-3">
        <wallpaper-square v-bind:wpId="wpId" class="mx-auto"></wallpaper-square>
    </div>
    <hr>
    <div class="display-6">Tags</div>
    <div class="d-flex flex-fill justify-content-center flex-wrap mt-3 h5">
        <div v-for="tag in tags" class="text-secondary px-3 py-2 remove-on-click" @click="removeTag(tag)">#{{tag}}</div>
        <div v-if="!tags || !tags.length" class="text-info">No tags found</div>
    </div>
    <hr>
    `,
    data() {
        return {
            wallpaperInput: "",             // The current wallpaper id input
            validWallpaperInput: undefined, // True if valid wallpaper id
            wp: undefined                   // The selected wallpaper
        }
    },
    computed: {
        wpId: function () {
            return this.wp ? this.wp.id : null;
        },

        // Class showing if wallpaper is valid
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

        // The selected wallpapers tags
        tags: function () {
            return this.wp && this.wp.tags ? this.wp.tags : [];
        }
    },
    methods: {
        // Search for a wallpaper with the selected wallpaper id
        searchWallpaper: async function () {
            let wp = await store.loadWallpaper(this.wallpaperInput);
            if (!wp) {
                this.validWallpaperInput = false;
                return;
            }
            this.wp = wp;
            let tags = await this.wp.getTags();
            this.validWallpaperInput = true;
        },

        // Remove tag from wallpaper
        removeTag: async function (tag) {
            if (!this.wp || !confirm(`Remove the tag "${tag}" from the selected wallpaper?`)) return;
            let error = await this.wp.removeTag(tag);
        },

        // Delete current wallpaper
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
        // Remove wallpaper when typing
        wallpaperInput: function () {
            this.validWallpaperInput = undefined;
            this.wp = undefined;
        }
    }
};