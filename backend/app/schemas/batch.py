from pydantic import BaseModel
from typing import List, Optional


class ProjectCreate(BaseModel):
    name: str
    naming_pattern: str = "{marque}-{modele}-{couleur}-{contexte}"


class ProjectResponse(BaseModel):
    id: int
    name: str
    naming_pattern: str
    created_at: str

    class Config:
        from_attributes = True


class BatchUploadResponse(BaseModel):
    image_ids: List[int]
    message: str


class ImageResponse(BaseModel):
    id: int
    original_filename: str
    final_filename: Optional[str] = None
    final_url: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class PromptEnhanceRequest(BaseModel):
    prompt: str
    style: str = "cinematic"


class PromptEnhanceResponse(BaseModel):
    enhanced_prompt: str


class GenerateImageRequest(BaseModel):
    prompt: str
    enhanced_prompt: Optional[str] = None
    negative_prompt: str = ""
    width: int = 1024
    height: int = 1024
    model_name: str = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"


class GenerateImageResponse(BaseModel):
    generation_id: int
    status: str


class GenerationResponse(BaseModel):
    id: int
    prompt: str
    enhanced_prompt: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    created_at: str

    class Config:
        from_attributes = True
