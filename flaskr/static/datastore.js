class DataStore {
    constructor() {
        this.state = Vue.reactive({
            isLoggedIn: 0
        });
    }
}

let store = new DataStore();
