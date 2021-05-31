let alertCrossC = {
    template: `
    <div v-if="alertMessage !== '' && alertMode === 'cross' && alertType" class="alert alert-dismissible" 
    :class="[ 'alert-' + alertType ]">
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
    <transition name="showing">
        <div v-show="alertMessage !== '' && alertMode === 'tmp' && alertType" id="alerttmp" 
        class="alert alert-dismissible border-0 position-fixed shadow-lg translate-middle-x start-50" 
        :class="[ 'alert-' + alertType ]">
            {{ alertMessage }}
        </div>
    </transition>
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
