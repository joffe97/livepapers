// Component for logging in
let loginC = {
    template: `
    <div class="container">
        <form class="okform d-flex flex-column justify-content-center" @submit.prevent @submit="onLogin()">
            <div class="display-3 mb-4 text-center">Welcome back!</div>
            <alert-cross></alert-cross>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input v-model="username" type="username" class="form-control" id="username">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" id="password">
            </div>
            <button type="submit" class="btn btn-primary col-10 col-lg-6 mx-auto">Log in</button>
        </form>    
    </div>`,
    data() {
        return {
            username: "",       // Username input
            password: "",       // Password input
            succLogin: false    // True if successful login
        }
    },
    created() {
        store.state.pageId = 5;     // Set pageId to login
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    unmounted() {
        // Adds alert if successfully logged in when leaving page
        if (this.succLogin) setAlert("Successfully logged in!", "success");
    },
    methods: {
        goProfileOverview: function () {
            return this.$router.push("/profile/overview");
        },

        /* Tries to log in with the given username and password.
           Creates user object and goes to profile overview if successful.
         */
        onLogin: async function () {
            let reply = await fetch("/dologin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "username": this.username,
                    "password": this.password
                })
            });
            if (reply.status !== 200) {
                setAlert("An internal server error occured.", "danger", "cross");
                return 0;
            }
            let json = await reply.json();
            if (json.status !== "success") {
                setAlert((json.msg ? json.msg : "An unknown error occured.") + " Please try again.", "danger", "cross");
                return 0;
            }
            let style = json.style ? JSON.parse(json.style) : null;
            let img = json.img ? json.img : null;
            let filters = json.filters ? JSON.parse(json.filters) : null;
            store.state.isLoggedIn = this.succLogin = true;
            store.state.user = new User(json.username, json.type, style, img, filters);
            return this.goProfileOverview();
        }
    }
};