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
        tags: function () {
            return this.wp && this.wp.tags ? this.wp.tags : [];
        }
    },
    methods: {
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
        removeTag: async function (tag) {
            if (!this.wp || !confirm(`Remove the tag "${tag}" from the selected wallpaper?`)) return;
            let error = await this.wp.removeTag(tag);
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
};