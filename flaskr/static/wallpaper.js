let wallpaperC = {
    props: ["wpId"],
    template: `
    <my-head></my-head>
    <div class="container">
        <div class="col">
            <div class="wallpaper-video row-12 m-auto">
                <video class="unclickable p-0 my-4" autoplay loop muted>
                    <source v-bind:src="getVideoUrl()">
                </video>
                <div class="row-auto p-0">
                    <ul class="col-2 list-group p-0">
                        <li v-for="info in [getResolution(), getUploadDateStr(), getViewsStr()]"
                        class="list-group-item bg-info">
                            {{info}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            username: null,
            width: 1920,
            height: 1024,
            date: "15.04.2021",
            views: 512
        }
    },
    methods: {
        getVideoUrl: function () {
            return 'static/wallpapers/videos/' + this.wpId + '.mp4'
        },
        getResolution: function () {
            return this.width + " x " + this.height
        },
        getUploadDateStr: function () {
            return "15.04.2021";
        },
        getViewsStr: function () {
            return 512 + " views";
        },
        fillWallpaperData: function () {
            return;
        }
    }
}