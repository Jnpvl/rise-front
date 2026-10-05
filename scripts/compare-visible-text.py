#!/usr/bin/env python3
"""Compare visible prerendered words between two Angular builds."""
from html.parser import HTMLParser
from pathlib import Path
import re, sys

class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.hidden=0
    def handle_starttag(self, tag, attrs):
        if tag in {'script','style','noscript','template'}: self.hidden += 1
    def handle_endtag(self, tag):
        if tag in {'script','style','noscript','template'}: self.hidden = max(0,self.hidden-1)
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)

def words(path):
    parser=VisibleText(); parser.feed(Path(path).read_text(errors='ignore'))
    return {str(int(token)) if token.isdigit() else token for token in re.findall(r"[\wáéíóúüñÁÉÍÓÚÜÑ]+", ' '.join(parser.parts).lower(), re.UNICODE)}

def route_files(root):
    base=Path(root)
    out={}
    for p in base.rglob('*.html'):
        rel=p.relative_to(base).as_posix()
        if rel in {'index.csr.html','404.html'}: continue
        route='/' if rel=='index.html' else '/' + rel.removesuffix('/index.html').strip('/')
        out[route]=p
    return out

if len(sys.argv)!=3:
    print('usage: compare-visible-text.py BEFORE_BROWSER AFTER_BROWSER'); sys.exit(2)
before=route_files(sys.argv[1]); after=route_files(sys.argv[2])
print('Visible word-set comparison')
print('Routes checked:', len(set(before) & set(after)))
failed=False
for route in sorted(before):
    if route not in after:
        print(f'{route}: missing after build'); failed=True; continue
    old,new=words(before[route]),words(after[route])
    removed=sorted(old-new); added=sorted(new-old)
    print(f'{route}: removed={len(removed)} added={len(added)}')
    if removed:
        failed=True; print('  REMOVED:', ', '.join(removed))
    if added: print('  ADDED:', ', '.join(added))
for route in sorted(set(after)-set(before)): print(f'{route}: added route')
print('RESULT:', 'FAIL (visible words removed)' if failed else 'PASS (no visible words removed)')
sys.exit(1 if failed else 0)
