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
        this.timeout = setTimeout(() => setAlert(""), 3000);
    },
    beforeUnmount() {
        store.state.alertMessage = "";
        if (this.timeout) clearTimeout(this.timeout);
    }
}
