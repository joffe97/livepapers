const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/latest' },                                   // Redirect to browse page
        { path: '/:browseId', component: browseC, props: true },              // Browse pages
        { path: '/login/', component: loginC },                               // Login page
        { path: '/register/', component: registerC },                         // Registration page
        { path: '/wallpaper/:wpIdStr', component: wallpaperC, props: true },  // Wallpaper page
        { path: '/profile/:pid', component: profileC, props: true},           // Profile pages
        { path: '/profile/:pid/:cid', component: profileC, props: true}       // Profile collection pages
    ]
});
