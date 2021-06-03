from typing import List
import datetime
from enum import Flag
from db import add_tag


DAYS_IN_MONTH = 365 / 12


# Contains flags for upload times
class UploadedTimes(Flag):
    last_six_hours = 1
    last_day = 2
    last_week = 3
    last_month = 4
    last_three_months = 5
    last_six_months = 6
    last_year = 7

    # Returns datetime from upload times flag
    @staticmethod
    def get_datetime(flag):
        if isinstance(flag, int):
            flag = UploadedTimes(flag)
        now = datetime.datetime.now()

        if flag == UploadedTimes.last_six_hours:
            return now - datetime.timedelta(hours=6)
        elif flag == UploadedTimes.last_day:
            return now - datetime.timedelta(days=1)
        elif flag == UploadedTimes.last_week:
            return now - datetime.timedelta(weeks=1)
        elif flag == UploadedTimes.last_month:
            return now - datetime.timedelta(days=DAYS_IN_MONTH)
        elif flag == UploadedTimes.last_three_months:
            return now - datetime.timedelta(days=3*DAYS_IN_MONTH)
        elif flag == UploadedTimes.last_six_months:
            return now - datetime.timedelta(days=6*DAYS_IN_MONTH)
        elif flag == UploadedTimes.last_year:
            return now - datetime.timedelta(days=365)
        else:
            return None


# Creates a dictionary that can be sent to client containing status and an optional message
def get_reply(status: str, msg: str = ""):
    if status not in ["error", "success", "info", "warning"]:
        raise ValueError(f"{status} is not a valid status")
    return {"status": status, "msg": msg}


# Returns true if all chars in string is big og small letter from A to Z
def only_chars(text: str):
    for i in text:
        if not ("a" <= i <= "z" or "A" <= i <= "Z"):
            return False
    return True


# Returns true if all chars in string is a letter or a number
def only_chars_and_nums(text: str):
    for i in text:
        if not ("a" <= i <= "z" or "A" <= i <= "Z" or i.isdecimal()):
            return False
    return True


# Add list of tags to wallpaper if they are valid
def validate_and_add_tags(conn, tags: List[str], aid):
    if not isinstance(tags, list) or not isinstance(aid, int):
        return True

    has_failed = False
    for tag in tags:
        tag = tag.lower()
        if not only_chars(tag) or add_tag(conn, tag, aid):
            has_failed = True

    return has_failed


# Returns filter variables
def get_filter_vars(args):
    filter_vars = {}

    ratio_str = args.get("ratio", "")
    color_str = args.get("color", "")
    uploadtime_str = args.get("uploadtime", "")
    search_str = args.get("search", "")

    if ratio_str == "portrait":
        filter_vars["ratio"] = (0, 1)
    elif ratio_str == "landscape":
        filter_vars["ratio"] = (1, 0)
    elif "x" in ratio_str:
        ratio_split = ratio_str.split("x")
        try:
            filter_vars["ratio"] = (int(ratio_split[0]), int(ratio_split[1]))
        except ValueError:
            pass

    if len(color_str) == 7 and color_str[0] == "#":
        try:
            int(color_str[1:3], 16)
            int(color_str[3:5], 16)
            int(color_str[5:7], 16)
            filter_vars["color"] = f"#{color_str[1:3]}{color_str[3:5]}{color_str[5:7]}"
        except ValueError:
            pass

    if uploadtime_str.isdecimal():
        uploadtime_temp = UploadedTimes.get_datetime(int(uploadtime_str))

        if uploadtime_temp:
            filter_vars["uploadtime"] = uploadtime_temp

    if search_str:
        filter_vars["search"] = search_str

    return filter_vars
