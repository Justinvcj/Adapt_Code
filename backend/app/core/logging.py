import logging
import json
import sys
from contextvars import ContextVar

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")

class RedactingFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts":     self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level":  record.levelname,
            "logger": record.name,
            "rid":    request_id_ctx.get(),
            "msg":    record.getMessage(),
        }
        if record.exc_info:
            import traceback as _tb
            payload["exc_type"] = record.exc_info[0].__name__
            payload["exc_value"] = str(record.exc_info[1])
            payload["traceback"] = _tb.format_exception(*record.exc_info)
        return json.dumps(payload)

logger = logging.getLogger("uvicorn")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(RedactingFormatter())
# We don't want to add duplicate handlers if it's already set up by uvicorn,
# but we do want to replace the formatter.
for h in logger.handlers:
    h.setFormatter(RedactingFormatter())

# Ensure we have at least one handler
if not logger.handlers:
    logger.addHandler(handler)
