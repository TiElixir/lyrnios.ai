from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from ai import ai  # your AI wrapper
import json
import os
import re
from typing import List

from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

# Import authentication modules
from auth import oauth, create_access_token, get_current_user, get_or_create_user, FRONTEND_URL, SECRET_KEY
from database import (
    get_db, init_db,
    create_chat_session, get_user_sessions, get_session_by_id,
    update_session_title, delete_chat_session,
    add_message, get_session_messages
)
from models import (
    UserResponse, TokenResponse,
    ChatSessionCreate, ChatSessionResponse, ChatSessionDetail,
    ChatMessageCreate, ChatMessageResponse
)

app = FastAPI()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Add SessionMiddleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Prompt(BaseModel):
    prompt: str
    session_id: str | None = None  # optional: auto-save to session

def sanitize_mermaid_text(text: str) -> str:
    text = re.sub(r'<br\s*/?>', r'\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<.*?>', '', text)
    return text

def escape_mermaid_chars(text: str) -> str:
    replacements = {
        '{': '(',
        '}': ')',
        '&': 'and',
        '#': '',
        '%': 'percent',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def wrap_text(text: str, width: int = 40) -> str:
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        if len(current_line + " " + word) > width:
            lines.append(current_line.strip())
            current_line = word
        else:
            current_line += " " + word
    lines.append(current_line.strip())
    return "\n".join(lines)

def preprocess_mermaid(diagram: str) -> str:
    if not diagram or not diagram.strip():
        return "graph TD\n    A[No diagram available]"

    try:
        diagram = sanitize_mermaid_text(diagram)
        diagram = escape_mermaid_chars(diagram)

        def quote_node(match):
            content = match.group(1)
            content = ' '.join(content.split())
            content = wrap_text(content, width=35)
            return f'["{content}"]'

        diagram = re.sub(r'\[(.*?)\]', quote_node, diagram)

        diagram = diagram.strip()
        if not any(diagram.startswith(x) for x in ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'gitgraph', 'pie', 'journey', 'gantt']):
            diagram = f"graph TD\n    {diagram}"

        return diagram
    except Exception as e:
        print(f"Error preprocessing mermaid diagram: {e}")
        return "graph TD\n    A[Diagram Error] --> B[Please try regenerating]"

def sanitize_ai_json(json_str: str) -> dict:
    json_str = json_str.replace('\n', '\\n').replace('\r', '')
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {json.dumps({'error': str(e)}, indent=2)}")
        json_str = re.sub(r'(?<!\\)"', '\\"', json_str)
        try:
            return json.loads(json_str)
        except Exception as ex:
            raise HTTPException(status_code=500, detail=f"Failed to parse AI JSON: {ex}")

# ══════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "yo im fine"}

@app.get("/")
def root():
    return {"about": "created by datavorous"}


# ── Authentication Routes ────────────────────────────────

@app.get("/auth/google")
async def google_login(request: Request):
    """Initiate Google OAuth flow"""
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db=Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")

        user = get_or_create_user(db, user_info)

        access_token = create_access_token(
            data={"sub": user.google_id, "email": user.email}
        )

        redirect_url = f"{FRONTEND_URL}/auth/callback?token={access_token}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        print(f"Auth error: {e}")
        error_url = f"{FRONTEND_URL}/login?error=auth_failed"
        return RedirectResponse(url=error_url)


@app.get("/auth/user", response_model=UserResponse)
async def get_user(current_user=Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user


@app.post("/auth/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}


# ── Chat Session Routes ─────────────────────────────────

@app.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    body: ChatSessionCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Create a new chat session"""
    session = create_chat_session(
        db=db,
        user_id=current_user.id,
        session_id=body.id,
        title=body.title or "New Chat"
    )
    return ChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0
    )


@app.get("/sessions", response_model=List[ChatSessionResponse])
async def list_sessions(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """List user's chat sessions, newest first"""
    sessions = get_user_sessions(db, current_user.id)
    result = []
    for s in sessions:
        result.append(ChatSessionResponse(
            id=s.id,
            user_id=s.user_id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            message_count=len(s.messages)
        ))
    return result


@app.get("/sessions/{session_id}", response_model=ChatSessionDetail)
async def get_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get a chat session with all messages"""
    session = get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    messages = get_session_messages(db, session_id)
    return ChatSessionDetail(
        id=session.id,
        user_id=session.user_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=len(messages),
        messages=[ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            data=m.data,
            created_at=m.created_at
        ) for m in messages]
    )


@app.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def add_session_message(
    session_id: str,
    body: ChatMessageCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Add a message to a chat session"""
    session = get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    message = add_message(
        db=db,
        session_id=session_id,
        role=body.role,
        content=body.content,
        data=body.data
    )

    # Auto-update session title from first user message
    if body.role == "user" and session.title == "New Chat":
        title = (body.content[:60] + "...") if len(body.content) > 60 else body.content
        update_session_title(db, session_id, title)

    return ChatMessageResponse(
        id=message.id,
        session_id=message.session_id,
        role=message.role,
        content=message.content,
        data=message.data,
        created_at=message.created_at
    )


@app.delete("/sessions/{session_id}")
async def remove_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Delete a chat session"""
    session = get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    delete_chat_session(db, session_id)
    return {"message": "Session deleted"}


# ── Content Generation Routes ────────────────────────────

@app.post("/generate")
def generate(query: Prompt):
    try:
        raw_result = ai(query.prompt)
        result_json = sanitize_ai_json(raw_result) if isinstance(raw_result, str) else raw_result

        if "mermaid_diagram" in result_json and result_json["mermaid_diagram"]:
            result_json["mermaid_diagram"] = preprocess_mermaid(result_json["mermaid_diagram"])
        else:
            result_json["mermaid_diagram"] = "graph TD\n    A[Diagram Not Available]"

        print(f"[GENERATE] Response:\n{json.dumps(result_json, indent=2)}")
        return result_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/demo")
def demo(query: Prompt):
    if "write" in query.prompt:
        demo_file_path = "../demos/gc2.json"
    elif "garbage" in query.prompt:
        demo_file_path = "../demos/gc.json"
    elif "equa" in query.prompt:
        demo_file_path = "../demos/eqn_motion.json"
    elif "mughal" in query.prompt:
        demo_file_path = "../demos/mughal.json"
    elif "regression" in query.prompt:
        demo_file_path = "demos/regression.json"
    elif "maximum" in query.prompt:
        demo_file_path = "demos/regression2.json"
    else:
        demo_file_path = "../demos/error.json"

    if not os.path.exists(demo_file_path):
        raise HTTPException(status_code=404, detail="demo.json not found")
    try:
        with open(demo_file_path, "r", encoding="utf-8") as f:
            demo_data = json.load(f)

        if 'mermaid_diagram' in demo_data:
            demo_data['mermaid_diagram'] = preprocess_mermaid(demo_data['mermaid_diagram'])

        print(f"[DEMO] Response:\n{json.dumps(demo_data, indent=2)}")
        return demo_data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in demo.json")