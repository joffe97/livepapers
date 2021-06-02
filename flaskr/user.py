import json
from common import get_reply, only_chars_and_nums
from db import user_exist, add_user


LEGAL_PW_CHARS = '"' + r" !#$%&'()*+,-./:;<=>?@[\]^_`{|}~"


class User:
    def __init__(self, db_user):
        self.username = db_user["username"]
        self.type = db_user["type"]
        self.style = db_user["style"]
        self.img = db_user["img"]
        self.filters = db_user["filters"]
        self.is_authenticated = True

    def is_active(self):
        return True

    def get_id(self):
        return self.username

    def is_authenticated(self):
        return self.is_authenticated

    def is_anonymous(self):
        return False

    def get_dict(self):
        return {"username": self.username, "type": self.type, "style": self.style, "img": self.img, "filters": self.filters}


# Verifies the registration
def register_if_valid(conn, username: str, password: str, pw_verify: str):
    if len(username) < 3:
        return get_reply("error", "Username is too short.")
    if len(username) > 20:
        return get_reply("error", "Username is too long.")
    if not only_chars_and_nums(username):
        return get_reply("error", "Username contains prohibited characters.")
    if not only_chars_and_nums([char for char in password if char not in LEGAL_PW_CHARS]):
        return get_reply("error", "Password contains prohibited characters.")
    if len(password) < 12:
        return get_reply("error", "Password is too short.")
    if password != pw_verify:
        return get_reply("error", "Passwords does not match.")
    if user_exist(conn, username):
        return get_reply("error", "Username is taken.")

    if add_user(conn, username, password) is not None:
        return get_reply("error", "An unknown error occured.")

    return get_reply("success")
