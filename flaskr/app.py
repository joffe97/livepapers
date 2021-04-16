import flask
import os
import sqlite3

from flask import g, render_template, url_for, request


DATABASE = os.path.dirname(os.path.realpath(__file__)) + r"\database.db"

app = flask.Flask(__name__)
app.secret_key = "\xba\xf5\x1e\xde\x07:\x1b0/@\x92\xc90#\xdev\xb4\xce\x87\xa7v\xb8\x7f\xbb"
app.config["MAX_CONTENT_LENGTH"] = 128 * (1024 ** 2)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def close_db():
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True)
