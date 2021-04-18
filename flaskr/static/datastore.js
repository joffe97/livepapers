class DataStore {
    constructor() {
        this.state = Vue.reactive({
            isInited: false,
            isLoggedIn: false
        });
    }
}

let store = new DataStore();
