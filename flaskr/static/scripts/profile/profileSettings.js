BACKGROUND_STYLES = [
    "linear-gradient(to right, #bdc3c7, #2c3e50)",
    "red"
]

DEFAULT_BACKGROUND_STYLE = "background: #343a40; color: #f8f9fa;"

let profileSettingsC = {
    template: `
    <div class="col col-lg-11 mx-lg-auto">
        <div class="justify-content-between position-relative mx-lg-2">
            <div class="display-5 d-inline-block">Settings</div>
        </div>
        <hr>
        <div class="mx-lg-5">
            <h3>Background</h3>
            <div class="d-flex justify-content-around">
                <div 
                v-for="bg in background_styles"
                @click=""></div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: store.state.user,
            background_styles: BACKGROUND_STYLES
        }
    },
    computed: {
        background_styles: function () {
            return BACKGROUND_STYLES;
        }

    },
    methods: {
        changeBackground: function (new_background) {
            if (!this.user) return;
            this.user.settings.background = new_background;
        }
    }
}