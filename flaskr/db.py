import sqlite3
import datetime
from sqlite3 import Error, Cursor, Connection
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Dict, Union, Tuple
from math import gcd

from db_common import get_select_query_filter


DATABASE = "./database.db"


# Class containing usertype flags
class UserType:
    WP_ADD = 1          # Add wallpapers
    PROFILE_IMG = 1 << 1     # Have profile image
    ADMIN = 1 << 2      # Manage users and userdata (except of admins and managers)
    MANAGER = 1 << 3    # Manage all users and userdata
    BLOCKED = 1 << 4    # Blocked user


# --------------- Queries ---------------

# Sql query for creating users table
CREATE_USERS_TABLE = f"""CREATE TABLE IF NOT EXISTS users (
                          username TEXT,
                          pwhash TEXT NOT NULL,
                          type INTEGER NOT NULL DEFAULT {UserType.WP_ADD | UserType.PROFILE_IMG},
                          style TEXT DEFAULT NULL,
                          img TEXT DEFAULT NULL,
                          filters TEXT DEFAULT NULL,
                          PRIMARY KEY (username),
                          CONSTRAINT uc_img UNIQUE (img)
                        );"""

# Sql query for creating wallpapers table
CREATE_WALLPAPERS_TABLE = """CREATE TABLE IF NOT EXISTS wallpapers (
                               aid INTEGER,
                               username TEXT,
                               width INTEGER NOT NULL,
                               height INTEGER NOT NULL,
                               date TIMESTAMP NOT NULL,
                               views INTEGER NOT NULL DEFAULT 0,
                               PRIMARY KEY (aid),
                               FOREIGN KEY (username) REFERENCES users (username)
                             );"""

# Sql query for creating likes table
CREATE_LIKES_TABLE = """CREATE TABLE IF NOT EXISTS likes (
                          lid INTEGER,
                          aid INTEGER NOT NULL,
                          username INTEGER NOT NULL,
                          PRIMARY KEY (lid),
                          FOREIGN KEY (aid) REFERENCES wallpapers (aid),
                          FOREIGN KEY (username) REFERENCES users (username),
                          CONSTRAINT uc_like UNIQUE (aid, username)
                        );"""

# Sql query for creating tags table
CREATE_TAGS_TABLE = """CREATE TABLE IF NOT EXISTS tags (
                          tag TEXT NOT NULL,
                          aid INTEGER NOT NULL,
                          PRIMARY KEY (tag, aid),
                          FOREIGN KEY (aid) REFERENCES wallpapers (aid)
                        );"""

# Sql query for creating colors table
CREATE_COLORS_TABLE = """CREATE TABLE IF NOT EXISTS colors (
                            aid INTEGER,
                            color TEXT,
                            PRIMARY KEY (aid, color),
                            FOREIGN KEY (aid) REFERENCES wallpapers (aid)
                         )"""


# --------------- Common ---------------

# Establishes a connection to the database
def create_connection(database: str) -> Connection:
    conn = None
    try:
        conn = sqlite3.connect(database)
        return conn
    except Error as e:
        print(e)

    return conn


# Creates the given table
def create_table(conn: Connection, query: str) -> int:
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        return 1
    except Error as e:
        print(e)
    return 0


# --------------- Users ---------------

# Adds user to the database
def add_user(conn, username: str, password: str, usertype: int = 3):
    try:
        cur: Cursor = conn.cursor()
        query = "INSERT INTO users VALUES (?,?,?,?,?,?)"
        pw_hash = generate_password_hash(password)
        cur.execute(query, (username.lower(), pw_hash, usertype, None, None, None))
        conn.commit()
        return None
    except Error as e:
        print(e)
        return e


# Get user from the database
def get_user(conn, username: str) -> Dict[str, Union[str, int]]:
    cur: Cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username=?"
    cur.execute(query, (username.lower(),))
    row = cur.fetchone()
    return {"username": row[0], "pwhash": row[1], "type": row[2], "style": row[3], "img": row[4], "filters": row[5]} \
        if row else None


# Checks if user exists
def user_exist(conn, username: str):
    cur: Cursor = conn.cursor()
    query = "SELECT username FROM users WHERE LOWER(username)=LOWER(?)"
    cur.execute(query, (username.lower(),))
    row = cur.fetchone()
    return row is not None


# Verify user and returns user
def verify_and_get_user(conn, username: str, password: str) -> Tuple[Union[Dict[str, Union[str, int]], None], str]:
    user = get_user(conn, username)
    if user is None:
        return None, "User doesn't exist."
    pwhash = user.get("pwhash", None)
    if pwhash is None or check_password_hash(pwhash, password) is False:
        return None, "Wrong password."
    return user, ""


# Verify user
def verify_user(conn, username: str, password: str) -> bool:
    user, _ = verify_and_get_user(conn, username, password)
    return bool(user)


# Update style
def update_style(conn, username, style):
    try:
        cur: Cursor = conn.cursor()
        query = "UPDATE users SET style=? WHERE username=?"
        cur.execute(query, (style, username.lower()))
        conn.commit()
        return None
    except Error as e:
        print(e)
        return e


# Update image
def update_img(conn, username, img):
    try:
        cur: Cursor = conn.cursor()
        query = "UPDATE users SET img=? WHERE username=?"
        cur.execute(query, (img, username.lower()))
        conn.commit()
        return None
    except Error as e:
        print(e)
        return e


# Update filters
def update_filters(conn, username, filters):
    try:
        cur: Cursor = conn.cursor()
        query = "UPDATE users SET filters=? WHERE username=?"
        cur.execute(query, (filters, username.lower()))
        conn.commit()
        return None
    except Error as e:
        print(e)
        return e


# Update type
def update_type(conn, username, new_type):
    try:
        cur: Cursor = conn.cursor()
        query = "UPDATE users SET type=? WHERE username=?"
        cur.execute(query, (new_type, username.lower()))
        conn.commit()
        return None
    except Error as e:
        print(e)
        return e


# --------------- Wallpapers ---------------

# Adds wallpaper to the database
# Returns aid of added row, if return_id is True
def add_wallpaper(conn, username: str,
                  width: int,
                  height: int,
                  date: datetime.datetime = None,
                  views: int = 0,
                  return_id: bool = False) -> Union[int, None]:
    if not date:
        date = datetime.datetime.now()
    try:
        cur: Cursor = conn.cursor()
        aid = int(date.timestamp() * 1000000)
        query = "INSERT INTO wallpapers VALUES (?,?,?,?,?,?)"
        cur.execute(query, (aid, username.lower(), width, height, date, views))
        conn.commit()
        return aid if return_id else None
    except Error as e:
        print(e)
        return None


# Gets wallpaper from database
def get_wallpaper(conn, aid, json_conv=False):
    cur = conn.cursor()
    query = "SELECT * FROM wallpapers WHERE aid=?"
    cur.execute(query, (aid,))
    row = cur.fetchone()
    if row:
        datestr = int(row[4].timestamp() * 1000) if json_conv else row[4]  # If json_conv: Milliseconds since Jan 1 1970
        return {"aid": row[0], "username": row[1], "width": row[2], "height": row[3], "date": datestr, "views": row[5]}
    else:
        return None


# Deletes wallpaper from database
def delete_wallpaper(conn, aid):
    try:
        cur = conn.cursor()
        query = "DELETE FROM wallpapers WHERE aid=?"
        cur.execute(query, (aid,))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Returns list of ids of uploaded wallpapers by user
def get_uploaded_aids(conn, username: str):
    cur = conn.cursor()
    query = "SELECT aid FROM wallpapers WHERE username=?"
    cur.execute(query, (username.lower(),))
    id_list = []
    for row in cur:
        id_list.append(row[0])
    return id_list


# Increament views for wallpaper
def increment_wallpaper_views(conn, aid: int):
    try:
        cur = conn.cursor()
        query = "UPDATE wallpapers SET views=views+1 WHERE aid=?"
        cur.execute(query, (aid,))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Checks if the username is the wallpapers uploader
def is_wallpapers_owner(conn, aid, username: str):
    wp = get_wallpaper(conn, aid)
    return wp.get("username") == username.lower()


# Checks if the wallpaper exists
def wallpaper_exists(conn, aid):
    return get_wallpaper(conn, aid) is not None


# Gets latest wallpapers
# Parameters:
#   fromdate: Returns latest wallpapers after this date. Defaults to now.
#   count: Returns 'count' numbers of wallpapers. Defaults to 24.
def get_latest_wallpapers(conn, fromdate: datetime.datetime = None, count=24, filters=None):
    if fromdate is None:
        fromdate = datetime.datetime.now()
    if filters is None:
        filters = {}

    query, args = get_select_query_filter(filters)
    args.extend((fromdate, count))

    cur = conn.cursor()
    query = f"SELECT * FROM (SELECT * FROM ({query}) ORDER BY date DESC) WHERE date < ? LIMIT ?"
    cur.execute(query, tuple(args))

    returnlist = []
    for row in cur:
        datestr = int(row[4].timestamp() * 1000)
        returnlist.append({"aid": row[0], "username": row[1], "width": row[2], "height": row[3], "date": datestr, "views": row[5]})
    return returnlist


# Gets most liked wallpapers
# Parameters:
#   stars: Number of stars to search from. Defaults to 999_999_999_999.
#   staraids: Excludeds these wallpapers. Defaults to [].
#   count: Returns 'count' numbers of wallpapers. Defaults to 24.
def get_mostliked_wallpapers(conn, stars: int = None, fromaid: int = None, count=24, filters=None):
    if stars is None:
        stars = 999_999_999_999
    if fromaid is None:
        fromaid = 0
    if filters is None:
        filters = {}

    query, args = get_select_query_filter(filters)
    args.extend((stars, fromaid, stars, count))

    cur = conn.cursor()
    query = f"""SELECT * 
                FROM ({query}) w
                LEFT JOIN (SELECT aid, count(lid) AS stars
                            FROM likes
                            GROUP BY aid) m
                ON w.aid = m.aid
                WHERE (IFNULL(stars, 0) = ? AND w.aid > ?)
                OR IFNULL(stars, 0) < ?
                ORDER BY stars DESC, w.aid
                LIMIT ?
                """
    cur.execute(query, tuple(args))

    returnlist = []
    for row in cur:
        datestr = int(row[4].timestamp() * 1000)
        returnlist.append({"aid": row[0], "username": row[1], "width": row[2], "height": row[3], "date": datestr,
                           "views": row[5], "stars": row[7] if row[7] else 0})
    return returnlist


# Gets random wallpapers
# Parameters:
#   seed: Seed to use when sorting random.
#   received: Number of wallpapers already received. Defaults to 24.
#   count: Returns 'count' numbers of wallpapers. Defaults to 24.
def get_random_wallpapers(conn, seed: int = 1234, received: int = 0, count=24, filters=None):
    if filters is None:
        filters = {}

    query, args = get_select_query_filter(filters)
    args.extend((seed, received, count))

    cur = conn.cursor()
    query = f"""SELECT * FROM ({query}) w
                ORDER BY substr(w.aid * ?, length(w.aid) + 2)
                LIMIT ?, ?
                """
    cur.execute(query, tuple(args))

    returnlist = []
    for row in cur:
        datestr = int(row[4].timestamp() * 1000)
        returnlist.append({"aid": row[0], "username": row[1], "width": row[2], "height": row[3], "date": datestr, "views": row[5]})
    return returnlist


# --------------- Likes ---------------

# Adds a like to a wallpaper to the database
def add_like(conn, aid: int, username: str):
    try:
        cur: Cursor = conn.cursor()
        query = "INSERT INTO likes (aid, username) VALUES (?,?)"
        cur.execute(query, (aid, username.lower()))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Delete a like from a wallpaper
def delete_like(conn, aid: int, username: str):
    try:
        cur = conn.cursor()
        query = "DELETE FROM likes WHERE aid=? AND username=?"
        cur.execute(query, (aid, username.lower()))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Get like from database
def get_likes_count_for_wallpaper(conn, aid: int):
    cur = conn.cursor()
    query = "SELECT COUNT(lid) FROM likes WHERE aid=?"
    cur.execute(query, (aid,))
    result = cur.fetchone()
    return result[0] if result else None


# Delete all likes from wallpaper
def delete_likes_for_wallpaper(conn, aid: int):
    try:
        cur = conn.cursor()
        query = "DELETE FROM likes WHERE aid=?"
        cur.execute(query, (aid,))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Returns list of ids of favorite wallpapers by user
def get_favorite_ids(conn, username: str):
    cur = conn.cursor()
    query = "SELECT aid FROM likes WHERE username=?"
    cur.execute(query, (username.lower(),))
    id_list = []
    for row in cur:
        id_list.append(row[0])
    return id_list


# --------------- Tags ---------------

# Adds a like to a wallpaper to the database
def add_tag(conn, tag: str, aid: int):
    try:
        cur: Cursor = conn.cursor()
        query = "INSERT INTO tags (tag, aid) VALUES (?,?)"
        cur.execute(query, (tag.lower(), aid))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Delete tag from wallpaper
def delete_tag(conn, tag: str, aid: int):
    try:
        cur = conn.cursor()
        query = "DELETE FROM tags WHERE tag=? AND aid=?"
        cur.execute(query, (tag.lower(), aid))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# Returns list of tags for wallpaper
def get_tags_for_wallpaper(conn, aid: int):
    cur = conn.cursor()
    query = "SELECT * FROM tags WHERE aid=?"
    cur.execute(query, (aid,))
    tags = []
    for row in cur:
        tags.append(row[0])
    return tags


# Delete all tags for wallpaper
def delete_tags_for_wallpaper(conn, aid: int):
    try:
        cur = conn.cursor()
        query = "DELETE FROM tags WHERE aid=?"
        cur.execute(query, (aid,))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# --------------- Colors ---------------

# Adds color to wallpaper
def add_color(conn, aid: int, color: str):
    try:
        cur = conn.cursor()
        query = "INSERT INTO colors VALUES (?,?)"
        cur.execute(query, (aid, color))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# --------------- Multiple tables ---------------

# Get number of likes gotten on all wallpapers
def get_users_total_received_stars(conn, username: str):
    cur = conn.cursor()
    query = """SELECT COUNT(l.lid) 
               FROM likes AS l, (SELECT aid FROM wallpapers WHERE username=?) AS w
               WHERE l.aid = w.aid"""
    cur.execute(query, (username.lower(),))
    result = cur.fetchone()
    return result[0] if result else None


# Deletes wallpaper and its likes and tags
def delete_wallpaper_likes_tags_colors(conn, aid):
    try:
        cur = conn.cursor()
        queries = ["DELETE FROM wallpapers WHERE aid=?",
                   "DELETE FROM likes WHERE aid=?",
                   "DELETE FROM tags WHERE aid=?",
                   "DELETE FROM colors WHERE aid=?"]
        for query in queries:
            cur.execute(query, (aid,))
        conn.commit()
        return 0
    except Error as e:
        print(e)
        return 1


# --------------- Functions ---------------

# Creates an sql function that compares ratios
def create_ratiocmp_function(conn):
    def ratiocmp(x1, y1, x2, y2):
        gcd1 = gcd(x1, y1)
        gcd2 = gcd(x2, y2)
        if not gcd1 or not gcd2:
            return 0
        return int((x1 // gcd1, y1 // gcd1) == (x2 // gcd2, y2 // gcd2))
    conn.create_function("ratiocmp", 4, ratiocmp)


# --------------- Setup ---------------

# Initialize users
def init_users(conn):
    users = (
        ("joachim", "sjoko123", 15),
        ("tina", "pokemon")
    )
    for user in users:
        if len(user) == 3:
            add_user(conn, user[0], user[1], user[2])
        else:
            add_user(conn, user[0], user[1])


# Initialize wallpapers
def init_wallpapers(conn):
    wps = (
        ("joachim", 1920, 1080, 68),
        ("tina", 1280, 720, 17)
    )
    for wp in wps:
        add_wallpaper(conn, wp[0], wp[1], wp[2], views=wp[3])


# Initialize likes
def init_likes(conn):
    likes = (
        (1, "joachim"),
        (3, "tina")
    )
    for like in likes:
        add_like(conn, like[0], like[1])


# Initialize tags
def init_tags(conn):
    tags = (
        ("popcorn", 2),
        ("candy", 2),
        ("popcorn", 1),
    )
    for tag in tags:
        add_tag(conn, tag[0], tag[1])


# Initalize colors
def init_colors(conn):
    colors = (
        (1, "#0000ff"),
        (1, "#00ff00"),
        (1, "#000000"),
        (2, "#ff0000")
    )
    for color in colors:
        add_color(conn, color[0], color[1])


# Initialize functions
def init_functions(conn):
    create_ratiocmp_function(conn)


# Setup for database.db
def setup():
    conn = create_connection(DATABASE)
    if not conn:
        raise Exception("Could not connect to database")
    create_table(conn, CREATE_USERS_TABLE)
    create_table(conn, CREATE_WALLPAPERS_TABLE)
    create_table(conn, CREATE_LIKES_TABLE)
    create_table(conn, CREATE_TAGS_TABLE)
    create_table(conn, CREATE_COLORS_TABLE)
    # init_users(conn)
    # init_wallpapers(conn)
    # init_likes(conn)
    # init_tags(conn)
    # init_colors(conn)
    conn.close()


if __name__ == '__main__':
    setup()
