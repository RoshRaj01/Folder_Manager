import httpx
import re
from app.indexer.indexer import FolderIndex
from app.core.config import settings
from app.agent import tools

def detect_intent(message: str) -> dict:
    msg = message.lower()

    # Size query
    if any(w in msg for w in ["above", "larger", "bigger", "more than", "greater", "exceed", "over"]):
        nums = re.findall(r'\d+\.?\d*', msg)
        size = float(nums[0]) if nums else 1.0

        # Normalize message (remove spaces for cases like "100 KB")
        msg_clean = msg.replace(" ", "")

        # Detect unit
        if "gb" in msg_clean:
            size_mb = size * 1024
            unit = "GB"
        elif "mb" in msg_clean:
            size_mb = size
            unit = "MB"
        elif "kb" in msg_clean:
            size_mb = size / 1024
            unit = "KB"
        elif "b" in msg_clean:
            size_mb = size / (1024 * 1024)
            unit = "B"
        else:
            size_mb = size  # default MB
            unit = "MB"

        return {
            "type": "size",
            "size_mb": size_mb,
            "original_size": size,
            "unit": unit
        }

    # Content search
    if any(w in msg for w in ["find", "search", "contain", "which file has", "look for",
                               "word", "phrase", "sentence", "inside", "includes"]):
        # Extract keyword after common phrases
        for phrase in ["find files with", "find file with", "which file has", "which files have",
                       "which files contain", "search for", "look for", "containing",
                       "files with the word", "file with the word", "files that have",
                       "files that contain", "find the word", "find word"]:
            if phrase in msg:
                keyword = message[msg.index(phrase) + len(phrase):].strip().strip('"\'?.')
                return {"type": "search", "keyword": keyword}
        # Fallback — last meaningful word
        words = [w for w in message.split() if len(w) > 3]
        keyword = words[-1].strip('?"\'.,') if words else message
        return {"type": "search", "keyword": keyword}

    # Read specific file
    if any(w in msg for w in ["read", "open", "show content", "content of", "what is in", "what's in"]):
        quoted = re.findall(r'["\']([^"\']+)["\']', message)
        if quoted:
            return {"type": "read", "filename": quoted[0]}
        ext_match = re.findall(
            r'\b[\w\-. ]+\.(?:txt|pdf|docx|xlsx|csv|md|json|py|js|html)\b',
            message, re.IGNORECASE
        )
        if ext_match:
            return {"type": "read", "filename": ext_match[0]}
        return {"type": "read", "filename": None}

    # Stats
    if any(w in msg for w in ["stats", "summary", "overview", "total size",
                               "breakdown", "how many files", "types of files"]):
        return {"type": "stats"}

    # Default — list
    return {"type": "list"}


def run_tool(index: FolderIndex, intent: dict) -> str:
    itype = intent["type"]

    if itype == "size":
        return tools.files_above_size(index, intent["size_mb"])
    elif itype == "search":
        return tools.search_content(index, intent["keyword"])
    elif itype == "read":
        if intent.get("filename"):
            return tools.get_file_content(index, intent["filename"])
        return "Please specify the filename you want to read."
    elif itype == "stats":
        return tools.get_file_stats(index)
    else:
        return tools.list_files(index)


def call_ollama(system: str, user_message: str) -> str:
    try:
        response = httpx.post(
            f"{settings.ollama_base_url}/api/chat",
            json={
                "model": settings.ollama_model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_message}
                ],
                "stream": False
            },
            timeout=180
        )
        response.raise_for_status()
        return response.json()["message"]["content"]
    except httpx.ConnectError:
        return "ERROR: Cannot connect to Ollama. Make sure 'ollama serve' is running."
    except httpx.TimeoutException:
        return "ERROR: Ollama timed out. Try a faster model like mistral."
    except Exception as e:
        return f"ERROR: {str(e)}"


def ask_agent(index: FolderIndex, user_message: str) -> str:
    # Step 1 — detect what user wants
    intent = detect_intent(user_message)

    # Step 2 — run tool in Python, get REAL data
    tool_result = run_tool(index, intent)

    # Step 3 — for list/size/stats queries, skip LLM entirely
    # These are factual — just return the real data directly
    if intent["type"] in ["list", "size", "stats", "search", "read"]:
        return tool_result

    # Step 4 — for search and read, use LLM only to format the answer
    # but strictly constrained to the tool result
    system = """You are a file manager assistant.
The user asked about files in their folder.
The ACTUAL result from searching the real folder is given below.
Reply using ONLY this information. Do not add any filenames or content not present below.
Keep your answer short and direct."""

    prompt = f"""User asked: {user_message}

Real result from the folder:
{tool_result}

Answer the user using only the above data."""

    return call_ollama(system, prompt)