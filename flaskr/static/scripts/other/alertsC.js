let alertCrossC = {
    template: `
    <transition name="fade-up">
        <div v-if="alertMessage !== '' && alertMode === 'cross' && alertType" 
        class="alert alert-dismissible col-lg-12 mx-auto text-truncate" :class="[ 'alert-' + alertType ]">
            {{ alertMessage }}
            <button type="button" class="btn-close" @click="clearAlert()"></button>
        </div>
    </transition>
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
        <div v-show="alertMessage !== '' && alertMode === 'tmp' && alertType" id="alerttmp" type="button"
        class="alert alert-dismissible border-0 position-fixed shadow-lg translate-middle-x start-50" 
        :class="[ 'alert-' + alertType ]"
        @click="clearAlert">
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
        this.clearAlert();
        this.clearAlertTimeout();
    },
    methods: {
        clearAlert: function () {
            clearAlert();
        },
        setAlertTimeout: function () {
            if (this.alertMode !== "tmp") return;
            this.clearAlertTimeout();
            this.timeout = setTimeout(() => this.clearAlert(), 3000);
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
