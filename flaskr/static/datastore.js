let alertTypes = ["danger", "success", "warning"]

class DataStore {
    constructor() {
        this.state = Vue.reactive({
            isInited: false,
            isLoggedIn: false,
            pageId: 0,
            alertMessage: "",
            alertType: "danger"
        });
    }
}

let store = new DataStore();

function setAlert(message, type) {
    store.state.alertMessage = message
    if (alertTypes.includes(type.toLowerCase())) {
        store.state.alertType = type;
    } else {
        store.state.alertType = "danger";
    }
}
