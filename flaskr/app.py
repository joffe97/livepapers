import os
import sys
import sqlite3
import json
import datetime
import mimetypes

from flask import g, render_template, request, Flask, jsonify, abort
from flask_login import LoginManager, current_user, login_user, login_required, logout_user

import db
from user import User, register_if_valid
from common import get_reply, validate_and_add_tags, get_filter_vars
from media import handle_media_uri_wallpaper, delete_wallpaper_media, handle_media_uri_profileimg

mimetypes.add_type("application/javascript", ".js")

INFINITE_SCROLL = False

DATABASE = os.path.dirname(os.path.realpath(__file__)) + r"\database.db"

app = Flask(__name__)
app.secret_key = "\xba\xf5\x1e\xde\x07:\x1b0/@\x92\xc90#\xdev\xb4\xce\x87\xa7v\xb8\x7f\xbb"
app.config["MAX_CONTENT_LENGTH"] = 128 * (1024 ** 2)
app.config["SESSION_COOKIE_SECURE"] = True

login_manager = LoginManager()
login_manager.init_app(app)


# Returns a connection to the database
def get_db():
    database = getattr(g, '_database', None)
    if database is None:
        database = g._database = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
        db.init_functions(database)
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

    return reply_dict


# Log in the user if right credentials
@app.route("/dologin", methods=["POST"])
def login():
    credentials = json.loads(request.data)
    username: str = credentials.get("username", None)
    password: str = credentials.get("password", None)
    user = verify_and_load_user(username, password)
    if user:
        login_user(user)
        reply_dict = user.get_dict()
    else:
        reply_dict = {}

    return reply_dict


# Log out the user
@app.route("/dologout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return {"loggedIn": False}


# Check if the user is logged in
@app.route("/validate", methods=["GET"])
def validate_user():
    return {"loggedIn": current_user.is_authenticated}


# Gets username, type and settings
@app.route("/userdata/user", methods=["GET"])
def get_user():
    if not current_user or not current_user.is_authenticated:
        return {}
    return current_user.get_dict()


# Gets ids of uploaded wallpapers
@app.route("/userdata/uploaded", methods=["GET"])
@login_required
def get_user_uploaded():
    return {"uploaded": db.get_uploaded_aids(get_db(), current_user.username)}


# Gets ids of favorite wallpapers
@app.route("/userdata/favorites", methods=["GET"])
@login_required
def get_user_favorite():
    return {"favorite": db.get_favorite_ids(get_db(), current_user.username)}


# Gets number of received stars
@app.route("/userdata/receivedstars", methods=["GET"])
@login_required
def get_user_received_stars():
    return {"receivedStars": db.get_users_total_received_stars(get_db(), current_user.username)}


# Update style for user
@app.route("/userdata/style", methods=["PUT"])
@login_required
def update_style():
    jsdata = json.loads(request.data)
    style_dict = jsdata.get("style")
    style = json.dumps(style_dict)
    if style == current_user.style:
        return get_reply("success")
    error = db.update_style(get_db(), current_user.username, style)
    if error:
        return get_reply("error")
    return get_reply("success")


# Update profile picture
@app.route("/userdata/img", methods=["PUT"])
@login_required
def update_profile_img():
    jsdata = json.loads(request.data)
    img = jsdata.get("img")
    if img is None:
        return get_reply("error", "Did not receive all necessary data.")

    imgname, error = handle_media_uri_profileimg(get_db(), img)
    if error:
        reply = get_reply("error", error)
    else:
        reply = get_reply("success")
        reply["img"] = imgname
    return reply


# Update profile picture
@app.route("/userdata/filters", methods=["PUT"])
@login_required
def update_filters():
    jsdata = json.loads(request.data)
    filters_dict = jsdata.get("filters")
    filters = json.dumps(filters_dict)
    if filters == current_user.filters:
        return get_reply("success")
    error = db.update_filters(get_db(), current_user.username, filters)
    if error:
        return get_reply("error")
    return get_reply("success")


@app.route("/allusers/<string:username>/data", methods=["GET"])
@login_required
def get_user_by_username(username: str):
    if not current_user.type & (db.UserType.ADMIN | db.UserType.MANAGER):
        return abort(403)

    user = db.get_user(get_db(), username)
    if not user:
        return {}

    if (user.get("type", 0) & (db.UserType.MANAGER | db.UserType.ADMIN)
        and not current_user.type & db.UserType.MANAGER) or \
            current_user.username == user.get("username"):
        return abort(403)
    return user


@app.route("/allusers/<string:username>/type", methods=["PUT"])
def update_user_type(username: str):
    jsdata = json.loads(request.data)
    new_type = jsdata.get("type", None)
    if not isinstance(new_type, int):
        return get_reply("error")

    if not current_user.type & (db.UserType.ADMIN | db.UserType.MANAGER):
        return abort(403)

    user = db.get_user(get_db(), username)
    if not user:
        return get_reply("error")

    if (user.get("type", 0) & (db.UserType.MANAGER | db.UserType.ADMIN)
        and not current_user.type & db.UserType.MANAGER) or \
            current_user.username == user.get("username"):
        return abort(403)

    error = db.update_type(get_db(), username, new_type)
    return get_reply("error" if error else "success")


# Gets id, username of uploader, width, height, upload date and views for wallpaper
@app.route("/wallpaperdata/<int:aid>", methods=["GET"])
def get_wallpaper(aid: int):
    wp = db.get_wallpaper(get_db(), aid, json_conv=True)
    return wp if wp else {}


# Gets list of tags for wallpaper
@app.route("/wallpaperdata/<int:aid>/tags", methods=["GET"])
def get_wallpaper_tags(aid: int):
    return {"tags": db.get_tags_for_wallpaper(get_db(), aid)}


# Gets number of likes on wallpaper
@app.route("/wallpaperdata/<int:aid>/likes", methods=["GET"])
def get_wallpaper_likes(aid: int):
    return {"likes": db.get_likes_count_for_wallpaper(get_db(), aid)}


# Upload wallpaper
@app.route("/wallpaperdata", methods=["POST"])
@login_required
def ajax_add_wallpaper():
    jsdata = json.loads(request.data)
    data = jsdata.get("data")
    tags = jsdata.get("tags")
    if data is None or tags is None:
        return get_reply("error", "Did not receive all necessary data.")
    aid, error = handle_media_uri_wallpaper(get_db(), data)
    if error:
        return get_reply("error", error)
    warning = validate_and_add_tags(get_db(), tags, aid)
    if warning:
        return get_reply("warning", "Couldn't add all tags to wallpaper.")
    reply = get_reply("success")
    reply["id"] = aid
    return reply


# Delete wallpaper and its stars and tags
@app.route("/wallpaperdata/<int:aid>", methods=["DELETE"])
@login_required
def ajax_delete_wallpaper(aid: int):
    error = db.delete_wallpaper_likes_tags_colors(get_db(), aid)
    if error:
        return get_reply("error")
    delete_wallpaper_media(aid)
    return get_reply("success")


# Add tag to wallpaper
@app.route("/wallpaperdata/<int:aid>/tags", methods=["POST"])
@login_required
def ajax_add_tag(aid: int):
    jsdata = json.loads(request.data)
    tag = jsdata.get("tag")
    error = validate_and_add_tags(get_db(), [tag], aid)
    return get_reply("success") if not error else get_reply("error", "Couldn't add tag to wallpaper.")


# Remove tag from wallpaper
@app.route("/wallpaperdata/<int:aid>/tags/<string:tag>", methods=["DELETE"])
@login_required
def ajax_delete_tag(aid: int, tag: str):
    if not db.is_wallpapers_owner(get_db(), aid, current_user.username):
        return get_reply("error", "Cannot remove tags for this wallpaper.")
    error = db.delete_tag(get_db(), tag, aid)
    return get_reply("success") if not error else get_reply("error", "Couldn't remove tag from wallpaper.")


# Increment views on wallpaper
@app.route("/wallpaperdata/<int:aid>/views", methods=["PUT"])
def increment_views(aid: int):
    error = db.increment_wallpaper_views(get_db(), aid)
    return get_reply("success") if not error else get_reply("error")


# Remove wallpaper from current users favorites
@app.route("/userdata/favorites/<int:aid>", methods=["DELETE"])
@login_required
def ajax_delete_favorite(aid: int):
    error = db.delete_like(get_db(), aid, current_user.username)
    return get_reply("success") if not error else get_reply("error")


# Add wallpaper to current users favorites
@app.route("/userdata/favorites", methods=["POST"])
@login_required
def ajax_add_favorite():
    jsdata = json.loads(request.data)
    aid = jsdata.get("wpId")
    if not aid or not db.wallpaper_exists(get_db(), aid):
        return get_reply("error")
    error = db.add_like(get_db(), aid, current_user.username)
    return get_reply("success") if not error else get_reply("error")


# Returns wallpapers when the infinite_scroll parameter is set
def infinite_scroll_func(func, count, filters):
    return_list = []
    while len(return_list) < count:
        wps = func(get_db(), count=count, filters=filters)
        if len(wps) == 0:
            break
        return_list.extend(wps)
    if len(return_list) >= count:
        return_list = return_list[:count]
    return jsonify(return_list)


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

    filters = get_filter_vars(request.args)

    if INFINITE_SCROLL:  # Only for testing
        return infinite_scroll_func(db.get_latest_wallpapers, count, filters)

    return jsonify(db.get_latest_wallpapers(get_db(), from_datetime, count, filters))


# Returns most liked wallpapers that's not yet received
@app.route("/wallpapers/mostliked", methods=["GET"])
def get_mostliked_wallpapers():
    stars_str = request.args.get("stars", "")
    aid_str = request.args.get("wpid", "")
    count_str = request.args.get("count", "24")

    if not stars_str.isdecimal():
        stars = None
    else:
        stars = int(stars_str)

    if not aid_str.isdecimal():
        aid = None
    else:
        aid = int(aid_str)

    if not count_str.isdecimal():
        count = 24
    else:
        count = int(count_str)

    filters = get_filter_vars(request.args)

    if INFINITE_SCROLL:  # Only for testing
        return infinite_scroll_func(db.get_mostliked_wallpapers, count, filters)

    return jsonify(db.get_mostliked_wallpapers(get_db(), stars, aid, count, filters))


# Returns random wallpapers that's not yet received
@app.route("/wallpapers/random", methods=["GET"])
def get_random_wallpapers():
    seed_str = request.args.get("seed", "")
    received_str = request.args.get("received")
    count_str = request.args.get("count")

    if not seed_str.isdecimal():
        seed_str = "1234"
    if not received_str or not received_str.isdecimal():
        received_str = "0"
    if not count_str or not count_str.isdecimal():
        count_str = "24"

    seed = int(seed_str)
    received = int(received_str)
    count = int(count_str)

    filters = get_filter_vars(request.args)

    if INFINITE_SCROLL:
        return infinite_scroll_func(db.get_random_wallpapers, count, filters)

    return jsonify(db.get_random_wallpapers(get_db(), seed, received, count, filters))


if __name__ == '__main__':
    for arg in sys.argv:
        if arg == "-infinite_scroll":
            INFINITE_SCROLL = True

    app.run(debug=True, host="0.0.0.0")
