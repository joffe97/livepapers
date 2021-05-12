const WALLPAPER_LOAD_COUNT = 24;

const UPLOADED_TIMES = {
    ALL_TIME: 0,
    LAST_SIX_HOURS: 1,
    LAST_DAY: 2,
    LAST_WEEK: 3,
    LAST_MONTH: 4,
    LAST_THREE_MONTHS: 5,
    LAST_SIX_MONTHS: 6,
    LAST_YEAR: 7,
};

const RATIOS = [{name: "general", types: ["portrait", "landscape"]},
                {name: "ultrawide", types: ["21x9", "32x9"]},
                {name: "wide", types: ["16x9", "16x10"]},
                {name: "portrait", types: ["9x16", "18x37"]}]

const COLORS = ["red", "blue", "green", "yellow", "orange", "pink", "white", "gray", "black"]

function getUploadedTimesDesc(type) {
    switch (type) {
        case UPLOADED_TIMES.ALL_TIME:
            return "All time";
        case UPLOADED_TIMES.LAST_SIX_HOURS:
            return "Last six hours";
        case UPLOADED_TIMES.LAST_DAY:
            return "Last day";
        case UPLOADED_TIMES.LAST_WEEK:
            return "Last week";
        case UPLOADED_TIMES.LAST_MONTH:
            return "Last month";
        case UPLOADED_TIMES.LAST_THREE_MONTHS:
            return "Last three months";
        case UPLOADED_TIMES.LAST_SIX_MONTHS:
            return "Last six months";
        case UPLOADED_TIMES.LAST_YEAR:
            return "Last year";
    }
}

let browseC = {
    props: ["browseId"],
    template: `
    <div class="nav-dropdown position-fixed top-0 bg-info col-12 col-md-auto border border-2 border-top-0
    border-primary rounded-bottom" 
    :class="{'nav-dropdown-view': filterMenu}">
        <form class="w-100 h-100 py-3 px-3 overflow-auto d-flex flex-column flex-sm-row justify-content-sm-around 
        align-items-center justify-content-start">
            <div class="d-flex flex-column col-12 col-sm-auto px-sm-3">
                <div class="py-3 col-12 col-sm-auto">
                    <h4 class="border-bottom px-2 py-1">Ratio</h4>
                    <div v-for="ratio in ratios" class="btn-group-vertical col-3 col-sm-auto">
                        <p class="my-0 px-2 text-capitalize">{{ ratio.name }}</p>
                        <input type="button" v-for="ratioType in ratio.types" class="btn btn-sm-sm 
                        text-capitalize text-truncate" :value="ratioType" 
                        :class="[filterRatio === ratioType ? 'btn-dark' : 'btn-outline-dark']"
                        @click="updateFilterRatio(ratioType)">
                    </div>
                </div>
                <div>
                    <h4 class="border-bottom px-2 py-1">Colors</h4>
                    <div class="row d-flex justify-content-center">
                        <button v-for="color in colors" class="btn m-1 py-3 col-3"
                        :style="'background-color: ' + color"></button>
                    </div>
                </div>
            </div>
            <div class="py-3 px-sm-3 col-12 col-sm-auto">
                <h4 class="border-bottom px-2 py-1">Uploaded</h4>
                <div class="btn-group-vertical col-12 col-sm-auto">
                    <div v-for="uploadTime in uploadTimes" class="w-100 form-check p-0 m-0">
                        <input class="btn-check" type="radio" name="uploadRadios" 
                        :id="'uploadRadio' + uploadTime" :value="uploadTime" v-model="filterUploadTime">
                        <label class="btn btn-sm btn-outline-dark w-100" :for="'uploadRadio' + uploadTime">
                            {{ getUploadDesc(uploadTime) }}
                        </label>
                    </div>
                </div>
            </div>
        </form>
        {{filterRatio}}
        <div class="shadow position-absolute top-100 end-0 btn btn-warning pt-2 me-3 border-2 border-primary rounded-0 
        rounded-bottom" @click="filterMenu = !filterMenu">
            <h5 class="m-0">Filters</h5>
        </div>
    </div>

    <div class="container-fluid px-0 px-lg-5">
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
            hoverIndex: -1,
            randomSeed: undefined,
            filterMenu: false,
            filterRatio: "",
            filterUploadTime: 0
        }
    },
    async created() {
        await this.updatePageId();
        window.onscroll = async () => {
            this.filterMenu = false;
            await this.onBottomScroll();
        }
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
        },
        ratios: function () {
            return RATIOS;
        },
        uploadTimes: function () {
            return UPLOADED_TIMES;
        },
        colors: function () {
            return COLORS;
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
                    this.randomSeed = undefined;
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
                    await this.getRandom();
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
            let reply = await fetch("/wallpapers/latest?count=" + count + query);
            if (reply.status !== 200) return null;
            let wps = await reply.json();
            this.addWallpapers(wps);
            this.verifyWpReplyCount(wps, count);
        },
        getMostliked: async function () {
            let count = WALLPAPER_LOAD_COUNT;
            let lastWp = this.lastWallpaper;
            let stars = lastWp ? await lastWp.getLikes() : undefined;
            let query = "";
            if (stars !== undefined) {
                query = "&stars=" + stars;
                let wpid = lastWp.id;
                if (wpid) query += "&wpid=" + wpid;
            }
            let reply = await fetch("/wallpapers/mostliked?count=" + count + query);
            if (reply.status !== 200) return null;
            let wps = await reply.json();
            this.addWallpapers(wps);
            this.verifyWpReplyCount(wps, count);
        },
        getRandom: async function () {
            let count = WALLPAPER_LOAD_COUNT;
            if (this.randomSeed === undefined) this.randomSeed = Math.floor(Math.random() * 10000) + 1;
            let received = this.wallpaperIds ? this.wallpaperIds.length : 0;
            let reply = await fetch(`/wallpapers/random?count=${count}&received=${received}&seed=${this.randomSeed}`);
            if (reply.status !== 200) return null;
            let wps = await reply.json();
            this.addWallpapers(wps);
            this.verifyWpReplyCount(wps, count);
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
        },
        getUploadDesc: function (type) {
            return getUploadedTimesDesc(type);
        },
        updateFilterRatio: function (type) {
            if (type === this.filterRatio) this.filterRatio = "";
            else this.filterRatio = type;
        }
    },
    watch: {
        browseId: async function () {
            await this.updatePageId();
                setTimeout(()=>cmnScrollTop(), 10)
        }
    },
};
