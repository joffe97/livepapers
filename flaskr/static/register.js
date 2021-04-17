let registerC = {
    template: `
    <my-head pageId=6></my-head>
    <div class="container">
        <form class="okform">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="username" class="form-control" id="username">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password">
            </div>
            <div class="mb-3">
                <label for="verifypw" class="form-label">Verify password</label>
                <input type="password" class="form-control" id="verifypw">
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
        </form>    
    </div>`
}