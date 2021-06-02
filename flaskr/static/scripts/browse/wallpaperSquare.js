let wallpaperSquareC = {
    props: ["wpId"],
    template: `
    <transition name="wp" appear>
        <div
        @click="goWallpaper()"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
        class="browse-img-square btn m-2 p-0 position-relative rounded rounded-3"
        :class="wpId ? 'browse-img-square-hover' : 'unclickable'">
            <div v-if="isHover && wpId" class="wallpaper-video unclickable position-absolute translate-middle start-50 top-50">
                <video autoplay loop muted :poster="getImageUrl(wpId)">
                    <source :src="getVideoUrl(wpId)" type="video/mp4">
                </video>
                <div v-if="wp" class="browse-img-square-info">
                    {{ wpResolution }}
                </div>
            </div>
            <figure class="figure m-0">
                <img class="m-0 figure-img img-fluid position-absolute translate-middle start-50 top-50" 
                :src="getImageUrl(wpId)">
            </figure>
        </div>
    </transition>
    `,
    data() {
        return {
            isHover: false
        }
    },
    computed: {
        wp: function () {
            return store.getWallpaper(this.wpId);
        },
        wpResolution: function () {
            return this.wp ? this.wp.getResolution() : "";
        }
    },
    methods: {
        goWallpaper: function() {
            if (!this.wpId) return;
            this.$router.push("/wallpaper/" + this.wpId);
        },
        getImageUrl: function () {
            return cmnGetImageUrl(this.wpId);
        },
        getVideoUrl: function () {
            return cmnGetVideoUrl(this.wpId);
        }
    }
};