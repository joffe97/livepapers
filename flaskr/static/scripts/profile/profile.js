let profileC = {
    props: ["pid"],
    template: `
    <my-head></my-head>
    <div class="container">
        <div class="display-2">Profile</div>
        <div class="btn-group col-12 my-4 bg-dark rounded">
          <div class="btn btn-outline-primary" :class="{ active: profilePageId == 1 }" @click="goProfileOverview">Overview</div>
          <div class="btn btn-outline-primary" :class="{ active: profilePageId == 2 }" @click="goProfileWallpapers">Wallpapers</div>
          <div class="btn btn-outline-primary" :class="{ active: profilePageId == 3 }" @click="goProfileSettings">Settings</div>
        </div>
        <profile-overview v-if="profilePageId == 1"></profile-overview>
        <profile-wallpapers v-if="profilePageId == 2"></profile-wallpapers>
        <profile-settings v-if="profilePageId == 3"></profile-settings>
    </div>
    `,
    data() {
        return {
            profilePageId: 1
        };
    },
    created() {
        store.state.pageId = 4;
        this.updateProfilePageId();
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    methods: {
        updateProfilePageId: function () {
            switch (this.pid) {
                case "wallpapers":
                    this.profilePageId = 2;
                    break;
                case "settings":
                    this.profilePageId = 3;
                    break;
                default:
                    this.profilePageId = 1;
            }
        },
        goProfileOverview: function () {
            return this.$router.push("/profile/overview");
        },
        goProfileWallpapers: function () {
            return this.$router.push("/profile/wallpapers");
        },
        goProfileSettings: function () {
            return this.$router.push("/profile/settings");
        },
    },
    watch: {
        pid: function () {
            this.updateProfilePageId();
        }
    }
}