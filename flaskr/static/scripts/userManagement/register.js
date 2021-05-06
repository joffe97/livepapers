let registerC = {
    template: `
    <div class="container">
        <form class="okform" @submit.prevent @submit="onRegister()">
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
            <button type="submit" class="btn btn-primary">Register</button>
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
            let message = await reply.json();
            if (message.status === "error") {
                setAlert(message.msg, "danger", "cross");
                return 0;
            }
            store.state.isLoggedIn = message.loggedIn;
            this.succRegister = true;
            return this.$router.go(-1);
        }
    }
}