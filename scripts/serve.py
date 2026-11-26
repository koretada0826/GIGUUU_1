#!/usr/bin/env python3
"""ローカル確認用の簡易サーバー（Range リクエスト対応）。

`python3 -m http.server` は Range リクエストに応えないため、Safari / iOS ではヒーローの
<video>（MP4）が再生されず、どのブラウザでもシークができない。このサーバーは
`Range: bytes=a-b` に 206 Partial Content で応える。それ以外は標準の http.server と同じ。

使い方（プロジェクト直下で）:
    python3 scripts/serve.py            # http://localhost:8000/
    python3 scripts/serve.py 8080       # ポート指定
"""

from __future__ import annotations

import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RANGE = re.compile(r"bytes=(\d*)-(\d*)")


class RangeHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.range = None
        header = self.headers.get("Range")
        match = RANGE.match(header) if header else None
        if not match or self.command != "GET":
            return super().send_head()
        path = self.translate_path(self.path)
        if os.path.isdir(path) or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        start, end = match.groups()
        if start == "" and end == "":
            return super().send_head()
        if start == "":  # 末尾からの n バイト（MP4 の moov を末尾から読むブラウザ向け）
            start, end = max(0, size - int(end)), size - 1
        else:
            start = int(start)
            end = min(int(end), size - 1) if end else size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return None
        self.range = (start, end)
        file = open(path, "rb")
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        return file

    def copyfile(self, source, outputfile):
        if not self.range:
            return super().copyfile(source, outputfile)
        start, end = self.range
        source.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)

    def end_headers(self):
        if self.command == "GET" and not self.range:
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def log_message(self, format, *args):  # 1 行に短く
        sys.stderr.write("%s %s\n" % (self.address_string(), format % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = partial(RangeHandler, directory=root)
    print(f"serving {root} at http://localhost:{port}/ (Range 対応)")
    ThreadingHTTPServer(("", port), handler).serve_forever()
