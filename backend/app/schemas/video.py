from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    youtube_url: str
    board_id: int
    class_id: int
    subject_id: int
    chapter_id: int
    topic_id: int
    is_published: bool = False

class VideoCreate(VideoBase):
    pass

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    youtube_url: Optional[str] = None
    board_id: Optional[int] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    chapter_id: Optional[int] = None
    topic_id: Optional[int] = None
    is_published: Optional[bool] = None

class VideoResponse(VideoBase):
    id: int
    youtube_video_id: str
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
