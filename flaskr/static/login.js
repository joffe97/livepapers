let loginC = {
    template: `
    <my-head pageId=5></my-head>
    <div class="container">
        <form class="okform" @submit.prevent @submit="onLogin()">
            <div class="alert alert-danger alert-dismissible fade" :class="[ failedLoginMessage !== '' ? 'show' : 'p-0 m-0 unclickable' ]">
                {{ failedLoginMessage }}
                 <button type="button" class="btn-close" @click="failedLoginMessage = ''"></button>
            </div>
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
            failedLoginMessage: ""
        }
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
                this.failedLoginMessage = "An unknown error occured.";
                return;
            }
            let isLoggedIn = await reply.text();
            console.log(isLoggedIn);
            return isLoggedIn;
        }
    }
}