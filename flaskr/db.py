import sqlite3
import datetime
from sqlite3 import Error, Cursor, Connection
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Dict, Union


DATABASE = "./database.db"


# Class containing usertype flags
class UserType:
    WP_ADD = 1          # Add wallpapers
    WP_REM = 1 << 1     # Remove wallpapers
    ADMIN = 1 << 2      # Manage users and userdata (except of admins and managers)
    MANAGER = 1 << 3    # Manage all users and userdata
    BLOCKED = 1 << 4    # Blocked user


# --------------- Queries ---------------

CREATE_USERS_TABLE = f"""CREATE TABLE IF NOT EXISTS users (
                          username TEXT,
                          pwhash TEXT NOT NULL,
                          type INTEGER NOT NULL DEFAULT {UserType.WP_ADD | UserType.WP_REM},
                          settings TEXT DEFAULT NULL,
                          PRIMARY KEY (username)
                        );"""

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

CREATE_LIKES_TABLE = """CREATE TABLE IF NOT EXISTS likes (
                          lid INTEGER,
                          aid INTEGER NOT NULL,
                          username INTEGER NOT NULL,
                          PRIMARY KEY (lid),
                          FOREIGN KEY (aid) REFERENCES wallpapers (aid),
                          FOREIGN KEY (username) REFERENCES users (username),
                          CONSTRAINT uc_like UNIQUE (aid,username)
                        );"""

CREATE_TAGS_TABLE = """CREATE TABLE IF NOT EXISTS tags (
                          tag TEXT NOT NULL,
                          aid INTEGER NOT NULL,
                          PRIMARY KEY (tag,aid),
                          FOREIGN KEY (aid) REFERENCES wallpapers (aid)
                        );"""


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
    except Error:
        print(Error)
    return 0


# --------------- Users ---------------

# Adds user to the database
def add_user(conn, username: str, password: str, usertype: int = 3):
    try:
        cur: Cursor = conn.cursor()
        query = "INSERT INTO users VALUES (?,?,?,?)"
        pw_hash = generate_password_hash(password)
        cur.execute(query, (username, pw_hash, usertype, None))
        conn.commit()
        return None
    except Error as e:
        print(e)
        return e


# Get user from the database
def get_user(conn, username: str) -> Dict[str, Union[str, int]]:
    cur: Cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username=?"
    cur.execute(query, (username,))
    row = cur.fetchone()
    return {"username": row[0], "pwhash": row[1], "type": row[2], "settings": row[3]} if row else None


# Checks if user exists
def user_exist(conn, username: str):
    cur: Cursor = conn.cursor()
    query = "SELECT username FROM users WHERE LOWER(username)=LOWER(?)"
    cur.execute(query, (username,))
    row = cur.fetchone()
    return row is not None


# Verify user and returns user
def verify_and_get_user(conn, username: str, password: str) -> Union[Dict[str, Union[str, int]], None]:
    user = get_user(conn, username)
    if user is None:
        return None
    pwhash = user.get("pwhash", None)
    if pwhash is None or check_password_hash(pwhash, password) is False:
        return None
    return user


# Verify user
def verify_user(conn, username: str, password: str) -> bool:
    return bool(verify_and_get_user(conn, username, password))


# --------------- Wallpapers ---------------

# Adds wallpaper to the database
def add_wallpaper(conn, username: str,
                  width: int,
                  height: int,
                  date: datetime.datetime = datetime.datetime.now(),
                  views: int = 0):
    try:
        cur: Cursor = conn.cursor()
        query = "INSERT INTO wallpapers (username, width, height, date, views) VALUES (?,?,?,?,?)"
        cur.execute(query, (username, width, height, date, views))
        conn.commit()
    except Error as e:
        print(e)


# Gets wallpaper from database
def get_wallpaper(conn, aid):
    cur = conn.cursor()
    query = "SELECT * FROM wallpapers WHERE aid=?"
    cur.execute(query, (aid,))
    row = cur.fetchone()
    if row:
        return {"aid": row[0], "username": row[1], "width": row[2], "height": row[3], "date": row[4], "views": row[5]}
    else:
        return None


# Returns list of ids of uploaded wallpapers by user
def get_uploaded_ids(conn, username: str):
    cur = conn.cursor()
    query = "SELECT aid FROM wallpapers WHERE username=?"
    cur.execute(query, (username,))
    id_list = []
    for row in cur:
        id_list.append(row[0])
    return id_list


# --------------- Likes ---------------

# Adds a like to a wallpaper to the database
def add_like(conn, aid: int, username: str):
    try:
        cur: Cursor = conn.cursor()
        query = "INSERT INTO likes (aid, username) VALUES (?,?)"
        cur.execute(query, (aid, username))
        conn.commit()
    except Error as e:
        print(e)


# Get like from database
def get_likes_count_for_wallpaper(conn, aid: int):
    cur = conn.cursor()
    query = "SELECT COUNT(lid) FROM likes WHERE aid=?"
    cur.execute(query, (aid,))
    result = cur.fetchone()
    return result[0] if result else None


# Returns list of ids of favorite wallpapers by user
def get_favorite_ids(conn, username: str):
    cur = conn.cursor()
    query = "SELECT aid FROM likes WHERE username=?"
    cur.execute(query, (username,))
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
        cur.execute(query, (tag, aid))
        conn.commit()
    except Error as e:
        print(e)


# Returns list of tags for wallpaper
def get_tags_for_wallpaper(conn, aid: int):
    cur = conn.cursor()
    query = "SELECT * FROM tags WHERE aid=?"
    cur.execute(query, (aid,))
    tags = []
    for row in cur:
        tags.append(row[0])
    return tags


# --------------- Multiple tables ---------------

# Get number of likes gotten on all wallpapers
def get_users_total_received_stars(conn, username: str):
    cur = conn.cursor()
    query = """SELECT COUNT(l.lid) 
               FROM likes AS l, (SELECT aid FROM wallpapers WHERE username=?) AS w
               WHERE l.aid = w.aid"""
    cur.execute(query, (username,))
    result = cur.fetchone()
    return result[0] if result else None


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


# Setup for database.db
def setup():
    conn = create_connection(DATABASE)
    if not conn:
        raise Exception("Could not connect to database")
    create_table(conn, CREATE_USERS_TABLE)
    create_table(conn, CREATE_WALLPAPERS_TABLE)
    create_table(conn, CREATE_LIKES_TABLE)
    create_table(conn, CREATE_TAGS_TABLE)
    init_users(conn)
    init_wallpapers(conn)
    init_likes(conn)
    init_tags(conn)
    conn.close()


if __name__ == '__main__':
    setup()
