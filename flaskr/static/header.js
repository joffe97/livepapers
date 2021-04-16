let headerC = {
    props: ["pageId"],
    template: `   
    <nav class="position-fixed w-100 navbar navbar-expand-lg navbar-dark bg-primary mb-3 p-0">
      <div class="container-fluid">
        <a class="navbar-brand" href="#"><img id="logo" class="img-fluid w-50" src="static/assets/logo_l.png"></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="d-flex justify-content-between flex-column-reverse flex-lg-row w-100 pb-2 pb-lg-0">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <div class="nav-link btn" :class="{active: this.pageId == 1}" href="#">Latest</div>
                </li>
                <li class="nav-item px-lg-2">
                  <div class="nav-link btn" :class="{active: this.pageId == 2}" href="#">Most liked</div>
                </li>
                <li class="nav-item">
                  <div class="nav-link btn" :class="{active: this.pageId == 3}" href="#">Random</div>
                </li>
                <hr class="dropdown-divider d-block d-lg-none">
                <div class="vl d-lg-block d-none"></div>
                <li v-if="store.state.isLoggedIn == 1" class="nav-item">
                  <div 
                  class="nav-link btn" 
                  :class="{active: this.pageId == 4}" 
                  v-on:click="goLogin()"
                  >Log in</div>
                </li>
                <li v-else class="nav-item"
                @mouseover="userButtonHover = true"
                @mouseleave="userButtonHover = false"
                >
                    <div class="dropend">
                      <div class="btn nav-link dropdown-toggle" :class="{show: userButtonHover, active: this.pageId == 4}" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" v-bind:aria-expanded="userButtonHover">
                        Profile
                      </div>
                      <div class="dropdown-menu p-0 border-0" :class="{show: userButtonHover}" aria-labelledby="dropdownMenuButton1">
                        <button class="dropdown-item p-2" @click="goProfile()">Overview</button>
                        <button class="btn btn-danger p-2 w-100 rounded-0 rounded-bottom" href="#">Log out</button>
                      </div>
                    </div>
                </li>
              </ul>
              <form class="nav-item d-flex p-lg-0 py-2">
                <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
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
            store: store,
            userButtonHover: false
        }
    },
    methods: {
        goHome: function () {
            return this.$router.push("/#/");
        },
        goProfile: function () {
            return this.$router.push("/profile/");
        },
        goLogin: function () {
            return this.$router.push("/#/");
        }
    }
}
