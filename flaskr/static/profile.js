let profileC = {
    template: `
    <my-head></my-head>
    <div class="container">
    Profile
    </div>
    `,
    data() {
        return {
            store: store,
        }
    },
    created() {
        store.state.pageId = 4;
    },
    beforeUnmount() {
        store.state.pageId = 0;
    }
}