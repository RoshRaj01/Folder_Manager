from app.indexer.indexer import FolderIndex
import re


def list_files(index: FolderIndex) -> str:
    if not index.files:
        return "No files found in the folder."
    lines = [f"- {f.name} ({round(f.size_bytes/1024, 1)} KB)" for f in index.files]
    return f"Total {index.total_files} files:\n" + "\n".join(lines)


def files_above_size(index: FolderIndex, size_mb: float, original_size=None, unit="MB") -> str:
    threshold = size_mb * 1024 * 1024
    matched = [f for f in index.files if f.size_bytes > threshold]
    if not matched:
        return f"No files above {original_size} {unit}."
    lines = [f"- {f.name} ({round(f.size_bytes/(1024*1024), 2)} MB)" for f in matched]
    return f"{len(matched)} file(s) above {original_size} {unit}:\n" + "\n".join(lines)


def search_content(index: FolderIndex, keyword: str) -> str:
    print("=== DEBUG CONTENT CHECK ===")
    for f in index.files[:5]:
        print(f"{f.name} -> {'HAS CONTENT' if f.content else 'NO CONTENT'}")

    keyword_lower = re.sub(r'\s+', '', keyword.lower())
    matched = []
    for f in index.files:
        if f.content:
            content_clean = re.sub(r'\s+', '', f.content.lower())
            if keyword_lower in content_clean:
                matched.append(f.name)
    if not matched:
        return f'No files contain the keyword "{keyword}".'
    return f'Files containing "{keyword}":\n' + "\n".join(f"- {n}" for n in matched)


def get_file_content(index: FolderIndex, filename: str) -> str:
    for f in index.files:
        if f.name.lower() == filename.lower():
            if f.content:
                # Return first 3000 chars to avoid overwhelming the LLM
                return f.content[:3000]
            else:
                return f"File '{filename}' exists but its content could not be read (binary or too large)."
    return f"File '{filename}' not found in the indexed folder."


def get_file_stats(index: FolderIndex) -> str:
    if not index.files:
        return "No files indexed."
    total_size = sum(f.size_bytes for f in index.files)
    by_ext: dict[str, int] = {}
    for f in index.files:
        by_ext[f.extension] = by_ext.get(f.extension, 0) + 1
    ext_summary = ", ".join(f"{ext or 'no-ext'}: {count}" for ext, count in sorted(by_ext.items()))
    return (
        f"Total files: {index.total_files}\n"
        f"Total size: {round(total_size/(1024*1024), 2)} MB\n"
        f"By type: {ext_summary}"
    )