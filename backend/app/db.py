"""Database setup using SQLModel and SQLite."""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False,
)


def init_db() -> None:
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency generator for database sessions."""
    with Session(engine) as session:
        yield session
