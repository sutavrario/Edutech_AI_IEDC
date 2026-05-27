from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.video import Video
from app.models.user import User
from app.models.syllabus import Topic, Board, ClassLevel, Subject, Chapter
from app.schemas.video import VideoCreate, VideoUpdate, VideoResponse
from app.api.deps import get_current_admin_user, get_current_user
from app.utils.youtube import extract_youtube_info

router = APIRouter()

# -------------------------------------------------------------------------
# ADMIN ENDPOINTS
# -------------------------------------------------------------------------

@router.post("/admin", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def create_video(
    video_in: VideoCreate, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == video_in.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Verify if a video already exists for this topic
    existing_video = db.query(Video).filter(Video.topic_id == video_in.topic_id).first()
    if existing_video:
        raise HTTPException(status_code=400, detail="A video is already mapped to this topic")

    # Extract YouTube info
    yt_info = extract_youtube_info(video_in.youtube_url)
    if not yt_info:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL provided")

    video = Video(
        **video_in.model_dump(),
        youtube_video_id=yt_info["video_id"],
        thumbnail_url=yt_info["thumbnail_url"]
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video

@router.get("/admin", response_model=List[VideoResponse])
def get_all_videos(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    return db.query(Video).all()

@router.get("/admin/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.put("/admin/{video_id}", response_model=VideoResponse)
def update_video(
    video_id: int, 
    video_in: VideoUpdate, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # If topic is updated, check for duplicates
    if video_in.topic_id is not None and video_in.topic_id != video.topic_id:
        topic = db.query(Topic).filter(Topic.id == video_in.topic_id).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
            
        existing_video = db.query(Video).filter(Video.topic_id == video_in.topic_id).first()
        if existing_video:
            raise HTTPException(status_code=400, detail="A video is already mapped to this topic")

    update_data = video_in.model_dump(exclude_unset=True)
    
    # Re-extract YouTube info if URL changed
    if "youtube_url" in update_data:
        yt_info = extract_youtube_info(update_data["youtube_url"])
        if not yt_info:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL provided")
        update_data["youtube_video_id"] = yt_info["video_id"]
        update_data["thumbnail_url"] = yt_info["thumbnail_url"]

    for field, value in update_data.items():
        setattr(video, field, value)

    db.add(video)
    db.commit()
    db.refresh(video)
    return video

@router.delete("/admin/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    db.delete(video)
    db.commit()
    return None

# -------------------------------------------------------------------------
# STUDENT ENDPOINTS
# -------------------------------------------------------------------------

@router.get("/student", response_model=List[VideoResponse])
def get_student_videos(
    topic_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get published videos.
    Optional: Filter by topic_id.
    """
    query = db.query(Video).filter(Video.is_published == True)
    
    if topic_id:
        query = query.filter(Video.topic_id == topic_id)
    else:
        # If no topic specified, we could optionally filter by the student's enrolled board/class.
        # For now, we'll return all published videos if no topic is specified, 
        # or we could enforce filtering based on current_user.board and current_user.class_name.
        # Let's enforce board/class filtering if they are set on the user.
        if current_user.board:
            # Find the board ID
            board = db.query(Board).filter(Board.name == current_user.board).first()
            if board:
                query = query.filter(Video.board_id == board.id)
                
        if current_user.class_name:
            # Find the class ID
            class_level = db.query(ClassLevel).filter(ClassLevel.class_name == current_user.class_name).first()
            if class_level:
                query = query.filter(Video.class_id == class_level.id)
                
    return query.all()

@router.get("/student/{video_id}", response_model=VideoResponse)
def get_student_video(
    video_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.id == video_id, Video.is_published == True).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or is unpublished")
        
    return video
