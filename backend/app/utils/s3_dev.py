import os, json, shutil
from pathlib import Path

DATA_DIR = Path("./dev_data")
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR = DATA_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

def get_s3_client():
    return None

def upload_temp_file(data: bytes, key: str) -> str:
    filepath = UPLOAD_DIR / key
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_bytes(data)
    return f"http://localhost:8000/dev-file/{key}"

def copy_file_with_new_name(temp_key: str, new_filename: str, user_id: int) -> str:
    temp_path = UPLOAD_DIR / temp_key
    new_path = UPLOAD_DIR / f"users/{user_id}/{new_filename}"
    new_path.parent.mkdir(parents=True, exist_ok=True)
    if temp_path.exists():
        shutil.copy2(temp_path, new_path)
        temp_path.unlink()
    return f"http://localhost:8000/dev-file/users/{user_id}/{new_filename}"
