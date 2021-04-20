let headerC = {
    template: `   
    <nav class="position-fixed w-100 navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-3 p-0">
      <div class="container-fluid">
        <div class="navbar-brand"><img @click="goLatest()" id="logo" role="button" class="img-fluid w-50 unselectable" 
        src="static/assets/logo_l.png"></div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
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
                <hr class="dropdown-divider d-block d-lg-none">
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
                      :class="{show: userButtonHover, active: pageId == 4}" type="button" 
                      id="dropdownMenuButton1" data-bs-toggle="dropdown" v-bind:aria-expanded="userButtonHover">
                        Profile
                      </div>
                      <div class="dropdown-menu p-0 border-0" :class="{show: userButtonHover}">
                        <button class="btn btn-dark p-2 w-100 rounded-0 rounded-top" @click="goProfileOverview()">Overview</button>
                        <button class="btn btn-dark p-2 w-100 rounded-0" @click="goProfileWallpapers()">Wallpapers</button>
                        <button class="btn btn-dark p-2 w-100 rounded-0" @click="goProfileSettings()">Settings</button>
                        <button class="btn btn-danger p-2 w-100 rounded-0 rounded-bottom" @click="logout()">Log out</button>
                      </div>
                    </div>
                </div>
              </ul>
              <form class="nav-item d-flex p-lg-0 py-2">
                <input class="form-control me-2" type="search" placeholder="Search">
                <button class="btn btn-outline-success" type="submit">Search</button>
              </form>
          </div>
        </div>
      </div>
    </nav>
    <div style="height: 100px"></div>
    `,
    data() {
        return {
            userButtonHover: false
        }
    },
    computed: {
        isInited: function () {
            return store.state.isInited;
        },
        isLoggedIn: function () {
            return store.state.isLoggedIn;
        },
        pageId: function () {
            return store.state.pageId;
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
            return this.$router.push("/random/");
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
        goLogin: function () {
            return this.$router.push("/login/");
        },
        goRegister: function () {
            return this.$router.push("/register/");
        },
        logout: async function () {
            let reply = await fetch("/dologout");
            if (reply.status !== 200) return 0;
            let json = await reply.json();
            if (json.loggedIn) return 0;
            store.state.isLoggedIn = false;
            return 1;
        }
    },
    async created() {
        if (this.isInited) return;
        store.state.isInited = true;
        store.state.isLoggedIn = await cmnIsLoggedIn();
        console.log(this.isLoggedIn)
    }
}
