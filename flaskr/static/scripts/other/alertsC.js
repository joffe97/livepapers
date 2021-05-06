let alertCrossC = {
    template: `
    <div class="alert alert-dismissible fade" 
    :class="[ alertMessage !== '' && alertMode === 'cross'  ? 'show' : 'p-0 m-0 unclickable d-none', 'alert-' + alertType ]">
        {{ alertMessage }}
        <button type="button" class="btn-close" @click="clearAlert()"></button>
    </div>
    `,
    data() {
        return store.state;
    },
    beforeUnmount() {
        clearAlert();
    },
    watch: {
        alertMessage: function () {
            if (this.alertMessage && this.alertMode === "cross") cmnScrollTop();
        }
    },
    methods: {
        clearAlert: function () {
            clearAlert();
        }
    }
}

let alertTmpC = {
    template: `
    <div id="alerttmp" 
    class="alert alert-dismissible fade border-0 position-fixed shadow-lg translate-middle-x start-50" 
    :class="[ alertMessage !== '' && alertMode === 'tmp' ? 'show' : 'p-0 m-0 unclickable d-none', 'alert-' + alertType ]">
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
        },
        alertMode: function () {
            return store.state.alertMode;
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
            if (this.alertMode !== "tmp") return;
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
};
