from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
root = Path(__file__).resolve().parents[1] / 'out'

class Page(HTMLParser):

    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        for k in ['href', 'src']:
            if k in a:
                self.links.append(a[k])
pages = {}
for f in root.rglob('*.html'):
    p = Page()
    p.feed(f.read_text())
    pages[f] = p
errors = []
for f, p in pages.items():
    for link in p.links:
        u = urlsplit(link)
        if u.scheme or u.netloc or (not link):
            continue
        target = root / unquote(u.path.lstrip('/')) if u.path.startswith('/') else f.parent / unquote(u.path)
        if not u.path:
            target = f
        if target.is_dir():
            target = target / 'index.html'
        if not target.exists():
            errors.append(f'{f.relative_to(root)}: missing {link}')
        elif u.fragment and target in pages and (unquote(u.fragment) not in pages[target].ids):
            errors.append(f'{f.relative_to(root)}: missing fragment {link}')
assert not errors, '\n'.join(errors)
assert len(list((root / 'projects').glob('*/index.html'))) == 8
assert all((root / name / 'index.html').exists() for name in ('work', 'about', 'contact'))
assert (root / 'RRResume.pdf').stat().st_size > 1000
print(f'Export checks passed: {len(pages)} HTML pages, 8 projects, all local links/assets/fragments, resume PDF.')
