def get_reply(status: str, msg: str = ""):
    if status not in ["error", "success", "info", "warning"]:
        raise ValueError(f"{status} is not a valid status")
    return {"status": status, "msg": msg}
