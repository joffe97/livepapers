const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
      // dynamic segments start with a colon
      { path: '/', component: browseC },
      { path: '/latest/', component: browseC },
      { path: '/mostliked/', component: browseC },
      { path: '/random/', component: browseC },
      { path: '/login/', component: loginC },
      { path: '/register/', component: registerC },
      { path: '/wallpaper/:wpId', component: wallpaperC, props: true },
      { path: '/profile/', component: profileC }
    ]
  })
