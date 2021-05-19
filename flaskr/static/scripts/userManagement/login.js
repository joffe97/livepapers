let loginC = {
    template: `
    <div class="container">
        <form class="okform" @submit.prevent @submit="onLogin()">
            <alert-cross></alert-cross>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input v-model="username" type="username" class="form-control" id="username">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" id="password">
            </div>
            <button type="submit" class="btn btn-primary">Log in</button>
        </form>    
    </div>`,
    data() {
        return {
            username: "",
            password: "",
            succLogin: false
        }
    },
    created() {
        store.state.pageId = 5;
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    unmounted() {
        if (this.succLogin) setAlert("Successfully logged in!", "success");
    },
    methods: {
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
                setAlert("An unknown error occured.", "danger", "cross");
                return 0;
            }
            let json = await reply.json();
            if (!json.username || !json.type) {
                setAlert("Wrong username or password. Try again.", "danger", "cross");
                return 0;
            }
            let style = json.style ? JSON.parse(json.style) : null;
            store.state.isLoggedIn = this.succLogin = true;
            store.state.user = new User(json.username, json.type, style);
            return this.$router.go(-1);
        }
    }
};