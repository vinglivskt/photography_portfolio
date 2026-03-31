from app.media_utils import public_media_url


def test_public_media_static_pass_through():
    assert (
        public_media_url("/static/images/image_1.jpg") == "/static/images/image_1.jpg"
    )


def test_public_media_remote_unchanged():
    assert (
        public_media_url("https://cdn.example.com/x.jpg")
        == "https://cdn.example.com/x.jpg"
    )


def test_public_media_upload_prefix():
    assert public_media_url("uploads/a.jpg") == "/media/uploads/a.jpg"


def test_public_media_absolute_media_unchanged():
    assert (
        public_media_url("/media/portfolio/images/x.jpg")
        == "/media/portfolio/images/x.jpg"
    )


def test_public_media_portfolio_relative():
    assert (
        public_media_url("portfolio/images/photo.jpg")
        == "/media/portfolio/images/photo.jpg"
    )
