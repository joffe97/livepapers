import os

DIR = r"C:\Users\Joach\Documents\exam\flaskr"
EXCLUDED_FILES = [r"static\style\bsstyle.css"]
EXCLUDED_DIRS = [r"static\wallpapers", r"static\bootstrap", r"static\assets", r"temp", r"venv"]

def count_lines(dir_path, countdict, ignore=None, include_filetypes=None):
    if include_filetypes is None:
        include_filetypes = ["js", "css", "html", "py", "scss"]
    count = 0
    if any(os.path.samefile(f"{DIR}\\{d}", dir_path) for d in EXCLUDED_DIRS):
        return 0
    if os.path.isfile(dir_path):
        with open(dir_path, "r") as f:
            for i in f:
                if isinstance(ignore, list) and i in ignore:
                    continue
                count += 1
        countdict[dir_path] = count
        return count
    for filename in os.listdir(dir_path):
        fullpath = os.path.join(dir_path, filename)
        if not os.path.isdir(fullpath) and \
                (any(os.path.samefile(f"{DIR}\\{f}", fullpath) for f in EXCLUDED_FILES) or
                not any(filename.endswith(f".{ending}") for ending in include_filetypes)):
            continue
        count += count_lines(fullpath, countdict, ignore=ignore, include_filetypes=include_filetypes)
    return count


if __name__ == '__main__':
    countdict = {}
    total = count_lines(DIR, countdict)
    countlist = sorted(countdict, key=countdict.get)
    countlist.reverse()
    for item in countlist:
        count = countdict[item]
        print(f"{count}:{' ' * (10 - len(str(count)))}{item}")
    print(f"\nTotal: {total}")
