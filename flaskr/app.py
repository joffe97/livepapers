import os
import sys
import sqlite3
import json
import datetime

from flask import g, render_template, url_for, request, session, Flask
from flask_login import LoginManager, current_user, login_user, login_required, logout_user

import db
from user import User, register_if_valid
from common import get_reply, validate_and_add_tags
from media import handle_media_uri, delete_wallpaper_media


INFINITE_SCROLL = False

DATABASE = os.path.dirname(os.path.realpath(__file__)) + r"\database.db"

app = Flask(__name__)
app.secret_key = "\xba\xf5\x1e\xde\x07:\x1b0/@\x92\xc90#\xdev\xb4\xce\x87\xa7v\xb8\x7f\xbb"
app.config["MAX_CONTENT_LENGTH"] = 128 * (1024 ** 2)

login_manager = LoginManager()
login_manager.init_app(app)


# Returns a connection to the database
def get_db():
    database = getattr(g, '_database', None)
    if database is None:
        database = g._database = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    return database


# Closes the connection to the database
def close_db():
    database = getattr(g, '_database', None)
    if database is not None:
        database.close()


# Log in user
@login_manager.user_loader
def load_user(username: str) -> User:
    db_user = db.get_user(get_db(), username)
    return User(db_user) if db_user else None


def verify_and_load_user(username: str, password: str):
    db_user = db.verify_and_get_user(get_db(), username, password)
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
    user = verify_and_load_user(username, password) if reply_dict.get("status") == "success" else None
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
    user = verify_and_load_user(username, password)
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
        return json.dumps({"uploaded": db.get_uploaded_aids(get_db(), current_user.username)})
    elif datatype == "favorite":
        return json.dumps({"favorite": db.get_favorite_ids(get_db(), current_user.username)})
    elif datatype == "receivedstars":
        return json.dumps({"receivedStars": db.get_users_total_received_stars(get_db(), current_user.username)})
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
        return json.dumps(db.get_wallpaper(get_db(), aid, json_conv=True))
    elif datatype == "tags":
        return json.dumps({"tags": db.get_tags_for_wallpaper(get_db(), aid)})
    elif datatype == "likes":
        return json.dumps({"likes": db.get_likes_count_for_wallpaper(get_db(), aid)})
    else:
        return json.dumps({})


# Upload wallpaper
@app.route("/wallpaperdata", methods=["POST"])
@login_required
def ajax_add_wallpaper():
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
    reply = get_reply("success")
    reply["id"] = aid
    return json.dumps(reply)


# Delete wallpaper and its stars and tags
@app.route("/wallpaperdata/<int:aid>", methods=["DELETE"])
@login_required
def ajax_delete_wallpaper(aid: int):
    error = db.delete_wallpaper_likes_tags(get_db(), aid)
    if error:
        return json.dumps(get_reply("error"))
    delete_wallpaper_media(aid)
    return json.dumps(get_reply("success"))


# Add tag to wallpaper
@app.route("/wallpaperdata/<int:aid>/tags", methods=["POST"])
@login_required
def ajax_add_tag(aid: int):
    jsdata = json.loads(request.data)
    tag = jsdata.get("tag")
    error = validate_and_add_tags(get_db(), [tag], aid)
    reply = get_reply("success") if not error else get_reply("error", "Couldn't add tag to wallpaper.")
    return json.dumps(reply)


# Remove tag from wallpaper
@app.route("/wallpaperdata/<int:aid>/tags/<string:tag>", methods=["DELETE"])
@login_required
def ajax_delete_tag(aid: int, tag: str):
    if not db.is_wallpapers_owner(get_db(), aid, current_user.username):
        return get_reply("error", "Cannot remove tags for this wallpaper.")
    error = db.delete_tag(get_db(), tag, aid)
    reply = get_reply("success") if not error else get_reply("error", "Couldn't remove tag from wallpaper.")
    return json.dumps(reply)


# Increment views on wallpaper
@app.route("/wallpaperdata/<int:aid>/views", methods=["PUT"])
def increment_views(aid: int):
    error = db.increment_wallpaper_views(get_db(), aid)
    reply = get_reply("success") if not error else get_reply("error")
    return json.dumps(reply)


# Remove wallpaper from current users favorites
@app.route("/userdata/favorites/<int:aid>", methods=["DELETE"])
@login_required
def ajax_delete_favorite(aid: int):
    error = db.delete_like(get_db(), aid, current_user.username)
    reply = get_reply("success") if not error else get_reply("error")
    return json.dumps(reply)


# Add wallpaper to current users favorites
@app.route("/userdata/favorites", methods=["POST"])
@login_required
def ajax_add_favorite():
    jsdata = json.loads(request.data)
    aid = jsdata.get("wpId")
    if not aid or not db.wallpaper_exists(get_db(), aid):
        return json.dumps(get_reply("error"))
    error = db.add_like(get_db(), aid, current_user.username)
    reply = get_reply("success") if not error else get_reply("error")
    return json.dumps(reply)


# Returns wallpapers when the infinite_scroll parameter is set
def infinite_scroll_func(func, count):
    return_list = []
    while len(return_list) < count:
        wps = func(get_db(), count=count)
        if len(wps) == 0:
            break
        return_list.extend(wps)
    if len(return_list) >= count:
        return_list = return_list[:count]
    return json.dumps(return_list[:(count if len(return_list) >= count else -0)])


# Returns latest wallpapers that's not yet received
@app.route("/wallpapers/latest", methods=["GET"])
def get_latest_wallpapers():
    from_ms = request.args.get("fms")
    count_str = request.args.get("count", "24")
    from_datetime = None

    if from_ms and from_ms.isdecimal():
        time = int(from_ms) / 1000.0
        try:
            from_datetime = datetime.datetime.fromtimestamp(time)
        except OSError:
            pass

    if not count_str.isdecimal():
        count = 24
    else:
        count = int(count_str)

    if INFINITE_SCROLL:  # Only for testing
        return infinite_scroll_func(db.get_latest_wallpapers, count)

    return json.dumps(db.get_latest_wallpapers(get_db(), from_datetime, count))


# Returns most liked wallpapers that's not yet received
@app.route("/wallpapers/mostliked", methods=["GET"])
def get_mostliked_wallpapers():
    stars_str = request.args.get("stars", "")
    aids = request.args.get("wpids", "")
    count_str = request.args.get("count", "24")

    aid_list = []
    for aid in aids.split(","):
        if aid and aid.isdecimal():
            aid_list.append(int(aid))

    if not stars_str.isdecimal():
        stars = None
    else:
        stars = int(stars_str)

    if not count_str.isdecimal():
        count = 24
    else:
        count = int(count_str)

    if INFINITE_SCROLL:  # Only for testing
        return infinite_scroll_func(db.get_mostliked_wallpapers, count)

    return json.dumps(db.get_mostliked_wallpapers(get_db(), stars, aid_list, count))


if __name__ == '__main__':
    for arg in sys.argv:
        if arg == "-infinite_scroll":
            INFINITE_SCROLL = True
    app.run(debug=True, host="0.0.0.0")
