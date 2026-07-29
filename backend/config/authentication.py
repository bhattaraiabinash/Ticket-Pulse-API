from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Custom SessionAuthentication that skips CSRF validation for REST API endpoints.
    Suitable for SPAs and mobile/cross-origin clients relying on HTTP Authorization headers or API tokens.
    """
    def enforce_csrf(self, request):
        return  # To not perform the CSRF check on REST endpoints
