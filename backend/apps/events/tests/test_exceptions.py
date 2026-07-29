import pytest
import json

from rest_framework import status
from rest_framework.exceptions import NotFound

from apps.events.exceptions import (
    _get_error_code,
    _get_error_message,
    custom_exception_handler,
)


def test_get_error_message_from_list():
    assert _get_error_message(["a", "b"]) == "a | b"


def test_get_error_message_from_scalar():
    assert _get_error_message("single") == "single"


def test_get_error_message_from_dict_scalar_value():
    message = _get_error_message({"ticket_ids": "invalid type"})
    assert message == "ticket_ids: invalid type"


def test_get_error_code_fallback():
    assert _get_error_code(418) == "ERROR"


def test_custom_exception_handler_unhandled_exception_returns_500_json():
    response = custom_exception_handler(Exception("boom"), {"view": None})

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    payload = json.loads(response.content.decode("utf-8"))
    assert payload["code"] == "SERVER_ERROR"
    assert "unexpected" in payload["error"].lower()


def test_custom_exception_handler_formats_drf_exception_payload():
    response = custom_exception_handler(NotFound("item missing"), {"view": None})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["code"] == "NOT_FOUND"
    assert "item missing" in response.data["error"].lower()
