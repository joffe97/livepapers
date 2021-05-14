import datetime


def append_select_query_filter_ratio(where_list: list, arg_list: list, ratio: tuple):
    if not ratio or len(ratio) != 2 or ratio[0] == ratio[1] == 0:
        return

    if ratio[0] == 0:
        where_list.append("width < height")
    elif ratio[1] == 0:
        where_list.append("width > height")
    else:
        where_list.append("ratiocmp(width, height, ?, ?)")
        arg_list.extend((ratio[0], ratio[1]))


def append_select_query_filter_color(where_list: list, arg_list: list, color: str):
    if not color or len(color) != 7:
        return

    where_list.append("aid IN (SELECT aid FROM colors WHERE color = ?)")
    arg_list.append(color)


def append_select_query_filter_updatetime(where_list: list, arg_list: list, uploadtime: datetime.datetime):
    if not uploadtime:
        return

    where_list.append("date > ?")
    arg_list.append(uploadtime)


def append_select_query_filter_search(where_list: list, arg_list: list, search: str):
    if not search:
        return

    where_list.append("aid IN (SELECT aid FROM tags WHERE tag LIKE ?)")
    arg_list.append(search.lower() + "%")


def get_select_query_filter(filters):
    where_list = []
    arg_list = []
    print(filters)

    if "ratio" in filters:
        append_select_query_filter_ratio(where_list, arg_list, filters["ratio"])
    if "color" in filters:
        append_select_query_filter_color(where_list, arg_list, filters["color"])
    if "uploadtime" in filters:
        append_select_query_filter_updatetime(where_list, arg_list, filters["uploadtime"])
    if "search" in filters:
        append_select_query_filter_search(where_list, arg_list, filters["search"])

    if where_list:
        query = f"SELECT * FROM wallpapers WHERE {' AND '.join(map(lambda x: '(%s)' % x, where_list))}"
    else:
        query = "wallpapers"

    return query, arg_list
