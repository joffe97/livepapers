import tempfile
import cv2
import os
import numpy as np
from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie2000
from colorthief import ColorThief
from urllib import request
from flask_login import current_user
from db import add_wallpaper, add_color

MEDIA_TYPES = {
    "video": ["mp4"]
}

WP_VIDEO_PATH = "static/wallpapers/videos/"
WP_IMAGE_PATH = "static/wallpapers/wpimages/"
WP_LOWRESIMG_PATH = "static/wallpapers/images/"
TEMP_PATH = "temp/"

LOWRES_DIMENTIONS = (450, 300)

COLORS = [(255, 0, 0), (0, 255, 0), (0, 0, 255),
          (255, 255, 0), (255, 0, 255), (0, 255, 255),
          (0, 0, 0), (128, 128, 128), (255, 255, 255)]


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


def find_most_similar_color(color: tuple):
    lowest_diff = 0
    current = None
    c1_rgb = sRGBColor(int(color[0]), int(color[1]), int(color[2]), is_upscaled=True)
    c1_lab = convert_color(c1_rgb, LabColor)
    for c in COLORS:
        c2_rgb = sRGBColor(c[0], c[1], c[2], is_upscaled=True)
        c2_lab = convert_color(c2_rgb, LabColor)
        diff = delta_e_cie2000(c1_lab, c2_lab)
        if diff < lowest_diff or current is None:
            lowest_diff = diff
            current = c
    return current


# Adds color for image to database
def add_image_colors_to_database(conn, aid):
    img_path = f"{WP_LOWRESIMG_PATH}{aid}.jpg"
    if not os.path.exists(img_path):
        return

    ct = ColorThief(img_path)
    colors = ct.get_palette(2, 5)
    print(colors)

    colors_dict = {}
    for color in colors:
        similar_c = find_most_similar_color(color)
        hex_color = "#%02x%02x%02x" % similar_c
        colors_dict.setdefault(hex_color, 0)
        colors_dict[hex_color] += 1

    print(colors_dict)

    for c in colors_dict:
        add_color(conn, aid, c)


# Create media file from datauri, and adds it to database
def handle_media_uri(conn, datauri):
    # Gets content type and data from datauri
    with request.urlopen(datauri) as response:
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

    if media == "video":
        error = create_lowres_image_from_video(filename, f"{WP_LOWRESIMG_PATH}{aid}.jpg")  # Creates image from video
        if error:
            return "servererror"

    add_image_colors_to_database(conn, aid)

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
