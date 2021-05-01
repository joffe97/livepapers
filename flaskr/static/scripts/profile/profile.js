let profileC = {
    props: ["pid"],
    template: `
    <my-head></my-head>
    <div class="container" v-if="user">
        <div class="btn-group col-12 mb-lg-5 mb-4 bg-dark rounded overflow-auto row-auto">
            <div class="btn btn-outline-primary col-2" 
            :class="{ active: profilePageId == 1 }" @click="goProfileOverview">
                <i class="bi bi-person-fill d-sm-none"></i><span class="d-sm-inline d-none">Overview</span>
            </div>
            <div class="btn btn-outline-primary col-2" 
            :class="{ active: profilePageId == 2 }" @click="goProfileCollection">
                <i class="bi bi-collection-fill d-sm-none"></i><span class="d-sm-inline d-none">Collection</span>
            </div>
            <div class="btn btn-outline-primary col-2" 
            :class="{ active: profilePageId == 3 }" @click="goProfileUpload">
                <i class="bi bi-upload d-sm-none"></i><span class="d-sm-inline d-none">Upload</span>
            </div>
            <div class="btn btn-outline-primary col-2" 
            :class="{ active: profilePageId == 4 }" @click="goProfileSettings">
                <i class="bi bi-gear-fill d-sm-none"></i><span class="d-sm-inline d-none">Settings</span>
            </div>
            <div v-if="isAnyAdmin" class="btn btn-outline-primary col-2" 
            :class="{ active: profilePageId == 5 }" @click="goProfileAdmin">
                <i class="bi bi-command d-sm-none"></i><span class="d-sm-inline d-none">Admin</span>
            </div>
        </div>
        <profile-overview v-if="profilePageId == 1"></profile-overview>
        <profile-collection v-if="profilePageId == 2"></profile-collection>
        <profile-upload v-if="profilePageId == 3"></profile-upload>
        <profile-settings v-if="profilePageId == 4"></profile-settings>
        <profile-admin v-if="profilePageId == 5 && isAnyAdmin"></profile-admin>
    </div>
    `,
    data() {
        return {
            profilePageId: 1
        };
    },
    async created() {
        store.state.pageId = 4;
        this.updateProfilePageId();
        await store.getUser();
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    methods: {
        updateProfilePageId: function () {
            console.log(this.pid + " | " + this.cid)
            switch (this.pid) {
                case "collection":
                    this.profilePageId = 2;
                    break;
                case "upload":
                    this.profilePageId = 3;
                    break;
                case "settings":
                    this.profilePageId = 4;
                    break;
                case "admin":
                    this.profilePageId = 5;
                    break;
                default:
                    this.profilePageId = 1;
            }
        },
        goProfileOverview: function () {
            return this.$router.push("/profile/overview");
        },
        goProfileCollection: function () {
            return this.$router.push("/profile/collection");
        },
        goProfileUpload: function () {
            return this.$router.push("/profile/upload");
        },
        goProfileSettings: function () {
            return this.$router.push("/profile/settings");
        },
        goProfileAdmin: function () {
            return this.$router.push("/profile/admin");
        },
    },
    computed: {
        user: function () {
            return store.state.user;
        },
        isAnyAdmin: function () {
            return this.user.isAnyAdmin();
        }
    },
    watch: {
        pid: function () {
            this.updateProfilePageId();
        }
    }
}