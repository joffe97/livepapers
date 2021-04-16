let browseC = {
    template: `
    <my-head></my-head>
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
                        v-bind:src="'static/wallpapers/images/' + wpId + '.jpg'">
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
        goWallpaper: function(wp_id) {
            this.$router.push("/wallpaper/" + wp_id);
        }
    }
}
