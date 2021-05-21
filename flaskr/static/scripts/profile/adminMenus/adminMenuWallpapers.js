let adminMenuWallpapersC = {
    template: `
    <form class="d-flex justify-content-end" @submit.prevent>
        <div class="input-group w-auto">
            <div class="form-floating">
                <input id="wpid-search" class="form-control col-auto" type="search" placeholder="Wallpaper id">
                <label for="wpid-search">Wallpaper id</label>
            </div>
            <div class="btn btn-success col-auto d-flex align-items-center" type="submit"><i class="bi bi-search"></i></div>
        </div>
    </form>
    `
}