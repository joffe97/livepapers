// Component of the user setting menu for admins
let adminMenuUsersC = {
    template: `
    <div class="d-flex justify-content-between mb-2 flex-wrap">
        <button class="btn btn-success col-12 col-sm-auto mb-3 mb-sm-0 px-sm-5 py-sm-3" 
        @click="updateUser"
        :disabled="!modifyUser">
            Apply
        </button>
        <form class="input-group w-auto mx-sm-0 mx-auto flex-nowrap col-12 col-sm-auto" @submit.prevent 
        @submit="searchUser">
            <div class="form-floating">
                <input id="username-search" class="form-control col-auto rounded-0 rounded-start" 
                :class="usernameValidatorClass"
                placeholder="Username" v-model="usernameInput">
                <label for="username-search">Username</label>
            </div>
            <div class="btn btn-secondary col-auto d-flex align-items-center" @click="searchUser">
                <i class="bi bi-search"></i>
            </div>
        </form>
    </div>
    <hr>
    <div class="display-6">Permissions</div>
    <div class="d-flex flex-fill justify-content-sm-between flex-column flex-sm-row flex-wrap mt-3">
        <div v-for="type in adminUserTypesControl" class="form-check mx-sm-3">
            <input class="form-check-input" type="checkbox" :id="'usertype-check' + type" :value="type"
            :disabled="!modifyUser" :checked="hasUserType(type)" v-model="modifyUserTypes[type]">
            <label class="form-check-label" :for="'usertype-check' + type">{{ getTypeDesc(type) }}</label>
        </div>
    </div>
    <hr>
    `,
    data() {
        return {
            usernameInput: "",              // Typed in username
            validUsernameInput: undefined,  // True if valid username, False if not valid, undefined if no users is selected
            modifyUser: undefined,          // The selected user
            modifyUserTypes: this.getEmptyUserTypesDict()   // User type checkbox inputs
        }
    },
    computed: {
        // Current user
        adminuser: function () {
            return store.state.user;
        },

        // True if user is manager
        isManager: function () {
            return this.adminuser.type & USER_TYPES.MANAGER
        },

        // Class for showing if selected username input is valid
        usernameValidatorClass: function () {
            switch (this.validUsernameInput) {
                case true:
                    return "is-valid";
                case false:
                    return "is-invalid";
                default:
                    return "";
            }
        },

        // Return user types this user is allowed to control
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
        // Return dictionary with user types with no values
        getEmptyUserTypesDict: function () {
            let dict = {};
            for (let type in USER_TYPES) {
                dict[USER_TYPES[type]] = !!(this.modifyUser && (this.modifyUser.type & USER_TYPES[type]));
            }
            return dict;
        },

        // Returns description of given user type
        getTypeDesc: function (type) {
            return getUserTypeDesc(type)
        },

        // Search for the selected user in the server
        searchUser: async function () {
            let user = await store.getOtherUser(this.usernameInput);
            if (!user) {
                this.validUsernameInput = false;
                return;
            }
            this.modifyUser = user;
            this.validUsernameInput = true;
            this.modifyUserTypes = this.getEmptyUserTypesDict();
        },

        // Update the selected user with the new selected values
        updateUser: async function () {
            let typeflag = 0;
            for (let typenum in this.modifyUserTypes) {
                if (this.modifyUserTypes.hasOwnProperty(typenum) && this.modifyUserTypes[typenum]) {
                    typeflag += parseInt(typenum);
                }
            }
            if (!this.modifyUser) {
                setAlert(`Please select a user.`, "warning");
                return;
            }
            if (this.modifyUser.type === typeflag) {
                setAlert(`Did not update user, due to no changes where made.`, "warning");
                return;
            }
            let reply = await fetch(`/allusers/${this.modifyUser.username}/type`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "type": typeflag
                })
            });
            if (reply.status !== 200) return;
            let json = await reply.json();
            if (json.status !== "success") {
                setAlert(`Could not update the user "${this.modifyUser.username}".`);
                return;
            }
            this.modifyUser.type = typeflag;
            setAlert(`Successfully updated the user "${this.modifyUser.username}".`, "success");
        },
        hasUserType: function (type) {
            return this.modifyUser && this.modifyUser.hasType(type);
        },
    },
    watch: {
        // Remove user when typing
        usernameInput: function () {
            this.validUsernameInput = undefined;
            this.modifyUser = undefined;
        }
    }
}