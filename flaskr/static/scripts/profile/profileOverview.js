let profileOverviewC = {
    template: `
    <div v-if="user" class="mx-lg-3 row">
        <div class="col-4 col-lg-3">
            <img :src="imgurl" class="img-thumbnail" alt="Profile picture">
        </div>
        <div class="col-7 ms-lg-4">
            <div class="display-5 text-capitalize">{{user.username}}</div>
        </div>
    </div>
    `,
    data() {
        return {
            user: null,
            imgurl: null
        }
    },
    async created() {
        this.user = await store.getUser();
        this.imgurl = await this.user.getImgUrl();
    },
};