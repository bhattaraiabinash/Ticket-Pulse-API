import logging
from django.http import JsonResponse
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status as drf_status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
   
    # Let DRF handle known API exceptions first
    response = exception_handler(exc, context)

    if response is not None:
        # DRF handled it — standardize the format
        error_data = {
            "error": _get_error_message(response.data),
            "code": _get_error_code(response.status_code),
            "status": response.status_code,
        }
        response.data = error_data
        return response

    # DRF couldn't handle it — unexpected 500 error
    view = context.get("view")
    logger.error(
        "Unhandled exception in %s: %s",
        view.__class__.__name__ if view else "unknown",
        str(exc),
        exc_info=True,
    )

    return JsonResponse(
        {
            "error": "An unexpected error occurred. Please try again.",
            "code": "SERVER_ERROR",
            "status": 500,
        },
        status=500,
    )


def _get_error_message(data):
    
    if isinstance(data, dict):
        if "detail" in data:
            return str(data["detail"])
        # Collect all field errors
        messages = []
        for field, errors in data.items():
            if isinstance(errors, list):
                for error in errors:
                    messages.append(f"{field}: {error}")
            else:
                messages.append(f"{field}: {errors}")
        return " | ".join(messages) if messages else "An error occurred"
    elif isinstance(data, list):
        return " | ".join(str(e) for e in data)
    return str(data)


def _get_error_code(status_code):
    
    codes = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        429: "TOO_MANY_REQUESTS",
        500: "SERVER_ERROR",
    }
    return codes.get(status_code, "ERROR")

class ConflictError(APIException):
    
    status_code = drf_status.HTTP_409_CONFLICT
    default_detail = "A conflict occurred."
    default_code = "conflict"

