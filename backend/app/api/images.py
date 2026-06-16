import os, logging
from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.database import Generation
from app.schemas.batch import (
    PromptEnhanceRequest,
    PromptEnhanceResponse,
    GenerateImageRequest,
    GenerateImageResponse,
    GenerationResponse,
)
from app.tasks.poll_generation import poll_replicate_generation

router = APIRouter()


@router.post("/prompts/enhance", response_model=PromptEnhanceResponse)
async def enhance_prompt(
    req: PromptEnhanceRequest,
    user: dict = Depends(get_current_user),
):
    system_msg = (
        "Tu es un expert en photographie et en prompt engineering. "
        "À partir d'une description simple, produis un prompt détaillé en anglais, "
        "avec lumière, environnement, composition, style, qualité technique. "
        "Retourne uniquement le prompt amélioré, sans commentaires."
    )
    try:
        import openai
        from app.core.config import get_settings
        settings = get_settings()
        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": req.prompt},
            ],
            temperature=0.8,
            max_tokens=200,
        )
        enhanced = response.choices[0].message.content.strip()
        return PromptEnhanceResponse(enhanced_prompt=enhanced)
    except Exception as e:
        logger.warning(f"OpenAI non disponible, mock: {e}")
        enhanced = f"{req.prompt}, cinematic lighting, 8K resolution, professional composition, shallow depth of field, vibrant colors, hyperrealistic"
        return PromptEnhanceResponse(enhanced_prompt=enhanced)


@router.post("/images/generate", response_model=GenerateImageResponse)
async def generate_image(
    req: GenerateImageRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        import uuid
        mock_prediction_id = str(uuid.uuid4())

        generation = Generation(
            user_id=user["id"],
            prompt=req.prompt,
            enhanced_prompt=req.enhanced_prompt,
            model_name=req.model_name,
            replicate_prediction_id=mock_prediction_id,
            status="processing",
        )
        db.add(generation)
        await db.commit()
        await db.refresh(generation)

        poll_replicate_generation.delay(generation.id, mock_prediction_id)

        return GenerateImageResponse(generation_id=generation.id, status="processing")
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/generations", response_model=list[GenerationResponse])
async def list_generations(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Generation)
        .where(Generation.user_id == user["id"])
        .order_by(Generation.created_at.desc())
    )
    return result.scalars().all()


@router.get("/generations/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == user["id"],
        )
    )
    gen = result.scalar_one_or_none()
    if not gen:
        raise HTTPException(404, "Génération non trouvée")
    return gen
