import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from db_models import ChatMessage, User
from llm import LLMNotConfiguredError, LLMRequestError, call_pathumma
from rag import retrieve

router = APIRouter()

SYSTEM_PROMPT_TEMPLATE = (
    "You are the assistant for the AI-Based Fishing Habitat Suitability Assessment "
    "platform, a GeoAI research tool for the Gulf of Thailand and Andaman Sea. "
    "Answer using ONLY the real context provided below — if the context doesn't "
    "cover the question, say you don't have that information rather than "
    "guessing. Always be clear about what is real data versus a literature-based "
    "proxy, never overstate certainty.\n\nContext:\n{context}"
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    sources: list[str]
    mode: str  # "llm" (Pathumma-generated) or "retrieval" (matched documentation, no LLM)


NO_MATCH_ANSWER = (
    "I don't have documentation matching that question. Try asking about "
    "suitability, risk, data sources, model architecture, confidence, or how "
    "to use the Map and Prediction pages."
)


@router.get("/status")
def chat_status():
    return {"configured": bool(os.environ.get("AIFORTHAI_APIKEY"))}


@router.post("", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chunks = retrieve(body.message, top_k=3)
    context = "\n\n".join(c["text"] for c in chunks) or "No specific matching context found."
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(context=context)

    try:
        answer = call_pathumma(instruction=body.message, system_prompt=system_prompt)
        mode = "llm"
    except LLMNotConfiguredError:
        # No Pathumma key set — fall back to the real TF-IDF retrieval itself
        # rather than a hard error, so the chatbot stays usable out of the box.
        # This is never a generated answer, only real matched documentation.
        answer = chunks[0]["text"] if chunks else NO_MATCH_ANSWER
        mode = "retrieval"
    except LLMRequestError as e:
        raise HTTPException(status_code=502, detail=str(e))

    if user is not None:
        db.add(ChatMessage(user_id=user.id, role="user", content=body.message))
        db.add(ChatMessage(user_id=user.id, role="assistant", content=answer))
        db.commit()

    return ChatResponse(response=answer, sources=[c["id"] for c in chunks], mode=mode)


@router.get("/history")
def chat_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user is None:
        return {"messages": []}
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return {
        "messages": [
            {"role": r.role, "content": r.content, "created_at": r.created_at.isoformat()}
            for r in rows
        ]
    }
