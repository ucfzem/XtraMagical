from app.core.config import get_settings

settings = get_settings()

try:
    from celery import Celery as _Celery
    _celery = _Celery(
        "xtramagical",
        broker=settings.redis_url,
        backend=settings.redis_url,
    )
    _celery.conf.task_serializer = "json"
    _celery.conf.result_serializer = "json"
    _celery.conf.task_acks_late = True
    _celery.conf.task_reject_on_worker_lost = True
    _celery.conf.task_track_started = True
    CELERY_AVAILABLE = True
except Exception:
    _celery = None
    CELERY_AVAILABLE = False


class _TaskWrapper:
    def __init__(self, func):
        self.func = func
        self.bind = False

    def delay(self, *args, **kwargs):
        return self.func(*args, **kwargs)


def task(*args, **kwargs):
    def decorator(func):
        if CELERY_AVAILABLE:
            return _celery.task(*args, **kwargs)(func)
        w = _TaskWrapper(func)
        w.bind = kwargs.get("bind", False)
        return w
    return decorator
