let browseC = {
    props: ["browseId"],
    template: `
    <my-head></my-head>
    <alert-tmp></alert-tmp>
    <div class="container">
        <div class="d-flex justify-content-center flex-wrap mb-5">
            <div
            v-if="wallpaperIds"
            v-for="wpId in wallpaperIds"
            @click="goWallpaper(wpId)"
            class="browse-img-square btn m-2 p-0 border border-light">
                <figure
                class="figure m-0">
                    <img class="rounded-3 m-0 figure-img img-fluid" 
                    :src="getImageUrl(wpId)">
                </figure>
            </div>
            <h4 v-if="wallpaperIds && !wallpaperIds.length">Cannot find any wallpapers ${EMOJI_SCREAMING}</h4>
        </div>
        <div v-if="isLoading" class="w-75 position-fixed bottom-0 start-50 translate-middle-x">
            <div class="spinner-grow w-100 position-absolute translate-middle-y top-50" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            wallpaperIds: store.state.browseIds,
            isLoading: true,
        }
    },
    async created() {
        this.updatePageId();
        window.onscroll = async () => await this.onBottomScroll();
    },
    async mounted() {
        this.loadIfNotFullPage();
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
            if (oldPageId !== store.state.pageId && store.state.pageId !== 0) this.wallpaperIds = [];
            await this.loadIfNotFullPage()
        },
        loadMoreWallpapers: async function () {
            switch (this.browseId) {
                case "latest":
                    await this.getLatest();
                    break;
                case "mostliked":
                    break;
                case "random":
                    break;
                default:
                    break;
            }
            this.isLoading = false;
        },
        addWallpapers: function (wps) {
            for (let i = 0; i < wps.length; i++) {
                this.wallpaperIds.push(wps[i].aid);
                store.state.wallpapers.saveWallpaper(wps[i])
            }
        },
        getLatest: async function () {
            let lastWp = this.lastWallpaper;
            let query = lastWp ? "?fms=" + lastWp.date.getTime() : "";
            let reply = await fetch("/wallpapers/latest" + query);
            if (reply.status !== 200) return null;
            let wps = await reply.json();
            this.addWallpapers(wps);
        },
        onBottomScroll: async function () {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                if (this.isLoading) return;
                this.isLoading = true;
                await this.loadMoreWallpapers();
            }
        },
        loadIfNotFullPage: async function (i) {
            console.log(i);
            if (i === undefined) i = 12;
            if (!i || document.body.offsetHeight > window.innerHeight) return;
            console.log(document.body.offsetHeight + " | " + window.innerHeight);
            this.loadMoreWallpapers().then(() => {
                this.loadIfNotFullPage(i - 1)
            })
        }
    },
    watch: {
        browseId: function () {
            this.updatePageId()
        }
    },
};
