// Component of profile page. Only visible if logged in.
let profileC = {
    props: ["pid", "cid"],
    template: `
    <div class="container profile-page" v-if="user" @touchstart="startTouch" @touchmove="moveTouch">
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
        <transition :name="componentSlideName">
            <profile-overview v-if="profilePageId == 1"></profile-overview>
            <profile-collection v-bind:cid="cid" v-else-if="profilePageId == 2"></profile-collection>
            <profile-upload v-else-if="profilePageId == 3"></profile-upload>
            <profile-settings v-else-if="profilePageId == 4"></profile-settings>
            <profile-admin v-else-if="profilePageId == 5 && isAnyAdmin"></profile-admin>
        </transition>
    </div>
    `,
    data() {
        return {
            profilePageId: undefined,   // Id of the current profile sub page
            componentSlideName: "NA",   // Name of component transition
            startTouchPos: null,        // Starting position of mobile touch    (for touch screens)
            lockSwipe: false            // True if swiping is locked            (for touch screens)
        };
    },
    async created() {
        store.state.pageId = 4;
        if (!await store.getUser()) this.goBack();  // Goes back to previous if there is no user
        else this.updateProfilePageId();
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    methods: {
        // Updates profile page id, based on the pid prop / url
        updateProfilePageId: function () {
            let pageId;
            switch (this.pid) {
                case "collection":
                    pageId = 2;
                    break;
                case "upload":
                    pageId = 3;
                    break;
                case "settings":
                    pageId = 4;
                    break;
                case "admin":
                    if (this.user.isAnyAdmin()) {
                        pageId = 5;
                        break;
                    }
                default:
                    pageId = 1;
            }
            if (this.profilePageId !== undefined && this.profilePageId !== pageId) {
                this.componentSlideName = pageId > this.profilePageId ? "component-slide-left" : "component-slide-right";
            }
            this.profilePageId = pageId;
        },
        goBack: function () {
            return this.$router.go(-1);
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

        // Store the position of the starting touch position (for touch screens)
        startTouch: function (event) {
            this.startTouchPos = event.touches[0];
        },

        // Handles any moving touch (for touch screens). Changes sub profile page in the direction of the swipe.
        moveTouch: function (event) {
            if (this.lockSwipe || !this.startTouchPos) return;
            this.lockSwipe = true
            let touch = event.touches[0];
            let diffX = touch.clientX - this.startTouchPos.clientX;     // Distance swiped in x direction
            let diffY = touch.clientY - this.startTouchPos.clientY;     // Distance swiped in y direction

            // The shortest of device height and width
            let clientMinLen = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight);

            if (Math.abs(diffX) < Math.abs(diffY) || Math.abs(diffX) < clientMinLen / 5) {  // Returns if vertical swipe
                this.lockSwipe = false;
                return;
            }
            let swipeDirection = (diffX < 0) * 2 - 1;   // Left (1) or right (-1) direction
            let newPageId = this.profilePageId + swipeDirection;    // Id of new calculated page id

            // Finds function for going to new sub profile page
            let goFunc = null;
            switch (newPageId) {
                case 1:
                    goFunc = this.goProfileOverview;
                    break;
                case 2:
                    goFunc = this.goProfileCollection;
                    break;
                case 3:
                    goFunc = this.goProfileUpload;
                    break;
                case 4:
                    goFunc = this.goProfileSettings;
                    break;
                case 5:
                    if (this.user.isAnyAdmin()) {
                        goFunc = this.goProfileAdmin;
                        break;
                    }
            }

            // Go to new sub profile page, if available
            if (goFunc) {
                setTimeout(()=>this.lockSwipe=false, 100);  // Unlocks swiping after 100ms
                this.startTouchPos = null;
                return goFunc();
            } else {
                this.lockSwipe = false;
                return;
            }
        }
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