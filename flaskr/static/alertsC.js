let alertCrossC = {
    template: `
    <div class="alert alert-dismissible fade" :class="[ alertMessage !== '' ? 'show' : 'p-0 m-0 unclickable', 'alert-' + alertType ]">
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
    <div class="alert alert-dismissible fade" :class="[ alertMessage !== '' ? 'show' : 'p-0 m-0 unclickable', 'alert-' + alertType ]">
        {{ alertMessage }}
    </div>
    `,
    data() {
        return store.state;
    },
    created() {
        console.log(this.alertMessage);
        setTimeout(() => this.alertMessage = "", 5000);
    },
    beforeUnmount() {
        this.alertMessage = "";
    }
}
