let registerC = {
    template: `
    <my-head></my-head>
    <div class="container">
        <form class="okform">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input v-model="username" type="username" class="form-control" id="username">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" id="password">
            </div>
            <div class="mb-3">
                <label for="pw_verified" class="form-label">Verify password</label>
                <input v-model="pw_verified" type="password" class="form-control" id="pw_verified">
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
        </form>    
    </div>
    `,
    data() {
        return {
            store: store,
            username: "",
            password: "",
            pw_verified: "",
            failedLoginMessage: ""
        }
    },
    created() {
        store.state.pageId = 6;
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    methods: {
        onRegister: async function () {
            let reply = await fetch("/doregister", {
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
                this.failedLoginMessage = "An unknown error occured.";
                return 0;
            }
        }
    }
}