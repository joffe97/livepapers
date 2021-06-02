let registerC = {
    template: `
    <div class="container">
        <form class="okform d-flex flex-column justify-content-center" @submit.prevent @submit="onRegister()">
            <div class="display-3 mb-4 text-center">Register now!</div>
            <alert-cross></alert-cross>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input v-model="username" type="username" class="form-control" id="username">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" id="password">
            </div>
            <div class="mb-3">
                <label for="pw_verify" class="form-label">Verify password</label>
                <input v-model="pwVerify" type="password" class="form-control" id="pw_verify">
            </div>
            <button type="submit" class="btn btn-primary col-10 col-lg-6 mx-auto">Register</button>
        </form>    
    </div>
    `,
    data() {
        return {
            username: "",
            password: "",
            pwVerify: "",
            succRegister: false
        }
    },
    created() {
        store.state.pageId = 6;
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    unmounted() {
        if (this.succRegister) setAlert("Successfully registered!", "success");
    },
    methods: {
        goProfileOverview: function () {
            return this.$router.push("/profile/overview");
        },
        onRegister: async function () {
            let reply = await fetch("/doregister", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "username": this.username,
                    "password": this.password,
                    "pw_verify": this.pwVerify
                })
            });
            if (reply.status !== 200) {
                setAlert("An unknown error occured.", "danger", "cross");
                return 0;
            }
            let json = await reply.json();
            if (json.status === "error" || !json.loggedIn) {
                setAlert(json.msg ? json.msg : "An unknown error occured.", "danger", "cross");
                return 0;
            }
            store.state.isLoggedIn = true;
            this.succRegister = true;
            return this.goProfileOverview();
        }
    }
}