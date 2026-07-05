def test_users_views_module_imports():
    from apps.users import views

    assert hasattr(views, "render")
