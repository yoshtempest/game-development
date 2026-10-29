from pathlib import Path
import os
import sys
import uuid

ROOT = Path("public")

REPLACEMENTS = [
    ("marcelo", "marshadow"),
    ("Marcelo", "Marshadow"),
    ("camilly", "camyKaze"),
    ("Camilly", "CamyKaze"),
    ("artur", "srGuaxinim"),
    ("Artur", "SrGuaxinim"),
    ("eduarda", "drika"),
    ("Eduarda", "Drika"),
    ("riquelme", "natsuki"),
    ("Riquelme", "Natsuki"),
    ("emanuel", "ematron"),
    ("Emanuel", "Ematron"),
    ("lucas", "yvel"),
    ("Lucas", "Yvel"),
    ("lucaua", "babidi"),
    ("Lucaua", "Babidi"),
    ("larissa", "laricell"),
    ("Larissa", "Laricell"),
    ("samuel", "samurion"),
    ("Samuel", "Samurion"),
    ("mayra", "yra"),
    ("Mayra", "Yra"),
]

# Substituir primeiro os termos mais longos.
REPLACEMENTS.sort(key=lambda pair: len(pair[0]), reverse=True)


def replace_text(value):
    for old, new in REPLACEMENTS:
        value = value.replace(old, new)
    return value


def replace_name(name):
    return replace_text(name)


def relative_target(path):
    relative = path.relative_to(ROOT)
    parts = [replace_name(part) for part in relative.parts]
    return ROOT.joinpath(*parts)


def main():
    apply = "--apply" in sys.argv

    if not ROOT.is_dir():
        sys.exit("ERRO: a pasta src/ não foi encontrada.")

    paths = [ROOT]
    paths.extend(ROOT.rglob("*"))

    changed_paths = {
        path: relative_target(path)
        for path in paths
        if path != ROOT and relative_target(path) != path
    }

    # Detectar colisões entre caminhos finais.
    targets = {}
    for path in paths:
        target = relative_target(path)
        if target in targets and targets[target] != path:
            sys.exit(
                f"CONFLITO: {targets[target]} e {path} "
                f"terminariam com o mesmo caminho: {target}"
            )
        targets[target] = path

    # Impedir que um destino existente e não renomeado seja sobrescrito.
    sources = set(changed_paths)
    for source, target in changed_paths.items():
        if target.exists() and target not in sources:
            sys.exit(
                f"CONFLITO: o destino já existe: {target}\n"
                "Nenhuma alteração foi aplicada."
            )

    content_changes = []
    for path in paths:
        if not path.is_file():
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue

        updated = replace_text(original)
        if updated != original:
            content_changes.append((path, original, updated))

    print("=== PRÉ-VISUALIZAÇÃO ===")
    print(f"Renomeações de caminhos: {len(changed_paths)}")
    for source, target in sorted(changed_paths.items()):
        print(f"  {source} -> {target}")

    print(f"\nArquivos com conteúdo alterado: {len(content_changes)}")
    for path, _, _ in content_changes:
        print(f"  {path}")

    if not apply:
        print("\nSIMULAÇÃO: nenhum arquivo foi modificado.")
        print("Revise a lista e execute com --apply para aplicar.")
        return

    # Aplicar substituições no conteúdo dos arquivos de texto.
    for path, _, updated in content_changes:
        path.write_text(updated, encoding="utf-8")

    # Renomear irmãos em duas etapas para evitar colisões temporárias.
    for directory, dirs, files in os.walk(ROOT, topdown=False):
        parent = Path(directory)
        children = [parent / name for name in dirs + files]
        moves = []

        for source in children:
            target = source.with_name(replace_name(source.name))
            if target != source:
                moves.append((source, target))

        staged = []
        for source, target in moves:
            temporary = source.with_name(
                f".rename-tmp-{uuid.uuid4().hex}"
            )
            source.rename(temporary)
            staged.append((temporary, target))

        for temporary, target in staged:
            if target.exists():
                sys.exit(
                    f"ERRO inesperado: destino ocupado: {target}. "
                    f"Arquivo temporário: {temporary}"
                )
            temporary.rename(target)

    print("\nRenomeações e substituições aplicadas.")
    print("Agora execute os testes e revise o git diff.")


if __name__ == "__main__":
    main()