let profileOverviewC = {
    template: `
    <div class="mx-lg-3 row justify-content-lg-between align-content-around flex-column flex-lg-row">
        <div class="col-6 m-auto mb-2 col-lg-3">
            <img :src="imgurl" class="img-thumbnail" alt="Profile picture">
        </div>
        <div class="col-7 ms-lg-4">
            <div class="display-5 text-capitalize m-0 mb-3 text-lg-start text-center">{{user.username}}</div>
            <table class="table text-light">
                <tbody>
                    <tr><th>Uploaded:</th><td>{{countUploaded}}</td></tr>
                    <tr><th>Favorites:</th><td>{{countStarred}}</td></tr>
                    <tr><th>Stars received:</th><td>{{countReceivedStars}}</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    `,
    data() {
        return {
        }
    },
    async created() {
        let user = await store.getUser();
        if (user) {
            let uploaded = await user.getUploaded();
            let starred = await user.getStarred();
            let rstars = await user.getReceivedStars();
            this.user.wpUploaded = uploaded;
            this.user.wpStarred = starred;
            this.user.receivedStars = rstars;
        }
    },
    computed: {
        user: function () {
            return store.state.user;
        },
        imgurl: function () {
            return this.user.getImgUrl();
        },
        countUploaded: function () {
            return this.user.wpUploaded.length;
        },
        countStarred: function () {
            return this.user.wpStarred.length;
        },
        countReceivedStars: function () {
            return this.user.receivedStars;
        }
    }
};