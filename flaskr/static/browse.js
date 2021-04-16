let browseC = {
    template: `
    <my-head pageId=1></my-head>
    <div class="bg-secondary">
        <div class="container">
            <div class="d-flex justify-content-center flex-wrap">
                <div
                v-for="wpId in wallpaperIds"
                v-on:click="goWallpaper(wpId)"
                class="browse-img-square btn m-2 p-0 border border-light">
                    <figure
                    class="figure m-0">
                        <img class="rounded-3 m-0 figure-img img-fluid" 
                        v-bind:src="getImageUrl(wpId)">
                    </figure>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            wallpaperIds: [1, 2, 3, 4]
        }
    },
    methods: {
        goWallpaper: function(wpId) {
            this.$router.push("/wallpaper/" + wpId);
        },
        getImageUrl: function (wpId) {
            return cmnGetImageUrl(wpId);
        }
    }
}
