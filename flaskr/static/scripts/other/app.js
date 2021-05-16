let appC = {
    template: `
        <alert-tmp></alert-tmp>
        <my-head></my-head>
        <main class="overflow-auto vh-100" :style="currentStyle">
            <div class="nav-space"></div>
            <router-view></router-view>
        </main>
    `,
    computed: {
        currentStyle: function () {
            return store.getStyleStr()
        }
    }
}