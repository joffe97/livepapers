# Livepapers - web programming exam project
**Livepapers** is a webpage developed by Joachim Andreassen as a exam project in the web programming course. The purpose of this webpage is to provide animated wallpapers to users. Animated wallpapers can be put to use using <a href="https://rocksdanister.github.io/lively/#three">Lively Wallpaper</a>, or other similar software.



## Technical

**Python version:** 3.9

**Python packages:** See `/flaskr/requirements.txt`

**Style:** Bootstrap (bsstyle.css) and custom css (style.css)

* `/flaskr/static/bootstrap/` and `/flaskr/static/style/bsstyle.css` is a part of bootstrap, which is made by a third party.

**How to run:**  

1. Go to the `/flaskr` directory.
2. Run `./venv/Scripts/python.exe ./app.py`.
   * Use the `-infinite_scroll` flag for a simulation of the never ending scroll on the browse page. 
     * **Note!** This is only for displaying/testing purposes, and is not intended for the production state of the app.
   * If the venv is not working, delete the old venv and create a new:
     1. `python3.9.exe -m venv venv`
     2. `./venv/Scripts/pip.exe -r ./requirements.txt`



## User credentials

<table>
    <thead>
        <tr><th>Username</th><th>Password</th><th>Permission</th></tr>
    </thead>
	<tbody>
        <tr><td>Joachim</td><td>sjoko123</td><td>All permissions</td></tr>
        <tr><td>Tina</td><td>pokemon</td><td>Log in and have profile picture</td></tr>
        <tr><td>Nassenoff</td><td>sjoko123</td><td>Blocked</td></tr>
    </tbody>
</table>

**Note!** These passwords are shorter than the usual password length. This has been applied manually for testing purposes.



## Content

#### General:

* Styling/css is added to the page if the user is logged in, and have changed this
* The login and register buttons in the header is replaced with a profile dropdown menu when logged in
* Uses flask login for user handling
* Passwords are encrypted
* 2 types of alerts. 
  * 3 different color codes on both
  * Tmp alert:
    * Hovers over content
    * Disappears after some time
    * Disappears on click
  * Cross alert:
    * Static alert
    * Disappears when crossed out
* Fluent design everywhere.
  * Works good for both desktop and mobile



#### Browse pages:

The browse pages is a used to display all the wallpapers. There are three different browse pages: `/latest`, `/mostliked`, `/random`. The difference between these pages is that they have different sorting of wallpapers:

* `/latest`: Sorts by upload date, where the last uploaded wallpapers appear first.
* `/mostliked`: Sorts by start gotten (likes), where the wallpaper with most stars appear first.
* `/random`: Sorts randomly with a random seed.
  * Refreshes each time the page is reloaded, and when the "random button" in the header is pressed.

**Note!** The address `/` is redirected to `/latest`, making this the main page of the website.



The following features apply to all browsing pages:

* Only low resolution images is shown at load to reduce load time
* Wallpapers can be pressed to enter page for downloading and more info

* On wallpaper hover
  * Wallpaper video is downloaded and played when it is hovered
  * Wallpaper resolution is shown
  * Image gets shadow and lighter

* Procedural loading
  * Wallpapers are loaded 12 at a time
  * The different browse pages have all a unique algorithm to tackle this, without sending a list of received wallpapers.
  * Fade in transitions is added on load
  * Gray background is shown if image is not yet loaded

* Infinite scrolling
  * The page continues to load wallpapers when the user scroll to the bottom, as long as there is more wallpapers to get.
  * This can be simulated by using the staring the application with the `-infinite_scoll` flag: `./app.py -infinite_scroll`.
  * Loading animation when loading more wallpapers.

* Filters (yellow button coming down from header)
  * Filters the displaying wallpapers by color, ratio, upload date or search:
    * Ratio 
      * Filters wallpapers by the chosen ratio
        * Portrait: Display only portrait/vertical wallpapers
        * Landscape: Display only landscape/horizontal wallpapers
    * Colors
      * Filters wallpapers by the chosen color
      * The color is found when the wallpaper is uploaded, from the color palette of the first image in the video. The 3 most used colors in the image is then compared to a set of 9 colors. The colors that looks most like the 3 most used colors is then added to the database
    * Uploaded
      * Filters wallpapers by the upload date
    * Search
      * Search appears different from the others, as cannot be saved for later
      * The search disappears ones the page is left/reloaded
      * Searches for 3 things:
        * Wallpaper id
        * User that uploaded the wallpaper
        * Wallpaper tag
  * Update and save buttons
    * Refreshes the wallpapers with the selected filters
    * Update:
      * Filters disappear on log out
    * Save:
      * Filters is saved and stored in the database
      * Filters is applied on next log in



#### Wallpaper page (`/wallpaper/<id>`):

The wallpaper page is a page used for displaying a single wallpaper. There is also a download button here, along with some info about the wallpaper. The page contains the following thing:

* Video of the wallpaper
  * Can be pressed to view the wallpaper in fullscreen.
* Buttons
  * Download button
    * Downloads the animated wallpaper
  * Favorite button
    * Is hidden if the user is not logged in
    * Star changes color if the wallpaper is added to favorites
* Info about the wallpaper
* Tags added to the wallpaper
  * Can be clicked to search for the given word



#### Login page (`/login`)

The login page is where the user log in. 

* The authentication is verified backend
* A meaningful error message is shown if the authentication fails
* A blocked user cannot log in



#### Registration page (`/registration`)

The registration page is where new users register a user.

* A meaningful error message is shown if registration fails
* Registration is verified backend:
  * Username cannot be taken
  * Username must be between 3 and 20 characters
  * Both username and password can only contain letters from A to Z (both upper and lowercase) and numbers
  * Password must be more than 12 characters long
  * The password and verified passwords must match



#### Profile pages (`/profile/<subpage>`)

* Menu on top shows which subpage the user is on
* Sliding effect when navigating between subpages
  * Slides relative to the new subpage position in the profile menu
* Mobile only functionality:
  * Swipe horizontal to navigate between profile pages
    * Must swipe more horizontal than vertical
    * Must swipe a small distance



#### Profile overview page (`/profile/overview`)

The profile overview page is displaying information about the current user:

* 300x300 profile picture
  * Displays a default image if there is no profile picture added
* Info:
  * Username
  * Number of uploaded wallpapers
  * Number of favorites
  * Number of users who have favorited the current users uploaded wallpapers



#### Profile collection page (`/profile/collection`, `/profile/collection/uploaded`, `/profile/collection/favorites`)

Displays a list of either uploaded or favorited wallpapers. Each entry in the list contains information about the wallpaper.

* Uploaded page:
  * Ability to add new tags to wallpaper
  * Ability to delete tags from wallpaper
  * Cross to delete wallpaper
* Favorites page:
  * Ability to favorite and unfavorite wallpapers
  * Wallpapers doesn't disappear from the list before the page is left



#### Upload page (`/profile/upload`)

The upload page is where the user uploads new wallpapers. The only format supported is mp4. The page contains the following features:

* Preview of wallpaper
  * Can display both images and videos
    * Shows error message if the file is not a mp4 file
* Info
  * Type and resolution of wallpaper is displayed
  * Only for information. This data is found again in backend.
* Tags
  * Add tag to list
  * Remove tag to list
  * Transition on adding and deletion
* Backend process
  1. Get datauri from client
  2. Extract data and filetype from media
  3. Creates temporary file to get width and height of video
  4. Adds wallpaper to database
  5. Creates video file from datauri
  6. Create an image out of the video
  7. Crop the image into 3:2 format  (self made algorithm)
  8. Resize image to 450x300 pixels
  9. Extract colors from image and adds it to the database
* A user cannot upload a wallpaper if it is blocked from it



#### Profile settings page (`/profile/settings`)

Page for changing user settings. This includes both styling (mostly background) and profile picture changes.

* Background setting
  * Ability to change profile styling
  * Is also activated when use logs in later
  * Changes some text, button, table colors as well
    * Created algorithm to see if color is dark or not
* Profile picture setting
  * Display current profile picture
    * Changes when selected new
  * User cannot change profile picture if they are blocked to have one



#### Profile admin page (`/profile/admin`)

Page only accessible for admins and managers. Used to change other users and wallpapers added by other users.

* Users tab:
  * Find users by searching for username
  * Change permissions (user type) for the selected users 
    * Only managers can apply the admin and manager tag
  * Apply button to apply the changes
  * Must be a manager to apply changes to managers or admins
* Wallpapers tab:
  * Find wallpapers by searching for wallpaper id
  * Preview of wallpaper
  * Tags is shown if the wallpaper has any
    * Click on a tag to remove
  * Delete button to delete the wallpaper



#### Other:

* Removed samesite attribute warning.
* Added application/javascript as mimetype for .js files.



## Databases

#### Users database:

Stores information about users. The table contains the following columns:

* username
  * Username of the user
  * Text, primary key
* pwhash
  * Hashed password
  * Text, not null
* type
  * Account type
  * Int, not null
* style
  * Json formatted user style
  * Text
* img
  * Filename of profile image
  * Text
* filters
  * Json formatted browsing filters
  * Text

**Type** contains an binary value that describes the account state and what the user can do on the page:

* **000001:** Add wallpapers
* **000010:** Have profile image
* **000100:** Admin - Manage users
* **001000:** Manager - Manage admins and other managers
* **010000:** Blocked

<table>
    <thead>
        <tr><th>username</th><th>pwhash</th><th>type</th><th>style</th><th>img</th><th>filters</th></tr>
    </thead>
	<tbody>
        <tr><td>joachim</td><td>fa8g97dya9hukasdf</td><td>15</td><td>{"background": "linear-gradient(to right, #ee9ca7, #ffdde1);", "color": "#212529"}</td><td>c1819c17de234221a6924d23e82c103e.jpg</td><td>{"filterRatio": "landscape", "filterColor": null, "filterUploadTime": 7}</td></tr>
    </tbody>
</table>





#### Wallpapers database:

Stores information about animated wallpapers. The table contains the following columns:

* aid
  * Id of the animated wallpaper
  * Int, primary key
* username
  * Username of the user that added the wallpaper.
  * Text, foreign key (*username* users)
* width
  * Wallpaper width
  * Int, not null
* height
  * Wallpaper height
  * Int, not null
* date
  * Date added
  * Timestamp, not null
* views
  * Counted views
  * Int, not null

<table>
    <thead>
        <tr><th>aid</th><th>username</th><th>width</th><th>height</th><th>date</th><th>views</th></tr>
    </thead>
	<tbody>
        <tr><td>1622654307152190</td><td>joachim</td><td>1920</td><td>1080</td><td>2021-06-02 19:18:27.152190</td><td>68</td></tr>
    </tbody>
</table>




#### Likes database:

Stores information about likes on animated wallpapers. The table contains the following columns:

* lid
  * Id of the like
  * Int, primary key
* aid
  * Id of the animated wallpaper
  * Int, foreign key (*aid* wallpapers), not null
* username
  * Username of the user that added the wallpaper.
  * Text, foreign key (*username* users), not null

**aid** and **username** is a multi column *unique constraint*.

<table>
    <thead>
        <tr><th>lid</th><th>aid</th><th>username</th></tr>
    </thead>
	<tbody>
        <tr><td>1</td><td>1622654372395571</td><td>joachim</td></tr>
        <tr><td>2</td><td>1622654307152190</td><td>joachim</td></tr>
    </tbody>
</table>




#### Tags database:

Stores information about the tags for animated wallpapers. The table contains the following columns:

* tag
  * The tag
  * Text, primary key, not null
* aid
  * Id of the animated wallpaper
  * Int, foreign key (*aid* wallpapers), not null

**tag** and **aid** is a multi column *unique constraint*.

<table>
    <thead>
        <tr><th>tag</th><th>aid</th></tr>
    </thead>
	<tbody>
        <tr><td>popcorn</td><td>1622654307152190</td></tr>
        <tr><td>candy</td><td>1622654307152190</td></tr>
        <tr><td>whale</td><td>1622654372395571</td></tr>
    </tbody>
</table>



#### Colors database:

Stores information about the colors for animated wallpapers. The table contains the following columns:

* aid
  * Id of the animated wallpaper
  * Int, primary key, foreign key (*aid* wallpapers)
* color
  * Dominant hex color in wallpaper
  * Text, primary key

<table>
    <thead>
        <tr><th>aid</th><th>color</th></tr>
    </thead>
	<tbody>
        <tr><td>1622654307152190</td><td>#ff0000</td></tr>
        <tr><td>1622654372395571</td><td>#ff00ff</td></tr>
    </tbody>
</table>



