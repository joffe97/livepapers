let wallpaperC = {
    props: ["wpIdStr"],
    template: `
    <my-head></my-head>
    <alert-tmp></alert-tmp>
    <div class="container">
        <div class="col">
            <div class="wallpaper-video row-12 m-auto">
                <div class="my-4">
                    <video class="unclickable p-0 wallpaper-page-video" autoplay loop muted>
                        <source :src="getVideoUrl()">
                    </video>
                </div>
                <div class="row-auto p-0">
                    <div class="btn-group m-0" role="group">
                        <div v-if="user" class="me-1 btn rounded-0 rounded-top border-warning border-2 border-bottom-0" 
                        @mouseover="hoverFavorite = true" @mouseleave="hoverFavorite = false" 
                        :class="[hoverFavorite ? 'btn-warning' : 'btn-primary text-warning']" 
                        @click="toggleFavoriteWallpaper()">
                            <i class="bi" :class="[isFavorited ? 'bi-star-fill' : 'bi-star']"></i> Favorite
                        </div>
                        <a class="btn btn-primary rounded-0 rounded-top border-success border-2 border-bottom-0" 
                        @mouseover="hoverUpdate = true" @mouseleave="hoverUpdate = false" 
                        :class="[hoverUpdate ? 'btn-success' : 'btn-primary text-success'], {'ms-1': user}" 
                        :href="getVideoUrl()" :download="wpId">
                            <i class="bi bi-download"></i> Download
                        </a>
                    </div>
                    <ul class="col-2 list-group list-group-horizontal-lg p-0 rounded-0 rounded-bottom">
                        <li class="list-group-item bg-light">{{viewsStr}}</li>
                        <li class="list-group-item bg-light">{{timeSinceUploadStr}}</li>
                        <li class="list-group-item bg-light">{{resolutionStr}}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            hoverUpdate: false,
            hoverFavorite: false,
            wpId: parseInt(this.wpIdStr),
        }
    },
    async created() {
        let user = await store.getUser();
        if (user) {
            await store.state.user.getStarred();
        }
        let wp = await store.loadWallpaper(this.wpId);
        if (wp) {
            await wp.getLikes();
            await wp.incrementViews();
        }
    },
    computed: {
        user: function () {
            return store.state.user;
        },
        favorites: function () {
            return this.user.wpStarred;
        },
        isFavorited: function () {
            return this.user && this.favorites && this.favorites.includes(this.wpId);
        },
        wp: function () {
            return store.state.wallpapers.dict[this.wpId];
        },
        timeSinceUploadStr: function () {
            return this.wp ? this.wp.getTimeSinceString() + " ago" : "";
        },
        resolutionStr: function () {
            return store.getWpResolutionStr(this.wpId);
        },
        viewsStr: function () {
            return store.getWpViewsStr(this.wpId) + " views";
        }
    },
    methods: {
        getVideoUrl: function () {
            return cmnGetVideoUrl(this.wpId)
        },
        toggleFavoriteWallpaper: async function () {
            if (this.isFavorited) {
                await this.unfavoriteWallpaper();
            } else {
                await this.favoriteWallpaper();
            }
        },
        favoriteWallpaper: async function () {
            let error = await this.user.addFavorite(this.wpId);
            if (error) {
                setAlert("Couldn't add to favorites.");
            } else {
                setAlert("Added wallpaper to favorites.", "success");
            }
        },
        unfavoriteWallpaper: async function () {
            let error = await this.user.removeFavorite(this.wpId);
            if (error) {
                setAlert("Couldn't remove from favorites.");
            } else {
                setAlert("Removed wallpaper from favorites.", "warning");
            }
        }
    }
}