# Livepapers - web programming exam project
**Livepapers** is a webpage developed by Joachim Andreassen as a exam project in the web programming course. The purpose of this webpage is to provide animated wallpapers to users. Animated wallpapers can be put to use using <a href="https://rocksdanister.github.io/lively/#three">Lively Wallpaper</a>, or other similar software.



## Features

* Browse page where the user can browse animated wallpapers.
  * Shows static images first, which changes to video of the wallpaper on hover.
  * Sort by *latest*, *most liked* and *random*.
  * Searchable by tags, colors and uploader.
  * Filter by date, views, ratio, width and height.
* Wallpaper page where the user can view the animated wallpaper and info about it.
  * Button to download the wallpaper.
  * Button to favorite the wallpaper, if logged in.
* Settings page for users not logged in.
  * Settings is stored in cookie.
* Profile page where the user can view user information.
  * Ability to upload animated wallpaper.
  * Ability to remove wallpapers uploaded by current user.
  * Change user settings.
    * Settings stored in database as json.
  * View uploaded wallpapers and favorited wallpapers.
  * Admin and manager settings.
    * Admins and managers can delete wallpapers and block users.
    * Managers can delete wallpapers for all users (including admins and managers), and block all kinds of users.
* Implemented flask login.



## Technical

**How to run:**  run `python3 app.py` from the `./flaskr` directory.

**Python version:** 3.8

**Python packages:** See requrements.txt

**Style:** Bootstrap (bsstyle.css) and custom css (style.css)



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
* settings
  * Json formatted user settings
  * Text

**Type** contains an binary value that describes the account state and what the user can do on the page:

* **000001:** Add wallpapers
* **000010:** Remove wallpapers
* **000100:** Admin - Manage users
* **001000:** Manager - Manage admins
* **010000:** Blocked

<table>
    <thead>
        <tr><th>username</th><th>pwhash</th><th>type</th><th>settings</th></tr>
    </thead>
	<tbody>
        <tr><td>joachim</td><td>fa8g97dya9hukasdf</td><td>15</td><td>{"color": "dark"}</td></tr>
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
  * Date, not null
* views
  * Counted views
  * Int, not null

<table>
    <thead>
        <tr><th>aid</th><th>username</th><th>width</th><th>height</th><th>date</th><th>views</th></tr>
    </thead>
	<tbody>
        <tr><td>1</td><td>joachim</td><td>1920</td><td>1080</td><td>14.04.21</td><td>68</td></tr>
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
        <tr><td>1</td><td>2</td><td>joachim</td></tr>
        <tr><td>2</td><td>1</td><td>joachim</td></tr>
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
        <tr><td>popcorn</td><td>2</td></tr>
        <tr><td>candy</td><td>2</td></tr>
        <tr><td>whale</td><td>1</td></tr>
    </tbody>
</table>


## Screenshots

##### Browse page:

![screenshot_browse](\assets\screenshot_browse.JPG)



##### Wallpaper page:

![screenshot_wallpaper](\assets\screenshot_wallpaper.png)

