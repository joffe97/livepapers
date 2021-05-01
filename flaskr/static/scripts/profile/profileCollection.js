const COLLECTION_TYPES = ["uploaded", "favorites"];

let profileCollectionC = {
    props: ["cid"],
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
            <div class="position-absolute end-0 top-0 me-1 p-2 d-none d-lg-block col-auto">
                <div v-if="mode === 'uploaded'" class="btn-close btn-close-white"
                role="button" title="Delete wallpaper" @click="removeWallpaper(wpId)"></div>
                <i v-if="mode === 'favorites'" class="bi text-warning" 
                :class="[isUnfavorited(wpId) ? 'bi-star' : 'bi-star-fill']"
                role="button" title="Unfavorite" @click="toggleFavoriteWallpaper(wpId)"></i>
            </div>
            <div class="browse-img-square col-lg-5 m-auto btn p-0" @click="goWallpaper(wpId)">
                <figure class="figure m-0">
                    <img class="img-fluid" :src="getImageUrl(wpId)">
                </figure>
            </div>
            <table class="col table text-light my-auto mx-lg-5 my-lg-4 align-middle position-relative">
                <tbody>
                    <tr v-if="mode === 'favorites'" class="text-capitalize">
                        <th>Uploader:</th><td colspan="2">{{store.getWpUploaderStr(wpId)}}</td>
                    </tr>
                    <tr><th>Date:</th><td colspan="2">{{store.getWpDateStr(wpId)}}</td></tr>
                    <tr><th>Views:</th><td colspan="2">{{store.getWpViewsStr(wpId)}}</td></tr>
                    <tr><th>Stars:</th><td colspan="2">{{store.getWpStarsStr(wpId)}}</td></tr>
                    <tr><th>Resolution:</th><td colspan="2">{{store.getWpResolutionStr(wpId)}}</td></tr>
                    <tr><th>Tags:</th>
                        <td class="col-7">
                            <form class="col-12 btn-group btn-group-sm"
                            @submit.prevent @submit="removeTag(wpId)">
                                <select v-model="selectedTags[wpId]" class="form-select form-select-sm"
                                :class="{'rounded-0 rounded-start': mode === 'uploaded'}">
                                    <option v-if="!selectedTags[wpId]" value="">
                                        --- {{ getTagSelectDefault(wpId) }} ---
                                    </option>
                                    <option v-for="tag in store.getWpTags(wpId)" :value="tag">
                                        {{tag}}
                                    </option>
                                </select>
                                <button v-if="mode === 'uploaded'" type="submit" class="btn btn-dark rounded-0 rounded-end px-3" 
                                :class="{'disabled': !this.selectedTags[wpId]}">Del</button>
                            </form>
                        </td>
                        <td v-if="mode === 'uploaded'" class="col-2">
                            <button class="btn btn-outline-dark btn-sm col-12" data-bs-toggle="collapse"
                            :data-bs-target="'#collapseAdd' + wpId">New</button>
                        </td>
                    </tr>
                    <tr class="collapse position-absolute text-secondary col-12" :id="'collapseAdd' + wpId">
                        <td class="card card-body position-relative bg-dark in-front rounded-0 rounded-bottom" colspan="3">
                            <form @submit.prevent @submit="addTag(wpId)" class="row">
                                <div class="btn-group col">
                                    <input v-model="addTagInputs[wpId]" type="text" class="form-control" placeholder="Tagname">
                                    <button type="submit" class="btn btn-success" data-bs-toggle="collapse"
                                    :data-bs-target="'#collapseAdd' + wpId">Add</button>
                                </div>
                                <div class="btn btn-close me-3 my-auto" data-bs-toggle="collapse"
                                :data-bs-target="'#collapseAdd' + wpId"></div>
                            </form>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="btn col-auto mx-auto mt-2 d-lg-none" 
            :class="[mode === 'favorites' ? (isUnfavorited(wpId) ? 'btn-outline-warning' : 'btn-warning') : 'btn-outline-danger']" 
            @click="mode === 'favorites' ? toggleFavoriteWallpaper(wpId) : removeWallpaper(wpId)">
                {{mode === 'favorites' ? 'Unfavorite' : 'Delete wallpaper'}}
            </div>
            <hr class="mt-4">
        </div>
        <h5 v-if="!wpIds || wpIds.length === 0" class="mt-5 text-center">
            No wallpapers {{mode === 'uploaded' ? 'uploaded yet' : 'added to favorites'}}.
        </h5>
    </div>
    `,
    data() {
        return {
            mode: "",
            store: store,
            selectedTags: {},
            addTagInputs: {},
            favoritesStart: []
        }
    },
    async created() {
        if (COLLECTION_TYPES.includes(this.cid)) this.mode = this.cid;
        else this.mode = "uploaded";

        let user = await store.getUser();
        if (user) {
            await this.loadWallpapers();
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
                    return this.favoritesStart;
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
                    break;
                case "favorites":
                    wpIds = await this.user.getStarred();
                    this.favoritesStart = [...wpIds];
                    break;
            }
            await store.loadManyWallpaperFavorites(wpIds);
            await store.loadManyWallpaperTags(wpIds);
            await store.loadManyWallpapers(wpIds);
            for (let i = 0; i < wpIds.length; i++) {
                this.selectedTags[wpIds[i]] = "";
            }
        },
        isUnfavorited: function (wpId) {
            return !this.user.wpStarred.includes(wpId);
        },
        getTagSelectDefault: function (wpId) {
            let tags = store.getWpTags(wpId);
            if (!tags || tags.length === 0) return "No tags";
            if (this.mode === 'uploaded') {
                return "Select tag";
            } else {
                return "View tags";
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
            let wp = this.getWp(wpId);
            let tag = this.selectedTags[wpId];
            if (!wp || !tag || !confirm('Remove "' + tag + '" from tags?')) {
                setAlert("Couldn't remove tag from wallpaper.");
                return;
            }
            let error = await wp.removeTag(tag);
            if (error) {
                setAlert("Couldn't remove tag from wallpaper");
            } else {
                setAlert("Removed tag from wallpaper.", "success");
                this.selectedTags[wpId] = "";
            }

        },
        addTag: async function (wpId) {
            let wp = this.getWp(wpId);
            if (!wp) {
                setAlert("Couldn't add tag to wallpaper.");
                return;
            }
            let tag = this.addTagInputs[wpId];
            let error = await wp.addTag(tag);
            if (error) {
                setAlert("Couldn't add tag to wallpaper.");
            } else {
                setAlert("Added tag to wallpaper.", "success");
                setTimeout(()=>this.addTagInputs[wpId] = "", 500);
            }
        },
        removeWallpaper: async function (wpId) {
            if (!confirm("Delete wallpaper?")) {
                return;
            }
            let error = await store.removeWallpaper(wpId);
            if (error) {
                setAlert("Couldn't delete wallpaper.");
                return;
            }
            delete this.selectedTags[wpId];
            delete this.addTagInputs[wpId];
            setAlert("Successfully deleted wallpaper.", "success");
        },
        toggleFavoriteWallpaper: async function (wpId) {
            if (this.isUnfavorited(wpId)) {
                await this.favoriteWallpaper(wpId);
            } else {
                await this.unfavoriteWallpaper(wpId);
            }
        },
        favoriteWallpaper: async function (wpId) {
            let error = await this.user.addFavorite(wpId);
            if (error) {
                setAlert("Couldn't add to favorites.");
                return;
            }
            clearAlert();
        },
        unfavoriteWallpaper: async function (wpId) {
            let error = await this.user.removeFavorite(wpId);
            if (error) {
                setAlert("Couldn't remove from favorites.");
                return;
            }
            clearAlert();
        }
    }
};