from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, health, users, syllabus, videos

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(syllabus.router, prefix="/syllabus", tags=["syllabus"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
