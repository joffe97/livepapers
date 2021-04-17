import flask
import os
import sqlite3
import json

from flask import g, render_template, url_for, request
from flask_login import LoginManager, current_user

from db import get_user, verify_user


DATABASE = os.path.dirname(os.path.realpath(__file__)) + r"\database.db"

app = flask.Flask(__name__)
app.secret_key = "\xba\xf5\x1e\xde\x07:\x1b0/@\x92\xc90#\xdev\xb4\xce\x87\xa7v\xb8\x7f\xbb"
app.config["MAX_CONTENT_LENGTH"] = 128 * (1024 ** 2)

login_manager = LoginManager()
login_manager.init_app(app)


# Log in user
@login_manager.user_loader
def load_user(username: str):
    user = get_user(get_db(), username)
    user.pop("pwhash")
    return user


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


# Log in the user if right credentials
@app.route("/dologin", methods=["POST"])
def login():
    credentials = json.loads(request.data)
    username: str = credentials.get("username", None)
    password: str = credentials.get("password", None)
    print(credentials)
    is_verified = verify_user(get_db(), username, password)
    if not is_verified:
        return json.dumps(0)
    load_user(username)
    return json.dumps(1)


if __name__ == '__main__':
    app.run(debug=True)
