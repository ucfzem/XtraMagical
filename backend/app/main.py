import os, logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.api import projects, images, auth
from app.core.database import engine, Base
from app.core.security import hash_password
from sqlalchemy import select
from app.models.database import User

logger = logging.getLogger(__name__)

app = FastAPI(
    title="XtraMagical API",
    description="API de renommage IA et génération d'images",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Authentification"])
app.include_router(projects.router, prefix="/api", tags=["Projets"])
app.include_router(images.router, prefix="/api", tags=["Images"])


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.core.database import async_session_factory
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == "admin@xtramagical.com"))
        if not result.scalar_one_or_none():
            user = User(
                email="admin@xtramagical.com",
                hashed_password=hash_password("password"),
                name="Admin",
            )
            session.add(user)
            await session.commit()
            logger.info("Utilisateur de démo créé: admin@xtramagical.com / password")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "XtraMagical"}


DEV_DATA = Path("./dev_data/uploads")

@app.get("/dev-file/{path:path}")
async def dev_file(path: str):
    filepath = DEV_DATA / path
    if not filepath.exists() or not filepath.is_file():
        raise HTTPException(404, "Fichier non trouvé")
    return FileResponse(filepath)
