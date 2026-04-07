def success(data=None, message="ok"):
    return {
        "success": True,
        "message": message,
        "data": data
    }


def error(message="erro", data=None):
    return {
        "success": False,
        "message": message,
        "data": data
    }