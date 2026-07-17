"""Lightweight TF-IDF retrieval over the real knowledge base — no external
embedding service, no extra heavy dependency (sklearn is already installed
for the ML pipeline)."""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from chat_knowledge import KNOWLEDGE_CHUNKS

_vectorizer = None
_matrix = None


def _build_index():
    global _vectorizer, _matrix
    texts = [c["text"] for c in KNOWLEDGE_CHUNKS]
    _vectorizer = TfidfVectorizer(stop_words="english")
    _matrix = _vectorizer.fit_transform(texts)


def retrieve(query: str, top_k: int = 3) -> list[dict]:
    if _vectorizer is None:
        _build_index()
    query_vec = _vectorizer.transform([query])
    scores = cosine_similarity(query_vec, _matrix)[0]
    ranked = sorted(range(len(scores)), key=lambda i: -scores[i])[:top_k]
    return [
        {**KNOWLEDGE_CHUNKS[i], "score": float(scores[i])} for i in ranked if scores[i] > 0
    ]
