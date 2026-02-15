from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import uuid

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lyrnios_auth.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=True)  # text content for user messages
    data = Column(JSON, nullable=True)     # JSON data for assistant responses
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("ChatSession", back_populates="messages")


# ── Database utilities ──────────────────────────────────

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


# ── User CRUD ───────────────────────────────────────────

def get_user_by_google_id(db, google_id: str):
    """Get user by Google ID"""
    return db.query(User).filter(User.google_id == google_id).first()


def get_user_by_email(db, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def create_user(db, google_id: str, email: str, name: str = None, picture: str = None):
    """Create new user"""
    user = User(
        google_id=google_id,
        email=email,
        name=name,
        picture=picture
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── ChatSession CRUD ────────────────────────────────────

def create_chat_session(db, user_id: int, session_id: str = None, title: str = "New Chat"):
    """Create a new chat session"""
    session = ChatSession(
        id=session_id or str(uuid.uuid4()),
        user_id=user_id,
        title=title
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_user_sessions(db, user_id: int, limit: int = 50, offset: int = 0):
    """Get user's chat sessions, newest first"""
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_session_by_id(db, session_id: str):
    """Get a chat session by ID"""
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()


def update_session_title(db, session_id: str, title: str):
    """Update session title"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        session.title = title
        session.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(session)
    return session


def delete_chat_session(db, session_id: str):
    """Delete a chat session and all its messages"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        db.delete(session)
        db.commit()
        return True
    return False


# ── ChatMessage CRUD ────────────────────────────────────

def add_message(db, session_id: str, role: str, content: str = None, data: dict = None):
    """Add a message to a chat session"""
    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        data=data
    )
    db.add(message)

    # Update session's updated_at timestamp
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        session.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)
    return message


def get_session_messages(db, session_id: str):
    """Get all messages in a session, ordered by creation time"""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
