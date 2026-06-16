from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.database import Project, Image
from app.schemas.batch import ProjectCreate, ProjectResponse, BatchUploadResponse, ImageResponse
from app.tasks.rename import process_image_rename
from app.utils.s3 import upload_temp_file

router = APIRouter()


@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    req: ProjectCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(
        user_id=user["id"],
        name=req.name,
        naming_pattern=req.naming_pattern,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.user_id == user["id"])
    )
    projects = result.scalars().all()
    return projects


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user["id"])
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Projet non trouvé")
    return project


@router.post("/projects/{project_id}/batch-upload", response_model=BatchUploadResponse)
async def batch_upload_images(
    project_id: int,
    files: List[UploadFile] = File(...),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user["id"])
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Projet non trouvé")

    image_ids = []
    for file in files:
        content = await file.read()
        temp_key = f"temp/{user['id']}/{project_id}/{uuid.uuid4()}_{file.filename}"
        temp_url = upload_temp_file(content, temp_key)

        image = Image(
            project_id=project_id,
            original_filename=file.filename or "unknown",
            temp_url=temp_url,
            status="pending",
        )
        db.add(image)
        await db.commit()
        await db.refresh(image)
        image_ids.append(image.id)

        process_image_rename.delay(
            image_id=image.id,
            temp_url=temp_url,
            project_id=project_id,
            pattern=project.naming_pattern,
            user_id=user["id"],
        )

    return BatchUploadResponse(
        image_ids=image_ids,
        message=f"{len(image_ids)} tâche(s) planifiée(s)",
    )


@router.get("/projects/{project_id}/images", response_model=List[ImageResponse])
async def list_project_images(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user["id"])
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Projet non trouvé")

    result = await db.execute(
        select(Image).where(Image.project_id == project_id)
    )
    images = result.scalars().all()
    return images
