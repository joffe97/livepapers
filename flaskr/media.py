from urllib import request
from http.client import HTTPResponse


MEDIA_TYPES = {
    "video": ["mp4"]
}

WP_VIDEO_PATH = "static/wallpapers/videos/"


def create_media_file(datauri):
    with request.urlopen(datauri) as response:
        response: HTTPResponse
        content_type = response.info().get_content_type()
        data = response.read()

    if not content_type or not data:
        return None

    file_ending = ""
    for media in MEDIA_TYPES:
        if file_ending:
            break
        for ending in MEDIA_TYPES[media]:
            tmp_ending = content_type.lower()
            if f"{media}/{ending}" == tmp_ending:
                file_ending = ending
                break

    with open(f"{WP_VIDEO_PATH}teste.{file_ending}", "a") as f:
        pass

    with open(f"{WP_VIDEO_PATH}teste.{file_ending}", "wb") as f:
        f.write(data)
