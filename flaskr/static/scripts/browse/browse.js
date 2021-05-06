const WALLPAPER_LOAD_COUNT = 24;

let browseC = {
    props: ["browseId"],
    template: `
    <div class="container-fluid">
        <div id="browsediv" class="d-flex justify-content-center align-content-start flex-wrap pb-5 position-relative">
            <div
            v-if="wallpaperIds"
            v-for="wpId, i in wallpaperIds"
            @click="goWallpaper(wpId)"
            @mouseover="hoverIndex = i"
            @mouseleave="hoverIndex = -1"
            class="browse-img-square btn m-2 p-0 position-relative">
                <video v-if="hoverIndex === i" autoplay loop muted :poster="getImageUrl(wpId)"
                class="wallpaper-video unclickable position-absolute translate-middle start-50 top-50">
                    <source :src="getVideoUrl(wpId)" type="video/mp4">
                </video>
                <figure class="figure m-0">
                    <img class="rounded-3 m-0 figure-img img-fluid position-absolute translate-middle start-50 top-50" 
                    :src="getImageUrl(wpId)">
                </figure>
            </div>
            <h4 v-if="!isLoading && wallpaperIds && !wallpaperIds.length">Cannot find any wallpapers ${EMOJI_SCREAMING}</h4>
        </div>
        <div v-if="isLoading" class="w-75 position-fixed bottom-0 start-50 translate-middle-x">
            <div class="spinner-grow w-100 position-absolute translate-middle-y top-50" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
    <div v-if="reachedEnd" class="w-100 bottom-0 text-center">
        <h4 class="mb-4">You've reached the end</h4>
    </div>
    `,
    data() {
        return {
            wallpaperIds: store.state.browseIds,
            isLoading: false,
            reachedEnd: false,
            hoverIndex: -1
        }
    },
    async created() {
        await this.updatePageId();
        window.onscroll = async () => await this.onBottomScroll();
    },
    beforeUnmount() {
        window.onscroll = null;
        store.state.pageId = 0;
    },
    computed: {
        lastWallpaper: function () {
            if (!this.wallpaperIds || !this.wallpaperIds.length) return undefined;
            let wpId = this.wallpaperIds[this.wallpaperIds.length - 1];
            return store.state.wallpapers.dict[wpId];
        }
    },
    methods: {
        goWallpaper: function(wpId) {
            this.$router.push("/wallpaper/" + wpId);
        },
        getImageUrl: function (wpId) {
            return cmnGetImageUrl(wpId);
        },
        getVideoUrl: function (wpId) {
            return cmnGetVideoUrl(wpId);
        },
        updatePageId: async function () {
            let oldPageId = store.state.pageId;
            switch (this.browseId) {
                case "latest":
                    store.state.pageId = 1;
                    break;
                case "mostliked":
                    store.state.pageId = 2;
                    break;
                case "random":
                    store.state.pageId = 3;
                    break;
                default:
                    store.state.pageId = 0;
            }
            if (oldPageId !== store.state.pageId && store.state.pageId !== 0) {
                this.wallpaperIds = [];
                this.reachedEnd = false;
            }
            await this.loadIfNotFullPage()
        },
        loadMoreWallpapers: async function () {
            if (this.isLoading || this.reachedEnd) return;
            this.isLoading = true;
            switch (this.browseId) {
                case "latest":
                    await this.getLatest();
                    break;
                case "mostliked":
                    await this.getMostliked();
                    break;
                case "random":
                    break;
                default:
                    break;
            }
            this.isLoading = false;
        },
        getLatest: async function () {
            let count = WALLPAPER_LOAD_COUNT;
            let lastWp = this.lastWallpaper;
            let query = lastWp ? "&fms=" + lastWp.date.getTime() : "";
            let reply = await fetch("/wallpapers/latest?count?" + count + query);
            if (reply.status !== 200) return null;
            let wps = await reply.json();
            this.addWallpapers(wps);
            this.verifyWpReplyCount(wps, count)
        },
        getMostliked: async function () {
            let count = WALLPAPER_LOAD_COUNT;
            let lastWp = this.lastWallpaper;
            let stars = lastWp ? await lastWp.getLikes() : "";
            let query = "";
            if (stars) {
                query = "&stars=" + stars;
                let sameStars = [];
                for (let i = this.wallpaperIds.length - 2; i >= 0 ; i--) {  // TODO: This needs fix?
                    let curWpId = this.wallpaperIds[i];
                    let wp = store.getWallpaper(curWpId);
                    if (!wp) continue;
                    let curstars = await wp.getLikes();
                    if (curstars === stars) sameStars.push(curWpId);
                }
                if (sameStars.length) query += "&wpids=" + sameStars.join(",");
            }
            let reply = await fetch("/wallpapers/mostliked?count=" + count + query);
            if (reply.status !== 200) return null;
            let wps = await reply.json();
            this.addWallpapers(wps);
            this.verifyWpReplyCount(wps, count)
        },
        verifyWpReplyCount: function (wps, count) {
            if (!wps || wps.length === count) return;
            this.reachedEnd = true;
        },
        addWallpapers: function (wps) {
            for (let i = 0; i < wps.length; i++) {
                this.wallpaperIds.push(wps[i].aid);
                store.state.wallpapers.saveWallpaper(wps[i])
            }
        },
        onBottomScroll: async function () {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400) {
                await this.loadMoreWallpapers();
            }
        },
        loadIfNotFullPage: async function (i) {
            if (i === undefined) i = 12;
            if (!i) return;
            if (document.body.offsetHeight - 400 > window.innerHeight) {
                setTimeout(()=>this.loadIfNotFullPage(i - 1), 10);
                return;
            }
            this.loadMoreWallpapers().then(() => {
                setTimeout(()=>this.loadIfNotFullPage(i - 1), 10)
            })
        }
    },
    watch: {
        browseId: async function () {
            await this.updatePageId();
                setTimeout(()=>cmnScrollTop(), 10)
        }
    },
};
