
from pathlib import Path
import re
import shutil

ROOT = Path("src/hooks")
MAX_LINES = 6

TYPE_PATTERN = re.compile(
    r"(?:(?:export|declare)\s+)*type\s+(\w+)\s*=",
)


def find_type_blocks(content):
    blocks = []

    for match in TYPE_PATTERN.finditer(content):
        start = match.start()
        equals = content.find("=", match.start(), match.end())

        # Localiza o início do conteúdo do type.
        pos = equals + 1
        depth = 0
        in_string = None
        in_comment = False

        while pos < len(content):
            char = content[pos]
            next_char = content[pos + 1] if pos + 1 < len(content) else ""

            if in_string:
                if char == "\\":
                    pos += 2
                    continue
                if char == in_string:
                    in_string = None

            elif char in ("'", '"', "`"):
                in_string = char

            elif char == "/" and next_char == "*":
                in_comment = True
                pos += 2
                continue

            elif in_comment and char == "*" and next_char == "/":
                in_comment = False
                pos += 2
                continue

            elif not in_comment:
                if char in "{[(":
                    depth += 1
                elif char in "}])":
                    depth -= 1
                elif char == ";" and depth == 0:
                    pos += 1
                    break
                elif char == "\n" and depth == 0:
                    break

            pos += 1

        block = content[start:pos].strip()
        lines = len(block.splitlines())

        if lines > MAX_LINES:
            blocks.append({
                "name": match.group(1),
                "content": block,
                "start": start,
                "end": pos,
            })

    return blocks


def update_import_paths(content, old_dir, new_dir):
    relative = Path(
        __import__("os").path.relpath(new_dir, old_dir)
    ).as_posix()

    if not relative.startswith("."):
        relative = "./" + relative

    def replace(match):
        path = match.group(2)

        if not path.startswith("."):
            return match.group(0)

        resolved = (old_dir / path).resolve()

        try:
            target = resolved.relative_to(old_dir.resolve())
        except ValueError:
            target = resolved

        new_path = Path(
            __import__("os").path.relpath(
                resolved,
                new_dir.resolve()
            )
        ).as_posix()

        if not new_path.startswith("."):
            new_path = "./" + new_path

        return match.group(1) + new_path + match.group(3)

    return re.sub(
        r"""(from\s+['"])([^'"]+)(['"])""",
        replace,
        content,
    )


def process_hook(file):
    content = file.read_text(encoding="utf-8")
    blocks = find_type_blocks(content)

    if not blocks:
        return

    hook_name = file.stem
    folder_name = re.sub(r"^use", "", hook_name).lower()

    new_dir = file.parent / folder_name
    new_file = new_dir / file.name
    types_file = new_dir / "types.ts"

    print(f"Processando: {file}")

    new_dir.mkdir(parents=True, exist_ok=True)

    # Remove os types do hook.
    for block in reversed(blocks):
        content = (
            content[:block["start"]]
            + content[block["end"]:]
        )

    # Atualiza imports relativos.
    content = update_import_paths(content, file.parent, new_dir)

    # Cria imports dos types.
    type_names = [block["name"] for block in blocks]

    import_statement = (
        "import type { "
        + ", ".join(type_names)
        + ' } from "./types";\n'
    )

    content = import_statement + content

    # Cria types.ts.
    types_content = "\n\n".join(
        block["content"] for block in blocks
    ) + "\n"

    # Garante que os types possam ser importados.
    types_content = re.sub(
        r"^(?=(?:type|interface)\s)",
        "export ",
        types_content,
        flags=re.MULTILINE,
    )

    types_file.write_text(types_content, encoding="utf-8")
    new_file.write_text(content, encoding="utf-8")

    file.unlink()

    print(f"  ✓ {new_file}")
    print(f"  ✓ {types_file}")


def main():
    files = list(ROOT.rglob("use*.ts")) + list(ROOT.rglob("use*.tsx"))

    for file in files:
        if file.name == "types.ts":
            continue

        process_hook(file)


if __name__ == "__main__":
    main()
