from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from schemas import GitaQueryRequest, GitaQueryResponse # type: ignore
from rag_core.wisdom_engine import answer_query

app = FastAPI( # type: ignore
    title="Gita-GPT",
    description="Bhagavad Gita RAG API (source: vivekavani.com)",
    version="1.0.0"
)

# -------------------------
# CORS (for frontend later)
# -------------------------

app.add_middleware( # type: ignore
    CORSMiddleware,
    allow_origins=["*"],  # restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Health Check
# -------------------------

@app.get("/health") # type: ignore
def health():
    return {"status": "ok"}

# -------------------------
# Core RAG Endpoint
# -------------------------

@app.post("/ask", response_model=GitaQueryResponse) # type: ignore
def ask_gita(request: GitaQueryRequest): # type: ignore
    question = request.question.strip() # type: ignore

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    response = answer_query(question) # type: ignore

    return {
        "guidance": response["guidance"], # type: ignore
        "quotes": response["quotes"],
        "source": "vivekavani.com"
    }
