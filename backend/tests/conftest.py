import os

os.environ.setdefault("PYTEST_RUNNING", "1")
os.environ.setdefault("UPLOAD_DIR", "./data/uploads")
os.environ.pop("LEGACY_MEDIA_IMPORT_DIR", None)
os.environ.pop("FORCE_LEGACY_MEDIA_REIMPORT", None)
