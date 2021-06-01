let profileOverviewC = {
    template: `
    <div>
        <div class="col-lg-10 mx-lg-auto row justify-content-lg-between align-content-around flex-column flex-lg-row">
            <div class="col-6 m-auto mb-2 col-lg-3">
                <img :src="imgurl" class="img-thumbnail" alt="Profile picture">
            </div>
            <div class="col-7 ms-lg-3">
                <div class="display-5 text-capitalize m-0 mb-3 text-lg-start text-center">{{user.username}}</div>
                <table class="table" :style="tableStyle">
                    <tbody>
                        <tr><th>Uploaded:</th><td>{{countUploaded}}</td></tr>
                        <tr><th>Favorites:</th><td>{{countStarred}}</td></tr>
                        <tr><th>Stars received:</th><td>{{countReceivedStars}}</td></tr>
                    </tbody>
                </table>
            </div>
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
            user.wpUploaded = uploaded;
            user.wpStarred = starred;
            user.receivedStars = rstars;
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
            let uploaded = this.user.wpUploaded;
            return uploaded ? uploaded.length : 0;
        },
        countStarred: function () {
            let starred = this.user.wpStarred;
            return starred ? starred.length : 0;
        },
        countReceivedStars: function () {
            return this.user.receivedStars;
        },
        tableStyle: function () {
            return store.getStyle().getTextBorderColorStr();
        },
    }
};