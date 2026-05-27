from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.models.user import User
from app.api.deps import get_current_user
from app.core.security import get_password_hash
from typing import List

router = APIRouter()

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_in: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.age is not None:
        current_user.age = user_in.age
    if user_in.class_name is not None:
        current_user.class_name = user_in.class_name
    if user_in.board is not None:
        current_user.board = user_in.board
    if user_in.school_name is not None:
        current_user.school_name = user_in.school_name
        
    db.commit()
    db.refresh(current_user)
    return current_user

from app.models.syllabus import Board, ClassLevel, Subject
from app.models.video import Video

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    board = None
    if current_user.board:
        # Case insensitive match, e.g. "cbse" matches "CBSE"
        board = db.query(Board).filter(Board.name.ilike(f"%{current_user.board}%")).first()
        
    class_level = None
    if current_user.class_name:
        # Case insensitive match, e.g. "10" matches "Class 10"
        query = db.query(ClassLevel).filter(ClassLevel.class_name.ilike(f"%{current_user.class_name}%"))
        if board:
            query = query.filter(ClassLevel.board_id == board.id)
        class_level = query.first()
    
    subjects = []
    if class_level:
        subjects_db = db.query(Subject).filter(Subject.class_id == class_level.id).all()
        subjects = [{"id": s.id, "name": s.name} for s in subjects_db]
        
    videos_count = 0
    if board and class_level:
        videos_count = db.query(Video).filter(Video.board_id == board.id, Video.class_id == class_level.id, Video.is_published == True).count()
        
    return {
        "board_name": board.name if board else current_user.board,
        "class_name": class_level.class_name if class_level else current_user.class_name,
        "class_id": class_level.id if class_level else None,
        "subjects": subjects,
        "videos_count": videos_count
    }

# ============================
# ADMIN USER MANAGEMENT
# ============================

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).filter(User.role == "student").all()
    return users

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(User).filter(User.id == user_id, User.role == "student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.post("/student", response_model=UserResponse)
def create_student(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create new student user
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        age=user_in.age,
        class_name=user_in.class_name,
        board=user_in.board,
        school_name=user_in.school_name,
        role="student"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
