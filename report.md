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

  <div style="page-break-after: always; break-after: page;"></div>

## Databases

#### Users database:

Stores information about users. The table contains the following columns:

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
<div style="page-break-after: always; break-after: page;"></div>

## Screenshots

##### Browse page:

![screenshot_browse](\assets\screenshot_browse.JPG)



##### Wallpaper page:

![screenshot_wallpaper](\assets\screenshot_wallpaper.png)

