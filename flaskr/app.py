import flask
import os
import sqlite3
import json

from flask import g, render_template, url_for, request, session
from flask_login import LoginManager, current_user, login_user, login_required, logout_user

from db import get_user, verify_user, verify_and_get_user
from user import User, register_if_valid


DATABASE = os.path.dirname(os.path.realpath(__file__)) + r"\database.db"

app = flask.Flask(__name__)
app.secret_key = "\xba\xf5\x1e\xde\x07:\x1b0/@\x92\xc90#\xdev\xb4\xce\x87\xa7v\xb8\x7f\xbb"
app.config["MAX_CONTENT_LENGTH"] = 128 * (1024 ** 2)

login_manager = LoginManager()
login_manager.init_app(app)


# Log in user
@login_manager.user_loader
def load_user(username: str, password: str = None):
    if password:
        db_user = verify_and_get_user(get_db(), username, password)
    else:
        db_user = get_user(get_db(), username)
    return User(db_user) if db_user else None


# Returns a connection to the database
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


# Closes the connection to the database
def close_db():
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


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
    # return json.dumps({"loggedIn": current_user.is_authenticated})
    is_authenticated = current_user.is_authenticated
    return json.dumps(int(is_authenticated))


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
