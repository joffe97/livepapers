let browseC = {
    props: ["browseId"],
    template: `
    <my-head></my-head>
    <div class="container">
        <alert-tmp></alert-tmp>
        <div class="d-flex justify-content-center flex-wrap">
            <div
            v-for="wpId in wallpaperIds"
            @click="goWallpaper(wpId)"
            class="browse-img-square btn m-2 p-0 border border-light">
                <figure
                class="figure m-0">
                    <img class="rounded-3 m-0 figure-img img-fluid" 
                    :src="getImageUrl(wpId)">
                </figure>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            wallpaperIds: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ]
        }
    },
    created() {
        this.updatePageId();
    },
    beforeUnmount() {
        store.state.pageId = 0;
    },
    methods: {
        goWallpaper: function(wpId) {
            this.$router.push("/wallpaper/" + wpId);
        },
        getImageUrl: function (wpId) {
            return cmnGetImageUrl(wpId);
        },
        updatePageId: function () {
            switch (this.browseId) {
                case "mostliked":
                    store.state.pageId = 2;
                    break;
                case "random":
                    store.state.pageId = 3;
                    break;
                default:
                    store.state.pageId = 1;
            }
        }
    },
    watch: {
        browseId: function () {
            this.updatePageId()
        }
    },
}
