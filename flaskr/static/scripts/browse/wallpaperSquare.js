let wallpaperSquareC = {
    props: ["wpId"],
    template: `
    <div
    @click="goWallpaper()"
    @mouseover="isHover = true"
    @mouseleave="isHover = false"
    class="browse-img-square btn m-2 p-0 position-relative"
    v-if="wpId">
        <video v-if="isHover" autoplay loop muted :poster="getImageUrl(wpId)"
        class="wallpaper-video unclickable position-absolute translate-middle start-50 top-50">
            <source :src="getVideoUrl(wpId)" type="video/mp4">
        </video>
        <figure class="figure m-0">
            <img class="rounded-3 m-0 figure-img img-fluid position-absolute translate-middle start-50 top-50" 
            :src="getImageUrl(wpId)">
        </figure>
    </div>
    <div 
    v-else
    class="browse-img-square m-2 p-0 position-relative"> 
    </div>
    `,
    data() {
        return {
            isHover: false
        }
    },
    methods: {
        goWallpaper: function() {
            this.$router.push("/wallpaper/" + this.wpId);
        },
        getImageUrl: function () {
            return cmnGetImageUrl(this.wpId);
        },
        getVideoUrl: function () {
            return cmnGetVideoUrl(this.wpId);
        }
    }
}