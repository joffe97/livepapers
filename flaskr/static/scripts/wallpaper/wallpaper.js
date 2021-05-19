let wallpaperC = {
    props: ["wpIdStr"],
    template: `
    <div class="container">
        <div class="col">
            <div class="row-12 m-auto">
                <div class="wallpaper-video mb-lg-4 mb-2">
                    <video class="unclickable p-0 wallpaper-page-video" autoplay loop muted>
                        <source :src="getVideoUrl()">
                    </video>
                </div>
                <div class="btn-group m-0 mb-2 col-12" role="group">
                    <div v-if="user" class="me-1 py-lg-2 btn border-warning border-2" 
                    @mouseover="hoverFavorite = true" @mouseleave="hoverFavorite = false" 
                    :class="[hoverFavorite ? 'btn-warning' : 'btn-primary text-warning'], {'col-6': user}" 
                    @click="toggleFavoriteWallpaper()">
                        <i class="bi" :class="[isFavorited ? 'bi-star-fill' : 'bi-star']"></i> 
                        {{isFavorited ? 'Unfavorite' : 'Favorite'}}
                    </div>
                    <a class="btn btn-primary border-success border-2 py-lg-2" 
                    @mouseover="hoverUpdate = true" @mouseleave="hoverUpdate = false" 
                    :class="[hoverUpdate ? 'btn-success' : 'btn-primary text-success'], {'ms-1 col-6': user}" 
                    :href="getVideoUrl()" :download="wpId">
                        <i class="bi bi-download"></i> Download
                    </a>
                </div>
                <div class="col-lg-10 mx-auto">
                    <table class="table table-sm my-2" :style="tableStyle">
                        <tbody>
                            <tr><th>Uploader</th><td class="text-capitalize">{{uploaderStr}}</td></tr>
                            <tr><th>Time</th><td>{{timeSinceUploadStr}}</td></tr>
                            <tr><th>Resolution</th><td>{{resolutionStr}}</td></tr>
                            <tr><th>Aspect ratio</th><td>{{aspectRatioStr}}</td></tr>
                            <tr><th>Stars</th><td>{{starsStr}}</td></tr>
                            <tr><th>Views</th><td>{{viewsStr}}</td></tr>
                        </tbody>
                    </table>
                    <div class="my-4 d-flex flex-wrap justify-content-center">
                        <div v-for="tag in tags" role="button" class="h4 mx-4 my-2 text-center"
                        @click="goSearchTag(tag)">
                            #{{tag}}
                        </div>
                    </div>
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
            await user.getStarred();
        }
        let wp = await store.loadWallpaper(this.wpId);
        if (wp) {
            await wp.getLikes();
            await wp.getTags();
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
            let views = store.getWpViewsStr(this.wpId);
            return views + (views !== 1 ? " views" : " view");
        },
        uploaderStr: function () {
            return store.getWpUploaderStr(this.wpId);
        },
        starsStr: function () {
            let stars = store.getWpStarsStr(this.wpId);
            return stars + (stars !== 1 ? " stars" : " star");
        },
        aspectRatioStr: function () {
            return store.getWpAspectRatioStr(this.wpId);
        },
        tags: function () {
            return store.getWpTags(this.wpId);
        },
        tableStyle: function () {
            return store.getStyle().getTextBorderColorStr();
        },
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
        },
        goSearchTag: async function (tag) {
            store.state.filterSearch = tag;
            return this.$router.push("/latest/");
        }
    }
};