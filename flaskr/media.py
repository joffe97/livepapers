import tempfile
import cv2
import os
import numpy as np
from urllib import request
from http.client import HTTPResponse
from flask_login import current_user
from math import gcd
from db import add_wallpaper

MEDIA_TYPES = {
    "video": ["mp4"]
}

WP_VIDEO_PATH = "static/wallpapers/videos/"
WP_IMAGE_PATH = "static/wallpapers/wpimages/"
WP_LOWRESIMG_PATH = "static/wallpapers/images/"
TEMP_PATH = "temp/"

LOWRES_DIMENTIONS = (450, 300)


# Return path for media type
def get_media_folder_path(media_type):
    media_type = media_type.lower()
    if media_type == "video":
        return WP_VIDEO_PATH
    elif media_type == "image":
        return WP_IMAGE_PATH
    else:
        return ""


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
    if not os.path.exists(TEMP_PATH):
        os.makedirs(TEMP_PATH)
    with tempfile.TemporaryFile(dir=TEMP_PATH) as f:
        f.write(binary_data)
        vid = cv2.VideoCapture(f.name)
        try:
            width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
            return width, height
        except ValueError:
            return None, None


# Crop image to given ratio
def crop_image(image: np.ndarray, ratio=LOWRES_DIMENTIONS):
    if len(ratio) < 2 or len(image) == 0 or len(image[0]) == 0:
        return None

    y = len(image)
    x = len(image[0])
    ratio_scale = ratio[0] / ratio[1]  # Width / height (landscape if scale > 1)
    img_scale = x / y

    if img_scale == ratio_scale:  # Return if right ratio
        return image
    elif img_scale > ratio_scale:  # Crop width
        new_x = int(ratio[0] * (y / ratio[1]))
        new_y = y
        x_start = (x - new_x) // 2
        y_start = 0
    else:  # Crow height
        new_x = x
        new_y = int(ratio[1] * (x / ratio[0]))
        x_start = 0
        y_start = (y - new_y) // 2

    return image[y_start:(y_start + new_y), x_start:(x_start + new_x)]


# Create image from video
def create_lowres_image_from_video(filename, imgname):
    vid = cv2.VideoCapture(filename)
    success, image = vid.read()
    if not success:
        return 1

    image_crop = crop_image(image)
    image_resize = cv2.resize(image_crop, LOWRES_DIMENTIONS, interpolation=cv2.INTER_AREA)
    cv2.imwrite(imgname, image_resize)
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
        error = create_lowres_image_from_video(filename, f"{WP_LOWRESIMG_PATH}{aid}.jpg")
        if error:
            return "servererror"

    return aid, None


# Removes media associated with wallpaper id
def delete_wallpaper_media(aid):
    for media_type in MEDIA_TYPES:
        folder_path = get_media_folder_path(media_type)
        if not folder_path:
            continue
        for file_ending in MEDIA_TYPES[media_type]:
            filename = f"{folder_path}{aid}.{file_ending}"
            if os.path.exists(filename):
                os.remove(filename)

    lowresname = f"{WP_LOWRESIMG_PATH}{aid}.jpg"
    if os.path.exists(lowresname):
        os.remove(lowresname)
