let alertCrossC = {
    template: `
    <div class="alert alert-dismissible fade" 
    :class="[ alertMessage !== '' ? 'show' : 'p-0 m-0 unclickable', 'alert-' + alertType ]">
        {{ alertMessage }}
        <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>
    `,
    data() {
        return store.state;
    },
    beforeUnmount() {
        this.alertMessage = "";
    },
    watch: {
        alertMessage: function () {
            if (this.alertMessage) cmnScrollTop();
        }
    }
}

let alertTmpC = {
    template: `
    <div id="alerttmp" 
    class="alert alert-dismissible fade border-0 position-fixed shadow-lg translate-middle-x start-50" 
    :class="[ alertMessage !== '' ? 'show' : 'p-0 m-0 unclickable', 'alert-' + alertType ]">
        {{ alertMessage }}
    </div>
    `,
    data() {
        return {
            timeout: null
        };
    },
    computed: {
        alertType: function () {
            return store.state.alertType;
        },
        alertMessage: function () {
            return store.state.alertMessage;
        }
    },
    created() {
        this.setAlertTimeout();
    },
    beforeUnmount() {
        clearAlert();
        this.clearAlertTimeout();
    },
    methods: {
        setAlertTimeout: function () {
            this.clearAlertTimeout();
            this.timeout = setTimeout(() => clearAlert(), 3000);
        },
        clearAlertTimeout: function () {
            if (this.timeout) clearTimeout(this.timeout);
        }
    },
    watch: {
        alertMessage: function () {
            if (this.alertMessage) this.setAlertTimeout();
        }
    }
}
