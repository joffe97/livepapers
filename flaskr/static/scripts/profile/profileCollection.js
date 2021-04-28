let profileCollectionC = {
    template: `
    <alert-tmp></alert-tmp>
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
            <div class="position-absolute end-0 top-0 me-1 p-2 btn-close btn-close-white d-none d-lg-block" 
            role="button" title="Delete wallpaper" @click="removeWallpaper(wpId)"></div>
            <div class="browse-img-square col-lg-5 m-auto btn p-0" @click="goWallpaper(wpId)">
                <figure class="figure m-0">
                    <img class="img-fluid" :src="getImageUrl(wpId)">
                </figure>
            </div>
            <table class="col table text-light my-auto mx-lg-5 my-lg-4 align-middle position-relative">
                <tbody>
                    <tr><th>Date:</th><td colspan="2">{{store.getWpDateStr(wpId)}}</td></tr>
                    <tr><th>Views:</th><td colspan="2">{{store.getWpViewsStr(wpId)}}</td></tr>
                    <tr><th>Stars:</th><td colspan="2">{{store.getWpStarsStr(wpId)}}</td></tr>
                    <tr><th>Resolution:</th><td colspan="2">{{store.getWpResolutionStr(wpId)}}</td></tr>
                    <tr><th>Tags:</th>
                        <td class="col-7">
                            <div class="btn-group btn-group-sm col-12">
                                <select v-model="selectedTags[wpId]" class="form-select form-select-sm rounded-0 rounded-start">
                                    <option v-if="!selectedTags[wpId]" value="">--- Select tag ---</option>
                                    <option v-for="tag in store.getWpTags(wpId)" :value="tag">
                                        {{tag}}
                                    </option>
                                </select>
                                <div class="btn btn-dark rounded-0 rounded-end px-3" 
                                :class="{'disabled': !this.selectedTags[wpId]}" @click="removeTag(wpId)">Del</div>
                            </div>
                        </td>
                        <td class="col-2">
                            <button class="btn btn-outline-dark btn-sm col-12" data-bs-toggle="collapse"
                            :data-bs-target="'#collapseAdd' + wpId">New</button>
                        </td>
                    </tr>
                    <tr class="collapse position-absolute text-secondary col-12" :id="'collapseAdd' + wpId">
                        <td class="card card-body position-relative bg-dark in-front rounded-0 rounded-bottom" colspan="3">
                            <form @submit.prevent @submit="" class="row">
                                <div class="btn-group col">
                                    <input type="text" class="form-control" placeholder="Tagname">
                                    <div class="btn btn-success">Add</div>
                                </div>
                                <div class="btn btn-close me-3 my-auto" data-bs-toggle="collapse"
                                :data-bs-target="'#collapseAdd' + wpId"></div>
                            </form>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="btn btn-outline-danger col-auto mx-auto mt-2 d-lg-none" @click="removeWallpaper(wpId)">Delete wallpaper</div>
            <hr class="mt-4">
        </div>
    </div>
    `,
    data() {
        return {
            mode: "uploaded",
            store: store,
            selectedTags: {},
            addTagInputs: {},
            selectedEditTag: null
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
            for (let i = 0; i < wpIds.length; i++) {
                this.selectedTags[wpIds[i]] = "";
            }
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
        removeTag: async function (wpId) {
            let tag = this.selectedTags[wpId];
            if (!tag || !confirm('Remove "' + tag + '" from tags?')) return;
            let reply = await fetch(

            )
        },
        removeWallpaper: function (wpId) {
            return
        }
    }
};