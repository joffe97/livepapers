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
                    <tr><th>Date:</th><td>{{countUploaded}}</td></tr>
                    <tr><th>Views:</th><td>{{countStarred}}</td></tr>
                    <tr><th>Stars:</th><td>{{countReceivedStars}}</td></tr>
                    <tr><th>Resolution:</th><td>{{countReceivedStars}}</td></tr>
                    <tr><th>Tags:</th><td>{{countReceivedStars}}</td></tr>
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
            let uploaded = await user.getUploaded();
            let starred = await user.getStarred();
            this.user.wpUploaded = uploaded;
            this.user.wpStarred = starred;
        }
    },
    computed: {
        user: function () {
            return store.state.user
        },
        wpIds: function () {
            switch (this.mode) {
                case "uploaded":
                    console.log(this.user.wpUploaded)
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
    }
}