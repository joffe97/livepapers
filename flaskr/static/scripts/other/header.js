// Component of the header
let headerC = {
    template: `   
    <nav class="position-fixed w-100 navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-3 p-0 navbar">
        <div class="container-fluid">
            <div class="d-flex flex-nowrap justify-content-between col-12 col-lg-auto">
                <div class="navbar-brand"><img @click="goLatest()" id="logo" role="button" class="img-fluid w-50 unselectable" 
                src="static/assets/logo_l.png" width="100" height="65"></div>
                <button class="navbar-toggler my-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        <div class="collapse navbar-collapse" id="navbarNav">
            <div class="d-flex justify-content-between flex-column-reverse flex-lg-row w-100 pb-2 pb-lg-0">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <div class="nav-link btn" :class="{active: pageId == 1}" @click="goLatest()">Latest</div>
                    </li>
                    <li class="nav-item px-lg-2">
                        <div class="nav-link btn" :class="{active: pageId == 2}" @click="goMostliked()">Most liked</div>
                    </li>
                    <li class="nav-item">
                        <div class="nav-link btn" :class="{active: pageId == 3}" @click="goRandom()">Random</div>
                    </li>
                    <hr class="dropdown-divider d-block d-lg-none bg-light">
                    <div class="vl d-lg-block d-none"></div>
                    <div v-if="!isLoggedIn" class="nav-item">
                        <div class="btn-group w-100">
                            <div 
                            class="nav-link btn w-50" 
                            :class="{active: pageId == 5}" 
                            v-on:click="goLogin()"
                            >Login</div>
                            <div 
                            class="nav-link btn w-50" 
                            :class="{active: pageId == 6}" 
                            v-on:click="goRegister()"
                            >Register</div>
                        </div>
                    </div>
                <div v-else class="nav-item"
                @mouseover="userButtonHover = true"
                @mouseleave="userButtonHover = false"
                @click="userButtonHover = !userButtonHover">
                    <div class="dropend">
                        <div class="btn nav-link dropdown-toggle" 
                        :class="{active: pageId == 4}" type="button" 
                        id="dropdownMenuButton1" data-bs-toggle="dropdown">
                          Profile
                        </div>
                        <transition name="from-upper-left">
                            <div v-show="userButtonHover" id="profile-menu-dropdown" class="dropdown-menu p-0 border-0 show">
                                <button class="btn btn-dark p-2 w-100 rounded-0 rounded-top" @click="goProfileOverview()">Overview</button>
                                <button class="btn btn-dark p-2 w-100 rounded-0" @click="goProfileCollection()">Collection</button>
                                <button class="btn btn-dark p-2 w-100 rounded-0" @click="goProfileUpload()">Upload</button>
                                <button class="btn btn-dark p-2 w-100 rounded-0" @click="goProfileSettings()">Settings</button>
                                <button class="btn btn-danger p-2 w-100 rounded-0 rounded-bottom" @click="logout()">Log out</button>
                            </div>
                        </transition>
                    </div>
                </div>
            </ul>
            <form class="nav-item d-flex p-lg-0 py-2 btn-group" @submit.prevent @submit="triggerAndGoSearch">
                <input v-model="state.filterSearch" class="form-control rounded-0 rounded-start" 
                type="search" placeholder="Search wallpaper...">
                <button class="btn btn-outline-success position-relative" type="submit">Search</button>
              </form>
          </div>
        </div>
      </div>
    </nav>
    `,
    data() {
        return {
            userButtonHover: false  // True if the profile menu is showing
        }
    },
    computed: {
        isLoggedIn: function () {
            return store.state.isLoggedIn;
        },
        pageId: function () {
            return store.state.pageId;
        },
        state: function () {
            return store.state
        }
    },
    methods: {
        goHome: function () {
            return this.$router.push("/#/");
        },
        goLatest: function () {
            return this.$router.push("/latest/");
        },
        goMostliked: function () {
            return this.$router.push("/mostliked/");
        },
        goRandom: function () {
            this.triggerRandomRefresh();
            return this.$router.push("/random/");
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
        goLogin: function () {
            return this.$router.push("/login/");
        },
        goRegister: function () {
            return this.$router.push("/register/");
        },

        // Refresh the browse page
        triggerRefresh: function () {
            store.state.filterSearchTrigger = !store.state.filterSearchTrigger;
        },

        // Refresh the browse page if the sort mode is random
        triggerRandomRefresh: function () {
            if (this.pageId === 3) this.triggerRefresh();
        },

        // Refresh browse page if currently there. Else go to browse page with latest upload sorting.
        triggerAndGoSearch: function () {
            if (this.pageId === 1 || this.pageId === 2 || this.pageId === 3) {
                this.triggerRefresh();
                return;
            }
            return this.goLatest();
        },

        // Log out and go to browse page
        logout: async function () {
            let reply = await fetch("/dologout");
            if (reply.status !== 200) return 0;
            let json = await reply.json();
            if (json.loggedIn) return 0;
            store.state.isLoggedIn = false;
            store.state.user = null;
            setAlert("You have been logged out.", "warning");
            return this.triggerAndGoSearch();
        }
    },
};
