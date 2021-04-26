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
        <div v-for="wpId in wpIds" class="row mx-0 justify-content-between flex-lg-row flex-column">
            <div class="browse-img-square col-lg-5 m-auto btn" @click="goWallpaper(wpId)">
                <figure class="figure m-0">
                    <img class="img-fluid" :src="getImageUrl(wpId)">
                </figure>
            </div>
            <table class="col table text-light my-auto mx-lg-5 my-lg-4">
                <tbody>
                    <tr><th>Date:</th><td>{{getWpDate(wpId)}}</td></tr>
                    <tr><th>Views:</th><td>{{}}</td></tr>
                    <tr><th>Stars:</th><td>{{}}</td></tr>
                    <tr><th>Resolution:</th><td>{{}}</td></tr>
                    <tr><th>Tags:</th><td>{{}}</td></tr>
                </tbody>
            </table>
            <hr class="mt-3">
        </div>
    </div>
    `,
    data() {
        return {
            mode: "uploaded"
        }
    },
    async created() {
        let user = await store.getUser();
        if (user) {
            let wpIds = await user.getUploaded();
            await store.loadManyWallpapers(wpIds);
        }
    },
    computed: {
        user: function () {
            return store.state.user
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
        getImageUrl: function (wpId) {
            return cmnGetImageUrl(wpId);
        },
        goWallpaper: function(wpId) {
            this.$router.push("/wallpaper/" + wpId);
        },
        getWpDate: function (wpId) {
            return store.state.wallpapers.dict[wpId].date;
        }
    }
}