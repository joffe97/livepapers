/* Main component containing the entire application.
   The current vue route is displayed here. Style and header is also added here.
 */
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
        // Css for current style
        currentStyle: function () {
            return store.getStyleStr()
        }
    },
    // Initialize the application it is not done yet.
    async beforeCreate() {
        if (this.isInited) return;
        store.state.isInited = true;
        store.state.isLoggedIn = await cmnIsLoggedIn();     // Checks if the user is logged in
    }
};