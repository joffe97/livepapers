from typing import List
from flask_login import current_user
from db import add_tag


def get_reply(status: str, msg: str = ""):
    if status not in ["error", "success", "info", "warning"]:
        raise ValueError(f"{status} is not a valid status")
    return {"status": status, "msg": msg}


def only_chars(text: str):
    for i in text:
        if not ("a" <= i <= "z" or "A" <= i <= "Z"):
            return False
    return True


def only_chars_and_nums(text: str):
    for i in text:
        if not ("a" <= i <= "z" or "A" <= i <= "Z" or i.isnumeric()):
            return False
    return True


def validate_and_add_tags(conn, tags: List[str], aid):
    if not isinstance(tags, list) or not isinstance(aid, int):
        return True

    has_failed = False
    for tag in tags:
        tag = tag.lower()
        if not only_chars(tag) or add_tag(conn, tag, aid):
            has_failed = True

    return has_failed
