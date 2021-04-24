import tempfile
import cv2
import os
from urllib import request
from http.client import HTTPResponse
from flask_login import current_user
from db import add_wallpaper


MEDIA_TYPES = {
    "video": ["mp4"]
}

WP_VIDEO_PATH = "static/wallpapers/videos/"
WP_IMAGE_PATH = "static/wallpapers/images/"
TEMP_PATH = "temp/"


# Return media type and file format if valid
def get_valid_media_and_format(content_type: str):
    file_ending = media = ""
    for media in MEDIA_TYPES:
        if file_ending:
            break
        for ending in MEDIA_TYPES[media]:
            tmp_ending = content_type.lower()
            if f"{media}/{ending}" == tmp_ending:
                file_ending = ending
                break

    if not file_ending:
        return None, None
    else:
        return media, file_ending


# Returns dimentions for video binary data
def get_video_dimentions_from_binary(binary_data: bytes):
    with tempfile.TemporaryFile(dir=TEMP_PATH) as f:
        f.write(binary_data)
        vid = cv2.VideoCapture(f.name)
        try:
            width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
            return width, height
        except ValueError:
            return None, None


# Create image from video
def create_image_from_video(filename, imgname):
    vid = cv2.VideoCapture(filename)
    success, image = vid.read()
    if not success:
        return 1
    cv2.imwrite(imgname, image)
    return 0


# Create media file from datauri, and adds it to database
def handle_media_uri(conn, datauri):
    # Gets content type and data from datauri
    with request.urlopen(datauri) as response:
        response: HTTPResponse
        content_type = response.info().get_content_type()
        data = response.read()
    if not content_type or not data:
        return "dataerror"

    # Gets media type and file format if valid
    media, file_ending = get_valid_media_and_format(content_type)
    if not file_ending:
        return "fileerror"

    # Gets width and height if valid media type
    if media == "video":
        width, height = get_video_dimentions_from_binary(data)
        path = WP_VIDEO_PATH
    else:
        return "fileerror"

    if not width or not height:
        return "fileerror"

    # Adds wallpaper entry in database for the media
    aid = add_wallpaper(conn, current_user.username, width, height, return_id=True)

    filename = f"{path}{aid}.{file_ending}"
    if os.path.exists(filename):
        os.remove(filename)  # Removes any file which is wrongly assigned the same filename

    # Creates media from binary data
    with open(filename, "wb") as f:
        f.write(data)

    # Creates image from video
    if media == "video":
        error = create_image_from_video(filename, f"{WP_IMAGE_PATH}{aid}.jpg")
        if error:
            return "servererror"

    return aid, None
