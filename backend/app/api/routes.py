from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from app.api.schemas import SetFolderRequest, QueryRequest, QueryResponse, IndexStatusResponse
from app.indexer.indexer import build_index
from app.core.session import set_index, get_index
import os
import traceback

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
                "has_content": f.content is not None
            }
            for f in index.files
        ]
    }


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

        reply = ask_agent(index, req.message)
        return JSONResponse(content={"reply": reply, "error": None})

    except Exception as e:
        error_detail = traceback.format_exc()
        print("=== QUERY ERROR ===")
        print(error_detail)
        print("===================")
        return JSONResponse(
            status_code=200,  # Return 200 so Swagger shows the body
            content={"reply": "", "error": str(e) + "\n\nTraceback:\n" + error_detail}
        )