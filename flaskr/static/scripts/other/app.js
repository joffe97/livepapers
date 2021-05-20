let appC = {
    template: `
        <alert-tmp></alert-tmp>
        <main class="overflow-hidden" :style="currentStyle">
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
        if (this.isInited) return;
        store.state.isInited = true;
        store.state.isLoggedIn = await cmnIsLoggedIn();
    }
};