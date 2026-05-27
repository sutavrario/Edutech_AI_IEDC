from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# TOPIC
class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    chapter_id: int

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TopicResponse(TopicBase):
    id: int

    class Config:
        from_attributes = True


# CHAPTER
class ChapterBase(BaseModel):
    name: str
    subject_id: int

class ChapterCreate(ChapterBase):
    pass

class ChapterUpdate(BaseModel):
    name: Optional[str] = None

class ChapterResponse(ChapterBase):
    id: int
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True


# SUBJECT
class SubjectBase(BaseModel):
    name: str
    class_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None

class SubjectResponse(SubjectBase):
    id: int
    chapters: List[ChapterResponse] = []

    class Config:
        from_attributes = True


# CLASS LEVEL
class ClassLevelBase(BaseModel):
    class_name: str
    board_id: int

class ClassLevelCreate(ClassLevelBase):
    pass

class ClassLevelUpdate(BaseModel):
    class_name: Optional[str] = None

class ClassLevelResponse(ClassLevelBase):
    id: int
    subjects: List[SubjectResponse] = []

    class Config:
        from_attributes = True


# BOARD
class BoardBase(BaseModel):
    name: str

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BaseModel):
    name: Optional[str] = None

class BoardResponse(BoardBase):
    id: int
    created_at: datetime
    classes: List[ClassLevelResponse] = []

    class Config:
        from_attributes = True
