import time

_cache = {}


def get_cache(key: str):

    item = _cache.get(key)

    if not item:
        return None

    if item["expires_at"] < time.time():
        del _cache[key]
        return None

    return item["value"]


def set_cache(key: str, value, ttl: int = 300):
    _cache[key] = {
        "value": value,
        "expires_at": time.time() + ttl
    }


def clear_cache(key: str):
    if key in _cache:
        del _cache[key]