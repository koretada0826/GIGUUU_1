#!/usr/bin/env python3
"""Rebuild the local hero candidate catalog without copying or changing images."""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.avif'}
GROUPS = [
    ('recruit-concepts', '採用・10コンセプト', 'assets/recruit/callcenter-concepts-10', 'recruit'),
    ('recruit-additional', '採用・追加10案', 'assets/recruit/callcenter-site-referenced-10', 'recruit'),
    ('recruit', '採用・初期案', 'assets/recruit', 'recruit'),
    ('hero', 'トップ・人物とイラスト', 'assets/hero', 'home'),
    ('3d', 'トップ・立体ビジュアル', 'assets/telemo-blender', 'home'),
    ('ui-a', 'トップ・デザイン10案 A', 'output/ui-concepts-10', 'home'),
    ('ui-b', 'トップ・デザイン10案 B', 'output/ui-concepts-10b', 'home'),
]
NAMES = {
    'recruit-callcenter-illustrated-v2': 'コールセンター・最新イラスト',
    'recruit-callcenter-illustrated-v1': 'コールセンター・イラスト初期案',
    'recruit-team-illustrated-v1': '仲間と働く・ブルーイラスト',
    'recruit-message-v2-blended': '採用メッセージ・背景になじむ配色',
    'recruit-message-v1': '採用メッセージ・人物写真',
    'recruit-visual-v1': '採用・人物ビジュアル',
    'recruit-origin-v1': '採用・原点メッセージ',
    'telemo-kinetic-hero-teal': 'TELEMO・立体タイポグラフィ／ティール',
    'telemo-kinetic-hero': 'TELEMO・立体タイポグラフィ／ブルー',
    'telemo-hero-office-robot': 'オフィスとAIロボット',
    'callcenter-dark-v1': 'コールセンター・ダーク',
}


def dimensions(path):
    with path.open('rb') as f:
        head = f.read(24)
    if head[:8] == b'\x89PNG\r\n\x1a\n':
        return struct.unpack('>II', head[16:24])
    result = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(path)], capture_output=True, text=True, check=True)
    return tuple(int(re.search(key + r':\s+(\d+)', result.stdout).group(1)) for key in ['pixelWidth', 'pixelHeight'])


def build():
    candidates = []
    for group, label, folder, target in GROUPS:
        directory = ROOT / folder
        paths = directory.rglob('*') if group == 'hero' else directory.glob('*')
        for path in sorted(paths):
            if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
                continue
            if any(part in {'references', 'source'} for part in path.relative_to(directory).parts):
                continue
            if any(word in path.stem for word in ['reference', 'placeholder', 'grain', 'focus-reference']):
                continue
            candidates.append((path, group, label, target))
    extras = list((ROOT / 'assets').glob('*hero*')) + list(ROOT.glob('*'))
    extras.append(ROOT / 'output/ui-fusion-1-8-9.png')
    for path in sorted(set(extras)):
        if path.is_file() and path.suffix.lower() in EXTENSIONS:
            candidates.append((path, 'hero', 'トップ・人物とイラスト', 'home'))

    # PNG/JPEG exports and render resolutions are files of the same proposal.
    variants = {}
    for path, group, label, target in candidates:
        stem = re.sub(r'-(1440|2880)$', '', path.stem)
        key = (path.parent, stem)
        variants.setdefault(key, []).append((path, group, label, target))
    titles = {}
    for folder in ['assets/recruit/callcenter-concepts-10', 'assets/recruit/callcenter-site-referenced-10']:
        data = json.loads((ROOT / folder / 'concepts.json').read_text())
        for c in data['concepts']:
            title = c.get('title') or ''.join(c['headline'])
            titles[Path(c['file']).stem] = title

    items = []
    seen = {}
    for (_, stem), entries in variants.items():
        entries.sort(key=lambda e: ({'.png': 0, '.webp': 1, '.avif': 2, '.jpg': 3, '.jpeg': 4}[e[0].suffix.lower()], -e[0].stat().st_size))
        path, group, label, target = entries[0]
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        files = [p.relative_to(ROOT).as_posix() for p, *_ in entries]
        if digest in seen:
            seen[digest]['files'].extend(files)
            continue
        w, h = dimensions(path)
        title = titles.get(stem, NAMES.get(stem, stem.replace('-', ' ')))
        if '.rejected-attempt-1' in stem:
            base = stem.replace('.rejected-attempt-1', '')
            title = titles.get(base, base) + '・別バージョン'
        item = dict(id='hero-' + hashlib.sha1(files[0].encode()).hexdigest()[:12], title=title, group=group, groupLabel=label, target=target, src=files[0], files=files, width=w, height=h)
        items.append(item)
        seen[digest] = item
    data = {'version': 1, 'count': len(items), 'items': items}
    encoded = json.dumps(data, ensure_ascii=False, indent=2)
    (ROOT / 'hero-options.json').write_text(encoded + '\n')
    (ROOT / 'hero-options-data.js').write_text('window.TELEMO_HERO_CATALOG = ' + encoded + ';\n')
    print(f'{len(items)} proposals / {sum(len(i["files"]) for i in items)} image files registered')


if __name__ == '__main__':
    build()
