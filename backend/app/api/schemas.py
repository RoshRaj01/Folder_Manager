from pydantic import BaseModel

class SetFolderRequest(BaseModel):
    session_id: str
    folder_path: str

class QueryRequest(BaseModel):
    session_id: str
    message: str

class QueryResponse(BaseModel):
    reply: str
    error: str | None = None

class IndexStatusResponse(BaseModel):
    session_id: str
    indexed: bool
    total_files: int = 0
    folder: str = ""

class CreateItemRequest(BaseModel):
    session_id: str
    filename: str
    is_folder: bool = False

class DeleteItemRequest(BaseModel):
    session_id: str
    filename: str