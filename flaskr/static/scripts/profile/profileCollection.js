let profileCollectionC = {
    template: `
    <div class="col col-lg-11 mx-lg-auto">
        <div class="justify-content-between position-relative mx-lg-2">
            <div class="display-5 d-inline-block">Collection</div>
            <div class="d-inline-block position-absolute end-0 bottom-0 col-lg-3 col-5">
                <select class="form-select col-auto" v-model="mode">
                    <option value="uploaded" selected>Uploaded</option>
                    <option value="favorites">Favorites</option>
                </select>
            </div>
        </div>
        <hr>
        <div v-for="wpId in wpIds" class="row mx-0 justify-content-between flex-lg-row flex-column position-relative">
            <div class="position-absolute end-0 top-0">
                x
            </div>
            <div class="browse-img-square col-lg-5 m-auto btn" @click="goWallpaper(wpId)">
                <figure class="figure m-0">
                    <img class="img-fluid" :src="getImageUrl(wpId)">
                </figure>
            </div>
            <table class="col table text-light my-auto mx-lg-5 my-lg-4 align-middle">
                <tbody>
                    <tr><th>Date:</th><td colspan="2">{{store.getWpDateStr(wpId)}}</td></tr>
                    <tr><th>Views:</th><td colspan="2">{{store.getWpViewsStr(wpId)}}</td></tr>
                    <tr><th>Stars:</th><td colspan="2">{{store.getWpStarsStr(wpId)}}</td></tr>
                    <tr><th>Resolution:</th><td colspan="2">{{store.getWpResolutionStr(wpId)}}</td></tr>
                    <tr><th>Tags:</th>
                        <td class="col-5">
                            <select class="form-select form-select-sm">
                                <option>--- Select tag ---</option>
                                <option v-for="tag in store.getWpTags(wpId)" value="tag">
                                    {{tag}}
                                </option>
                            </select>
                        </td>
                        <td class="position-relative col-3">
                            <div class="btn-group mx-auto" role="group">
                                <div class="btn btn-danger w-50 px-3">-</div>
                                <div class="btn btn-success w-50 px-3">+</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <hr class="mt-3">
        </div>
    </div>
    `,
    data() {
        return {
            mode: "uploaded",
            store: store
        }
    },
    async created() {
        let user = await store.getUser();
        if (user) {
            this.loadWallpapers();
        }
    },
    watch: {
        mode: async function () {
            await this.loadWallpapers();
        }
    },
    computed: {
        user: function () {
            return store.state.user;
        },
        wpIds: function () {
            switch (this.mode) {
                case "uploaded":
                    return this.user.wpUploaded;
                case "favorites":
                    return this.user.wpStarred;
                default:
                    return [];
            }
        }
    },
    methods: {
        loadWallpapers: async function() {
            let wpIds = [];
            switch (this.mode) {
                case "uploaded":
                    wpIds = await this.user.getUploaded();
                    await store.loadManyWallpaperFavorites(wpIds);
                    await store.loadManyWallpaperTags(wpIds);
                    break;
                case "favorites":
                    wpIds = await this.user.getStarred();
                    break;
            }
            await store.loadManyWallpapers(wpIds);
        },
        getImageUrl: function (wpId) {
            return cmnGetImageUrl(wpId);
        },
        goWallpaper: function(wpId) {
            this.$router.push("/wallpaper/" + wpId);
        },
        getWp: function (wpId) {
            return store.getWallpaper(wpId);
        },
    }
};