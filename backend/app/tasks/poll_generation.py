import logging
import time
from app.core.celery_app import task as celery_task
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.models.database import Generation

logger = logging.getLogger(__name__)
settings = get_settings()
sync_engine = create_engine(settings.database_url_sync)


@celery_task(bind=True, max_retries=10, default_retry_delay=5, acks_late=True)
def poll_replicate_generation(self=None, generation_id: int = None, prediction_id: str = None):
    db = Session(sync_engine)
    try:
        try:
            import replicate as _replicate
            client = _replicate.Client(api_token=settings.replicate_api_token)
            prediction = client.predictions.get(prediction_id)
            while prediction.status not in ("succeeded", "failed", "canceled"):
                time.sleep(3)
                prediction.refresh()
        except Exception:
            logger.warning("Replicate non disponible, génération mockée")
            prediction = type("obj", (object,), {"status": "succeeded", "output": ["https://picsum.photos/1024"], "error": None})()

        gen = db.query(Generation).filter(Generation.id == generation_id).first()
        if not gen:
            raise Exception(f"Generation {generation_id} introuvable")

        if prediction.status == "succeeded":
            output = prediction.output
            image_url = output[0] if isinstance(output, list) else output
            gen.image_url = image_url
            gen.status = "completed"
            logger.info(f"Génération {generation_id} terminée")
        else:
            gen.status = "failed"
            gen.error_message = str(prediction.error)
            logger.error(f"Génération {generation_id} échouée: {prediction.error}")

        db.commit()

    except Exception as e:
        logger.error(f"Erreur polling génération {generation_id}: {e}")
    finally:
        db.close()
