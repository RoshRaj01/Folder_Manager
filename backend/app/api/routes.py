from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from app.api.schemas import SetFolderRequest, QueryRequest, QueryResponse, IndexStatusResponse, CreateItemRequest, DeleteItemRequest
from app.indexer.indexer import build_index
from app.core.session import set_index, get_index
import os
import shutil
import traceback
from pathlib import Path

router = APIRouter()


@router.post("/set-folder")
def set_folder(req: SetFolderRequest):
    if not os.path.isdir(req.folder_path):
        raise HTTPException(status_code=400, detail="Invalid folder path.")
    index = build_index(req.folder_path)
    set_index(req.session_id, index)
    return {"success": True, "total_files": index.total_files, "folder": req.folder_path}


@router.get("/index-status/{session_id}", response_model=IndexStatusResponse)
def index_status(session_id: str):
    index = get_index(session_id)
    if not index:
        return IndexStatusResponse(session_id=session_id, indexed=False)
    return IndexStatusResponse(
        session_id=session_id,
        indexed=True,
        total_files=index.total_files,
        folder=index.base_folder
    )


@router.get("/debug-index/{session_id}")
def debug_index(session_id: str):
    index = get_index(session_id)
    if not index:
        return {"error": "No index found for this session"}
    return {
        "folder": index.base_folder,
        "total_files": index.total_files,
        "files": [
            {
                "name": f.name,
                "size_kb": round(f.size_bytes / 1024, 2),
                "has_content": f.content is not None,
                "created_at": f.created_at,
                "modified_at": f.modified_at
            }
            for f in index.files
        ]
    }

@router.post("/create-item")
def create_item(req: CreateItemRequest):
    index = get_index(req.session_id)
    if not index:
        raise HTTPException(status_code=400, detail="No folder set. Call /set-folder first.")
    
    # We resolve the absolute path and ensure it's inside the base folder
    base_dir = Path(index.base_folder).resolve()
    target_path = (base_dir / req.filename).resolve()
    
    if not str(target_path).startswith(str(base_dir)):
        raise HTTPException(status_code=400, detail="Filename points outside the project folder.")
        
    try:
        if req.is_folder:
            target_path.mkdir(parents=True, exist_ok=True)
        else:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            target_path.touch()
        
        # Rebuild index
        new_index = build_index(index.base_folder)
        set_index(req.session_id, new_index)
        return {"success": True, "message": f"Created {req.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/delete-item")
def delete_item(req: DeleteItemRequest):
    index = get_index(req.session_id)
    if not index:
        raise HTTPException(status_code=400, detail="No folder set.")

    base_dir = Path(index.base_folder).resolve()
    target_path = (base_dir / req.filename).resolve()

    if not str(target_path).startswith(str(base_dir)):
        raise HTTPException(status_code=400, detail="Filename points outside the project folder.")

    if not target_path.exists():
        raise HTTPException(status_code=404, detail="File or folder not found.")

    try:
        if target_path.is_dir():
            shutil.rmtree(target_path)
        else:
            target_path.unlink()

        # Rebuild index
        new_index = build_index(index.base_folder)
        set_index(req.session_id, new_index)
        return {"success": True, "message": f"Deleted {req.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
def query(req: QueryRequest):
    try:
        index = get_index(req.session_id)
        if not index:
            return JSONResponse(content={
                "reply": "",
                "error": "No folder set. Call /set-folder first."
            })

        # Import here so if bot.py is broken we see the real error
        from app.agent.bot import ask_agent

        reply_data = ask_agent(index, req.message)
        
        # Determine if ask_agent returned a dict (like {"action": "...", "reply": "..."}) or a string.
        # We need to adapt the JSONResponse.
        if isinstance(reply_data, dict):
            # If the action requires re-indexing, let's do it and pass back the payload
            if reply_data.get("action") == "reindex":
                new_index = build_index(index.base_folder)
                set_index(req.session_id, new_index)
            return JSONResponse(content={"reply": reply_data.get("reply", ""), "action": reply_data.get("action"), "target": reply_data.get("target"), "error": None})
        else:
            return JSONResponse(content={"reply": str(reply_data), "error": None})

    except Exception as e:
        error_detail = traceback.format_exc()
        print("=== QUERY ERROR ===")
        print(error_detail)
        print("===================")
        return JSONResponse(
            status_code=200,  # Return 200 so Swagger shows the body
            content={"reply": "", "error": str(e) + "\n\nTraceback:\n" + error_detail}
        )