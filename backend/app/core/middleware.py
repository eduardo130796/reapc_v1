import time
from fastapi import Request


async def log_requests(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = round((time.time() - start_time) * 1000, 2)

    print({
        "method": request.method,
        "path": request.url.path,
        "status": response.status_code,
        "time_ms": duration
    })

    return response