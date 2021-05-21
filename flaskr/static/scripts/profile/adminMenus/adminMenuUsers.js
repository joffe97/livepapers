let adminMenuUsersC = {
    template: `
    <div class="d-flex justify-content-between mb-2 flex-wrap">
        <div class="btn btn-success col-12 col-sm-auto mb-3 mb-sm-0 px-sm-5 py-sm-3">Apply</div>
        <form class="input-group w-auto mx-sm-0 mx-auto flex-nowrap col-12 col-sm-auto" @submit.prevent>
            <div class="form-floating">
                <input id="username-search" class="form-control col-auto rounded-0 rounded-start" 
                type="search" placeholder="Wallpaper id">
                <label for="username-search">Username</label>
            </div>
            <div class="btn btn-secondary col-auto d-flex align-items-center" type="submit"><i class="bi bi-search"></i></div>
        </form>
    </div>
    <hr>
    <div class="display-6">Permissions</div>
    <div class="d-flex flex-fill justify-content-sm-between flex-column flex-sm-row flex-wrap mt-3">
        <div v-for="type in adminUserTypesControl" class="form-check mx-sm-3">
            <input class="form-check-input" type="checkbox" :id="'usertype-check' + type" :value="type">
            <label class="form-check-label" :for="'usertype-check' + type">{{ getTypeDesc(type) }}</label>
        </div>
    </div>
    <hr>
    `,
    data() {
        return {
            modifyUser: undefined,
            modifyUserTypes: []
        }
    },
    computed: {
        adminuser: function () {
            return store.state.user;
        },
        isManager: function () {
            return this.adminuser.type & USER_TYPES.MANAGER
        },
        adminUserTypesControl: function () {
            let userTypes = {...USER_TYPES};
            if (!this.isManager) {
                delete userTypes.ADMIN;
                delete userTypes.MANAGER;
            }
            return userTypes;
        }
    },
    methods: {
        getTypeDesc: function (type) {
            return getUserTypeDesc(type)
        }
    }
}