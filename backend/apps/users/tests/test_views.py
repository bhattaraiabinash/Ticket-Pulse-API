def test_users_views_module_imports():
    from apps.users import views

    assert hasattr(views, "RegisterView")
    assert hasattr(views, "LoginView")
    assert hasattr(views, "LogoutView")
    assert hasattr(views, "MeView")
