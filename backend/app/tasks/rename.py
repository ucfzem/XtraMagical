import logging
from app.core.celery_app import task as celery_task
from app.core.vision import analyze_image, normalize_labels_with_llm
from app.utils.s3 import copy_file_with_new_name
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.models.database import Image

logger = logging.getLogger(__name__)
settings = get_settings()
sync_engine = create_engine(settings.database_url_sync)


@celery_task(bind=True, max_retries=3, default_retry_delay=10, acks_late=True)
def process_image_rename(self=None, image_id: int = None, temp_url: str = None,
                         project_id: int = None, pattern: str = None, user_id: int = None):
    db = Session(sync_engine)
    try:
        image = db.query(Image).filter(Image.id == image_id).first()
        if not image:
            raise Exception(f"Image {image_id} introuvable")

        image.status = "processing"
        db.commit()

        labels, objects, colors, texts = analyze_image(temp_url)
        meta = normalize_labels_with_llm(labels, objects, colors)
        brand = meta.get("brand", "")
        model = meta.get("model", "")
        color = meta.get("color", "")
        context = meta.get("context", "")

        replacements = {
            "marque": brand or "inconnu",
            "modèle": model or "inconnu",
            "couleur": color or "inconnue",
            "contexte": context or "produit",
        }
        new_filename = pattern.format(**replacements).lower().replace(" ", "-") + ".jpg"

        import uuid
        temp_key = f"{uuid.uuid4()}_{new_filename}"
        new_url = copy_file_with_new_name(temp_key, new_filename, user_id)

        image.final_filename = new_filename
        image.final_url = new_url
        image.status = "completed"
        db.commit()
        logger.info(f"Image {image_id} renommée en {new_filename}")

    except Exception as e:
        db.rollback()
        logger.error(f"Erreur sur image {image_id}: {e}")
        try:
            image = db.query(Image).filter(Image.id == image_id).first()
            if image:
                image.status = "failed"
                image.error_message = str(e)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
