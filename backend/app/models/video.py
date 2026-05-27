from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    youtube_url = Column(String, nullable=False)
    youtube_video_id = Column(String, nullable=False, index=True)
    
    # Relationships to syllabus
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, unique=True) # Assuming 1 video per topic for now, or remove unique=True if multiple allowed
    
    thumbnail_url = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Topic relationship
    topic = relationship("Topic")
    board = relationship("Board")
    class_level = relationship("ClassLevel")
    subject = relationship("Subject")
    chapter = relationship("Chapter")
