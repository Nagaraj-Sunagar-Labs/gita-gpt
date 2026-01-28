"""
Bhagavad Gita RAG Wisdom Engine
Guidance-first answers with confidence-aware fallbacks
"""

import json
import faiss
import numpy as np # type: ignore
from sentence_transformers import SentenceTransformer
from difflib import SequenceMatcher

# =========================
# CONFIG
# =========================

MIN_SIMILARITY_SCORE = 0.45   # lowered for philosophy & emotional queries
MAX_ANSWERS = 2

# =========================
# PATHS
# =========================

FAISS_INDEX_FILE = "rag_base/gita_faiss_index/gita.index"
METADATA_FILE = "rag_base/gita_faiss_index/metadata.json"
CHUNKS_FILE = "rag_base/gita_rag_chunks/gita_chunks.json"
SOURCE_CHAPTER_DIR = "rag_base/gita_json"

# =========================
# LOAD MODELS & DATA
# =========================

print("🧠 Loading embedding model...")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

print("📦 Loading FAISS index...")
index = faiss.read_index(FAISS_INDEX_FILE) # type: ignore

print("📄 Loading metadata...")
with open(METADATA_FILE, "r", encoding="utf-8") as f:
    metadata = json.load(f)

print("📄 Loading chunks...")
with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
    all_chunks = json.load(f)

CHUNK_LOOKUP = {c["id"]: c for c in all_chunks}

# Load original Sanskrit + translation
VERSE_LOOKUP = {}
for i in range(1, 19):
    with open(f"{SOURCE_CHAPTER_DIR}/chapter_{i:02d}.json", "r", encoding="utf-8") as f:
        verses = json.load(f)
        for v in verses:
            VERSE_LOOKUP[(v["chapter"], v["verse"])] = v

# =========================
# QUERY UNDERSTANDING
# =========================

LIFE_DOMAIN_KEYWORDS = {
    "career": ["job", "work", "career", "office", "profession", "salary", "boss"],
    "fear": ["fear", "afraid", "anxiety", "anxious", "worry"],
    "family": ["family", "parents", "children", "relationship"],
    "mental_health": ["stress", "mind", "peace", "calm", "depression"],
    "purpose": ["lost", "meaning", "direction", "motivation"]
}

THEME_KEYWORDS = {
    "karma_yoga": ["duty", "action", "work", "results", "detachment"],
    "bhakti": ["devotion", "faith", "surrender", "love"],
    "jnana": ["knowledge", "self", "soul", "truth"],
    "meditation": ["meditation", "focus", "mind"]
}

def infer_query_constraints(query: str): # type: ignore
    q = query.lower()
    themes, domains = set(), set() # type: ignore

    for d, keys in LIFE_DOMAIN_KEYWORDS.items():
        if any(k in q for k in keys):
            domains.add(d) # type: ignore

    for t, keys in THEME_KEYWORDS.items():
        if any(k in q for k in keys):
            themes.add(t) # type: ignore

    return {
        "themes": list(themes), # type: ignore
        "life_domains": list(domains) # type: ignore
    }

# =========================
# VAGUE QUERY DETECTION (FIXED)
# =========================

def is_truly_vague(query: str, constraints: dict) -> bool: # type: ignore
    """
    A query is vague ONLY if:
    - Extremely short
    - AND no themes detected
    - AND no life domains detected
    """
    return (
        len(query.strip().split()) < 3
        and not constraints["themes"]
        and not constraints["life_domains"]
    )

# =========================
# HELPERS
# =========================

def text_similarity(a, b): # type: ignore
    return SequenceMatcher(None, a, b).ratio() # type: ignore

def select_top_distinct(results): # type: ignore
    selected = []
    for r in results: # type: ignore
        if len(selected) == MAX_ANSWERS: # type: ignore
            break
        if not selected or all(text_similarity(r["text"], s["text"]) < 0.75 for s in selected): # type: ignore
            selected.append(r) # type: ignore
    return selected # type: ignore

# =========================
# FALLBACK RESPONSES
# =========================

def vague_query_fallback():
    return (
        "The Bhagavad Gita offers guidance for many aspects of life. "
        "If you feel comfortable, could you share a little more about "
        "what you are going through right now?"
    )

def low_confidence_fallback():
    return (
        "The teachings of the Gita are subtle and wide-ranging. "
        "I may need a bit more clarity about your situation to offer "
        "relevant guidance. Please feel free to rephrase or expand your question."
    )

# =========================
# RETRIEVE & ANSWER
# =========================

def answer_query(query: str): # type: ignore
    constraints = infer_query_constraints(query) # type: ignore

    # ---- Proper vague query detection ----
    if is_truly_vague(query, constraints):
        return {
            "guidance": vague_query_fallback(), # type: ignore
            "quotes": []
        }

    query_embedding = model.encode( # type: ignore
        [query],
        normalize_embeddings=True
    ).astype("float32")

    scores, indices = index.search(query_embedding, 40) # type: ignore

    candidates = []

    for idx, score in zip(indices[0], scores[0]): # type: ignore
        meta = metadata[idx]

        if constraints["themes"]:
            if not set(constraints["themes"]).intersection(meta["themes"]): # type: ignore
                continue

        if constraints["life_domains"]:
            if not set(constraints["life_domains"]).intersection(meta["life_domains"]): # type: ignore
                continue

        chunk = CHUNK_LOOKUP[meta["id"]]

        candidates.append({ # type: ignore
            "score": float(score), # type: ignore
            "chapter": meta["chapter"],
            "verse": meta["verse"],
            "text": chunk["text"]
        })

    # ---- No candidates at all ----
    if not candidates:
        return {
            "guidance": low_confidence_fallback(), # type: ignore
            "quotes": []
        }

    candidates.sort(key=lambda x: -x["score"]) # type: ignore
    best_score = candidates[0]["score"] # type: ignore

    # ---- Low confidence ONLY if no context signals ----
    if (
        best_score < MIN_SIMILARITY_SCORE
        and not constraints["themes"]
        and not constraints["life_domains"]
    ):
        return {
            "guidance": low_confidence_fallback(), # type: ignore
            "quotes": []
        }

    best = select_top_distinct(candidates) # type: ignore

    # ---- Guidance-first explanation ----
    guidance = (
        "When a person feels lost or lacks motivation, the Bhagavad Gita teaches that "
        "clarity is not regained by withdrawing from life, but by engaging in one’s duty "
        "with the right understanding. Action performed without attachment to results "
        "gradually restores inner strength, purpose, and peace."
    )

    quotes = []
    for b in best: # type: ignore
        verse_data = VERSE_LOOKUP.get((b["chapter"], b["verse"]), {}) # type: ignore
        quotes.append({ # type: ignore
            "chapter": b["chapter"],
            "verse": b["verse"],
            "sanskrit": verse_data.get("sanskrit", ""), # type: ignore
            "translation": verse_data.get("translation", ""), # type: ignore
            "explanation": b["text"]
        })

    return {
        "guidance": guidance, # type: ignore
        "quotes": quotes
    }

# =========================
# MAIN
# =========================

def run_cli(): # type: ignore
    query = input("\n🙏 Ask the Gita: ")
    response = answer_query(query) # type: ignore
    return response # type: ignore

if __name__ == "__main__":
    result = run_cli() # type: ignore
    print(result["guidance"]) # type: ignore
