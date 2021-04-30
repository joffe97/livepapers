const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
      // dynamic segments start with a colon
      { path: '/', redirect: '/latest' },
      { path: '/:browseId', component: browseC, props: true },
      { path: '/login/', component: loginC },
      { path: '/register/', component: registerC },
      { path: '/wallpaper/:wpIdStr', component: wallpaperC, props: true },
      //{ path: '/profile/', redirect: '/profile/overview' },
      { path: '/profile/:pid', component: profileC, props: true}
    ]
  });
