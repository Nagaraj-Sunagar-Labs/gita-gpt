from pydantic import BaseModel   # type: ignore
from typing import List, Optional  # type: ignore

class GitaQueryRequest(BaseModel):  # type: ignore
    question: str

class GitaQuote(BaseModel):  # type: ignore
    chapter: int
    verse: int
    sanskrit: str
    translation: str
    explanation: str

class GitaQueryResponse(BaseModel):  # type: ignore
    guidance: str 
    quotes: List[GitaQuote]
    source: str
