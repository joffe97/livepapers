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
                <button 
                v-for="s in custom_styles"
                :style="s.getStr()"
                class="bg-show btn btn-info"
                @click="changeStyle(s)"></button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: store.state.user,
        }
    },
    computed: {
        custom_styles: function () {
            return CUSTOM_STYLES;
        }
    },
    methods: {
        changeStyle: function (new_style) {
            if (!this.user) return;
            this.user.style = new_style;
        }
    }
}