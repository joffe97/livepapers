# Livepapers - Web programming exam project
**Livepapers** is a webpage developed by Joachim Andreassen as a exam project in the web programming course. The purpose of this webpage is to provide animated wallpapers to users. Animated wallpapers can be put to use using <a href="https://rocksdanister.github.io/lively/#three">Lively Wallpaper</a>, or other similar software.



## Databases

#### User database:

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

**Type** contains an binary value that describes the account state and what the user can do on the page:

* **000001:** Add wallpapers
* **000010:** Remove wallpapers
* **000100:** Admin - Manage users
* **001000:** Manager - Manage admins
* **010000:** Blocked

<table>
    <thead>
        <tr><th>username</th><th>pwhash</th><th>type</th></tr>
    </thead>
	<tbody>
        <tr><td>joachim</td><td>fa8g97dya9hukasdf</td><td>15</td></tr>
    </tbody>
</table>



#### Wallpaper database:

Stores information about animated wallpapers. The table contains the following columns:

* aid
  * Id of the animated wallpaper
  * Int, primary key
* username
  * Username of the user that added the wallpaper.
  * Text, foreign key (*username* user)
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



#### Like database:

Stores information about likes on animated wallpapers. The table contains the following columns:

* lid
  * Id of the like
  * Int, primary key
* aid
  * Id of the animated wallpaper
  * Int, foreign key (*aid* wallpaper), not null
* username
  * Username of the user that added the wallpaper.
  * Text, foreign key (*username* user), not null

<table>
    <thead>
        <tr><th>lid</th><th>aid</th><th>username</th></tr>
    </thead>
	<tbody>
        <tr><td>1</td><td>2</td><td>joachim</td></tr>
        <tr><td>2</td><td>2</td><td>joachim</td></tr>
    </tbody>
</table>

