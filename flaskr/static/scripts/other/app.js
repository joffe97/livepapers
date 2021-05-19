let appC = {
    template: `
        <alert-tmp></alert-tmp>
        <main :style="currentStyle">
            <my-head></my-head>
            <div class="nav-space"></div>
            <router-view></router-view>
        </main>
    `,
    computed: {
        currentStyle: function () {
            return store.getStyleStr()
        }
    },
    async beforeCreate() {
        console.log(1234)
        if (this.isInited) return;
        store.state.isInited = true;
        let user = await store.getUser();
        if (user) {
            store.state.isLoggedIn = true;
            store.state.user = user;
        }
    }
}