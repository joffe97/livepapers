const ADMIN_MENUS = ['users', 'wallpapers'];

let profileAdminC = {
    template: `
    <div class="col col-lg-11 mx-lg-auto">
        <div class="accordion" id="adminAccordion">
            <div v-for="menu in admin_menus" class="accordion-item border-info bg-info">
                <h2 class="accordion-header user-select-none">
                    <div class="accordion-button custom-accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + menu">
                        <span class="h5 m-0 text-capitalize">{{ menu }}</span>
                    </div>
                </h2>
                <div :id="'collapse' + menu" class="accordion-collapse collapse text-primary bg-dark">
                    <div class="accordion-body overflow-hidden">
                        <component :is="'admin-menu-' + menu"></component>
                    </div>
                </div>
            </div>
        </div>   
   </div>
    `,
    computed: {
        admin_menus: function () {
            return ADMIN_MENUS;
        }
    },
}