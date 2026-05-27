from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    age: Optional[int] = Field(None, gt=0, lt=100)
    class_name: Optional[str] = None
    board: Optional[str] = None
    school_name: Optional[str] = None

    @field_validator("class_name")
    def validate_class_name(cls, v):
        if v and v not in ["5", "6", "7", "8", "9", "10"]:
            raise ValueError("Class must be between 5 and 10")
        return v

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=6)

# Properties to receive via API on update
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, gt=0, lt=100)
    class_name: Optional[str] = None
    board: Optional[str] = None
    school_name: Optional[str] = None

    @field_validator("class_name")
    def validate_class_name(cls, v):
        if v and v not in ["5", "6", "7", "8", "9", "10"]:
            raise ValueError("Class must be between 5 and 10")
        return v

class UserInDBBase(UserBase):
    id: Optional[int] = None
    role: str = "student"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class UserResponse(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    id: Optional[str] = None
