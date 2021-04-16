class DataStore {
    constructor() {
        this.state = Vue.reactive({
            wallpaperIds: [1, 2, 3]
        });
    }
}

let store = new DataStore();
