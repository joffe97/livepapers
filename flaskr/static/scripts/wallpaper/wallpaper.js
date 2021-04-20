let wallpaperC = {
    props: ["wpId"],
    template: `
    <my-head></my-head>
    <div class="container">
        <div class="col">
            <div class="wallpaper-video row-12 m-auto">
                <div class="my-4">
                    <video class="unclickable p-0" autoplay loop muted>
                        <source :src="getVideoUrl()">
                    </video>
                </div>
                <div class="row-auto p-0">
                    <div class="btn-group m-0" role="group">
                        <div class="btn btn-warning rounded-0 rounded-top">Add to favorites</div>
                        <div class="btn btn-success rounded-0 rounded-top">Download</div>
                    </div>
                    <ul class="col-2 list-group p-0 rounded-0 rounded-bottom">
                        <li v-for="info in [getViewsStr(), getUploadDateStr(), getResolution()]"
                        class="list-group-item bg-light">
                            <strong>{{info}}</strong>
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
            return cmnGetVideoUrl(this.wpId)
        },
        getResolution: function () {
            return this.width + " x " + this.height
        },
        getUploadDateStr: function () {
            return "Added 2 weeks ago";
        },
        getViewsStr: function () {
            return 512 + " views";
        },
        fillWallpaperData: function () {
            return;
        }
    }
}