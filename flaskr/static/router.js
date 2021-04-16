const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
      // dynamic segments start with a colon
      { path: '/', component: browseC },
      { path: '/wallpaper/:wpId', component: wallpaperC, props: true },
      { path: '/profile/', component: profileC }
    ]
  })
