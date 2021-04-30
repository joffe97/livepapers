let wallpaperC = {
    props: ["wpIdStr"],
    template: `
    <my-head></my-head>
    <alert-tmp></alert-tmp>
    <div class="container">
        <div class="col">
            <div class="wallpaper-video row-12 m-auto">
                <div class="my-4">
                    <video class="unclickable p-0" autoplay loop muted>
                        <source :src="getVideoUrl()">
                    </video>
                </div>
                <div class="row-auto p-0">
                    <div class="btn-group m-0" role="group">
                        <div v-if="user" class="btn btn-primary rounded-0 rounded-top border-warning border-2 border-bottom-0" 
                        @click="toggleFavoriteWallpaper()">
                            <i class="bi text-warning" :class="[isFavorited ? 'bi-star-fill' : 'bi-star']"></i> Favorite
                        </div>
                        <a class="btn btn-primary rounded-0 rounded-top border-success border-2 border-bottom-0" :href="getVideoUrl()" :download="wpId">
                            <i class="bi bi-download text-success"></i> Download
                        </a>
                    </div>
                    <ul class="col-2 list-group p-0 rounded-0 rounded-bottom">
                        <li v-for="info in [getViewsStr(), getUploadDateStr(), getResolution()]"
                        class="list-group-item bg-light">
                            <strong>{{info}}</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            wpId: parseInt(this.wpIdStr),
            username: null,
            width: 1920,
            height: 1024,
            date: "15.04.2021",
            views: 512
        }
    },
    async created() {
        let user = await store.getUser();
        if (user) {
            await store.state.user.getStarred();
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
        }
    },
    methods: {
        getVideoUrl: function () {
            return cmnGetVideoUrl(this.wpId)
        },
        getResolution: function () {
            return this.width + " x " + this.height
        },
        getUploadDateStr: function () {
            return "Added 2 weeks ago";
        },
        getViewsStr: function () {
            return 512 + " views";
        },
        fillWallpaperData: function () {
            return;
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
                setAlert("Removed wallpaper from favorites.", "success");
            }
        }
    }
}