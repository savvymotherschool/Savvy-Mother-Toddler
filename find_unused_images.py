from pathlib import Path

ROOT = Path(__file__).resolve().parent
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".ico", ".gif", ".svg"}
TEXT_EXTS = {".html", ".css", ".js", ".json", ".webmanifest", ".xml", ".txt", ".php", ".md"}
SKIP_DIRS = {".git"}


def is_in_skip_dir(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def main() -> None:
    text = ""
    for path in ROOT.rglob("*"):
        if not path.is_file() or is_in_skip_dir(path) or path.name == Path(__file__).name:
            continue
        if path.suffix.lower() in TEXT_EXTS or path.name == "site.webmanifest":
            try:
                text += "\n" + path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                pass

    unused = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or is_in_skip_dir(path):
            continue
        if path.suffix.lower() not in IMAGE_EXTS:
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel not in text and rel.lstrip("/") not in text:
            unused.append(rel)

    if unused:
        print("\n".join(unused))
    else:
        print("No unused image files found.")


if __name__ == "__main__":
    main()
