import flask
import os
import sqlite3
import json

from flask import g, render_template, url_for, request, session
from flask_login import LoginManager, current_user, login_user, login_required, logout_user

from db import get_user, verify_user, verify_and_get_user, get_favorite_ids, get_uploaded_ids, get_wallpaper, \
    get_likes_count_for_wallpaper, get_tags_for_wallpaper, get_users_total_received_stars
from user import User, register_if_valid
from common import get_reply, validate_and_add_tags
from media import handle_media_uri


DATABASE = os.path.dirname(os.path.realpath(__file__)) + r"\database.db"

app = flask.Flask(__name__)
app.secret_key = "\xba\xf5\x1e\xde\x07:\x1b0/@\x92\xc90#\xdev\xb4\xce\x87\xa7v\xb8\x7f\xbb"
app.config["MAX_CONTENT_LENGTH"] = 128 * (1024 ** 2)

login_manager = LoginManager()
login_manager.init_app(app)


# Returns a connection to the database
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    return db


# Closes the connection to the database
def close_db():
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


# Log in user
@login_manager.user_loader
def load_user(username: str, password: str = None) -> User:
    if password:
        db_user = verify_and_get_user(get_db(), username, password)
    else:
        db_user = get_user(get_db(), username)
    return User(db_user) if db_user else None


# Renders index template, which initialize the vue application
@app.route("/")
def home():
    return render_template("index.html")


# Registers the user if ok
@app.route("/doregister", methods=["POST"])
def register():
    credentials = json.loads(request.data)
    username: str = credentials.get("username", None)
    password: str = credentials.get("password", None)
    pw_verify: str = credentials.get("pw_verify", None)

    reply_dict = register_if_valid(get_db(), username, password, pw_verify)
    user = load_user(username, password) if reply_dict.get("status") == "success" else None
    if user:
        login_user(user)
        reply_dict["loggedIn"] = True
    else:
        reply_dict["loggedIn"] = False

    reply_json = json.dumps(reply_dict)
    return reply_json


# Log in the user if right credentials
@app.route("/dologin", methods=["POST"])
def login():
    credentials = json.loads(request.data)
    username: str = credentials.get("username", None)
    password: str = credentials.get("password", None)
    user = load_user(username, password)
    reply_dict = {}
    if user:
        login_user(user)
        reply_dict["loggedIn"] = True
    else:
        reply_dict["loggedIn"] = False

    return json.dumps(reply_dict)


# Log out the user
@app.route("/dologout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return json.dumps({"loggedIn": False})


# Check if the user is logged in
@app.route("/validate", methods=["GET"])
def validate_user():
    return json.dumps({"loggedIn": current_user.is_authenticated})


# Get userdata for current user
#   data:
#       user: Gets username, type and settings
#       uploaded: Gets ids of uploaded wallpapers
#       favorite: Gets ids of favorite wallpapers
#       receivedstars: Gets number of received stars
@app.route("/userdata", methods=["GET"])
@login_required
def get_userdata():
    datatype = request.args.get("data")
    if datatype == "user":
        return json.dumps(current_user.get_dict())
    elif datatype == "uploaded":
        return json.dumps({"uploaded": get_uploaded_ids(get_db(), current_user.username)})
    elif datatype == "favorite":
        return json.dumps({"favorite": get_favorite_ids(get_db(), current_user.username)})
    elif datatype == "receivedstars":
        return json.dumps({"receivedStars": get_users_total_received_stars(get_db(), current_user.username)})
    else:
        return json.dumps({})


# Get wallpaperdata for wallpaper
#   data:
#       None: Gets id, username of uploader, width, height, upload date and views
#       tags: Gets list of tags
#       likes: Gets number of likes on wallpaper
@app.route("/wallpaperdata/<int:aid>", methods=["GET"])
def get_wallpaperdata(aid: int):
    datatype = request.args.get("data")
    if datatype is None:
        return json.dumps(get_wallpaper(get_db(), aid, json_conv=True))
    elif datatype == "tags":
        return json.dumps({"tags": get_tags_for_wallpaper(get_db(), aid)})
    elif datatype == "likes":
        return json.dumps({"likes": get_likes_count_for_wallpaper(get_db(), aid)})
    else:
        return json.dumps({})


# Upload wallpaper
@app.route("/wallpaperdata", methods=["POST"])
@login_required
def add_wallpaper():
    jsdata = json.loads(request.data)
    data = jsdata.get("data")
    tags = jsdata.get("tags")
    if data is None or tags is None:
        return json.dumps(get_reply("error", "Did not receive all necessary data."))
    aid, error = handle_media_uri(get_db(), data)
    if error:
        return json.dumps(get_reply("error", error))
    warning = validate_and_add_tags(get_db(), tags, aid)
    if warning:
        return json.dumps(get_reply("warning", "Couldn't add all tags to wallpaper."))
    return json.dumps(get_reply("success"))


if __name__ == '__main__':
    app.run(debug=True, host="127.0.0.1")
