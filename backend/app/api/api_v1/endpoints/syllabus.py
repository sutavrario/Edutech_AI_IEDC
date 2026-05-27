from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.api.deps import get_current_admin_user
from app.models import syllabus as models
from app.schemas import syllabus as schemas

router = APIRouter()

# ============================
# STATS
# ============================

from app.models.user import User
from app.models.video import Video

@router.get("/stats")
def get_syllabus_stats(db: Session = Depends(get_db)):
    """Get counts for admin dashboard."""
    return {
        "boards": db.query(models.Board).count(),
        "classes": db.query(models.ClassLevel).count(),
        "subjects": db.query(models.Subject).count(),
        "chapters": db.query(models.Chapter).count(),
        "topics": db.query(models.Topic).count(),
        "students": db.query(User).filter(User.role == 'student').count(),
        "videos": db.query(Video).count(),
        "quizzes": 0
    }

# ============================
# BOARDS
# ============================

@router.post("/boards", response_model=schemas.BoardResponse)
def create_board(
    board_in: schemas.BoardCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    if not board_in.name or not board_in.name.strip():
        raise HTTPException(status_code=400, detail="Board name cannot be empty")
    existing = db.query(models.Board).filter(models.Board.name == board_in.name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Board with this name already exists")
    board = models.Board(name=board_in.name.strip())
    db.add(board)
    db.commit()
    db.refresh(board)
    return board

@router.get("/boards", response_model=List[schemas.BoardResponse])
def get_boards(db: Session = Depends(get_db)):
    return db.query(models.Board).order_by(models.Board.name).all()

@router.get("/boards/{board_id}", response_model=schemas.BoardResponse)
def get_board(board_id: int, db: Session = Depends(get_db)):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

@router.put("/boards/{board_id}", response_model=schemas.BoardResponse)
def update_board(
    board_id: int,
    board_in: schemas.BoardUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board_in.name is not None:
        name = board_in.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Board name cannot be empty")
        existing = db.query(models.Board).filter(
            models.Board.name == name, models.Board.id != board_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Board with this name already exists")
        board.name = name
    db.commit()
    db.refresh(board)
    return board

@router.delete("/boards/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db.delete(board)
    db.commit()
    return None

# ============================
# CLASSES
# ============================

@router.post("/classes", response_model=schemas.ClassLevelResponse)
def create_class(
    class_in: schemas.ClassLevelCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    if not class_in.class_name or not class_in.class_name.strip():
        raise HTTPException(status_code=400, detail="Class name cannot be empty")
    # Verify parent exists
    board = db.query(models.Board).filter(models.Board.id == class_in.board_id).first()
    if not board:
        raise HTTPException(status_code=400, detail="Parent board not found")
    # Check duplicate within same board
    existing = db.query(models.ClassLevel).filter(
        models.ClassLevel.class_name == class_in.class_name.strip(),
        models.ClassLevel.board_id == class_in.board_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Class with this name already exists in this board")
    class_obj = models.ClassLevel(class_name=class_in.class_name.strip(), board_id=class_in.board_id)
    db.add(class_obj)
    db.commit()
    db.refresh(class_obj)
    return class_obj

@router.get("/classes", response_model=List[schemas.ClassLevelResponse])
def get_classes(board_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.ClassLevel)
    if board_id:
        query = query.filter(models.ClassLevel.board_id == board_id)
    return query.order_by(models.ClassLevel.class_name).all()

@router.get("/classes/{class_id}", response_model=schemas.ClassLevelResponse)
def get_class(class_id: int, db: Session = Depends(get_db)):
    class_obj = db.query(models.ClassLevel).filter(models.ClassLevel.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_obj

@router.put("/classes/{class_id}", response_model=schemas.ClassLevelResponse)
def update_class(
    class_id: int,
    class_in: schemas.ClassLevelUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    class_obj = db.query(models.ClassLevel).filter(models.ClassLevel.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    if class_in.class_name is not None:
        name = class_in.class_name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Class name cannot be empty")
        existing = db.query(models.ClassLevel).filter(
            models.ClassLevel.class_name == name,
            models.ClassLevel.board_id == class_obj.board_id,
            models.ClassLevel.id != class_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Class with this name already exists in this board")
        class_obj.class_name = name
    db.commit()
    db.refresh(class_obj)
    return class_obj

@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    class_obj = db.query(models.ClassLevel).filter(models.ClassLevel.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(class_obj)
    db.commit()
    return None

# ============================
# SUBJECTS
# ============================

@router.post("/subjects", response_model=schemas.SubjectResponse)
def create_subject(
    subject_in: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    if not subject_in.name or not subject_in.name.strip():
        raise HTTPException(status_code=400, detail="Subject name cannot be empty")
    # Verify parent exists
    class_obj = db.query(models.ClassLevel).filter(models.ClassLevel.id == subject_in.class_id).first()
    if not class_obj:
        raise HTTPException(status_code=400, detail="Parent class not found")
    # Check duplicate within same class
    existing = db.query(models.Subject).filter(
        models.Subject.name == subject_in.name.strip(),
        models.Subject.class_id == subject_in.class_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject already exists in this class")
    subject = models.Subject(name=subject_in.name.strip(), class_id=subject_in.class_id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.get("/subjects", response_model=List[schemas.SubjectResponse])
def get_subjects(class_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Subject)
    if class_id:
        query = query.filter(models.Subject.class_id == class_id)
    return query.order_by(models.Subject.name).all()

@router.get("/subjects/{subject_id}", response_model=schemas.SubjectResponse)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.put("/subjects/{subject_id}", response_model=schemas.SubjectResponse)
def update_subject(
    subject_id: int,
    subject_in: schemas.SubjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    if subject_in.name is not None:
        name = subject_in.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Subject name cannot be empty")
        existing = db.query(models.Subject).filter(
            models.Subject.name == name,
            models.Subject.class_id == subject.class_id,
            models.Subject.id != subject_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Subject already exists in this class")
        subject.name = name
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return None

# ============================
# CHAPTERS
# ============================

@router.post("/chapters", response_model=schemas.ChapterResponse)
def create_chapter(
    chapter_in: schemas.ChapterCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    if not chapter_in.name or not chapter_in.name.strip():
        raise HTTPException(status_code=400, detail="Chapter name cannot be empty")
    # Verify parent exists
    subject = db.query(models.Subject).filter(models.Subject.id == chapter_in.subject_id).first()
    if not subject:
        raise HTTPException(status_code=400, detail="Parent subject not found")
    # Check duplicate within same subject
    existing = db.query(models.Chapter).filter(
        models.Chapter.name == chapter_in.name.strip(),
        models.Chapter.subject_id == chapter_in.subject_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Chapter already exists in this subject")
    chapter = models.Chapter(name=chapter_in.name.strip(), subject_id=chapter_in.subject_id)
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter

@router.get("/chapters", response_model=List[schemas.ChapterResponse])
def get_chapters(subject_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Chapter)
    if subject_id:
        query = query.filter(models.Chapter.subject_id == subject_id)
    return query.order_by(models.Chapter.name).all()

@router.get("/chapters/{chapter_id}", response_model=schemas.ChapterResponse)
def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter

@router.put("/chapters/{chapter_id}", response_model=schemas.ChapterResponse)
def update_chapter(
    chapter_id: int,
    chapter_in: schemas.ChapterUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if chapter_in.name is not None:
        name = chapter_in.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Chapter name cannot be empty")
        existing = db.query(models.Chapter).filter(
            models.Chapter.name == name,
            models.Chapter.subject_id == chapter.subject_id,
            models.Chapter.id != chapter_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Chapter already exists in this subject")
        chapter.name = name
    db.commit()
    db.refresh(chapter)
    return chapter

@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(chapter)
    db.commit()
    return None

# ============================
# TOPICS
# ============================

@router.post("/topics", response_model=schemas.TopicResponse)
def create_topic(
    topic_in: schemas.TopicCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    if not topic_in.name or not topic_in.name.strip():
        raise HTTPException(status_code=400, detail="Topic name cannot be empty")
    # Verify parent exists
    chapter = db.query(models.Chapter).filter(models.Chapter.id == topic_in.chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=400, detail="Parent chapter not found")
    topic = models.Topic(
        name=topic_in.name.strip(),
        description=topic_in.description,
        chapter_id=topic_in.chapter_id,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.get("/topics", response_model=List[schemas.TopicResponse])
def get_topics(chapter_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Topic)
    if chapter_id:
        query = query.filter(models.Topic.chapter_id == chapter_id)
    return query.order_by(models.Topic.name).all()

@router.get("/topics/{topic_id}", response_model=schemas.TopicResponse)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic

@router.put("/topics/{topic_id}", response_model=schemas.TopicResponse)
def update_topic(
    topic_id: int,
    topic_in: schemas.TopicUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    if topic_in.name is not None:
        name = topic_in.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Topic name cannot be empty")
        topic.name = name
    if topic_in.description is not None:
        topic.description = topic_in.description
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return None
