"""Generate docs/DOCUMENTATION.html — a single, polished, navigable HTML
delivery document combining README, SRS, ARCHITECTURE, TEST_CASES, and
DELIVERABLES. No emojis (replaced by Lucide SVG icons), uses the project's
soft-pop theme, prints cleanly."""
import os
import re
import sys

import markdown

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(ROOT)
OUT = os.path.join(ROOT, 'DOCUMENTATION.html')

# --- Lucide icon SVG paths (the bits inside <svg> from lucide.dev) ---
ICON_BASE_ATTRS = (
    'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" '
    'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" '
    'stroke-linejoin="round"'
)


def lucide(name, size=22):
    paths = LUCIDE_PATHS.get(name)
    if not paths:
        return ''
    return (
        f'<svg class="ic" xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
        f'stroke-linecap="round" stroke-linejoin="round">{paths}</svg>'
    )


LUCIDE_PATHS = {
    'ticket':        '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    'book-open':     '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'file-text':     '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'layers':        '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    'cog':           '<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m7 20.66 1-1.73"/>',
    'flask':         '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
    'git-branch':    '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'presentation':  '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    'users':         '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'globe':         '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'server':        '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    'database':      '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    'code':          '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    'check':         '<path d="M20 6 9 17l-5-5"/>',
    'check-circle':  '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'alert-circle':  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    'info':          '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'calendar':      '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'clock':         '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'github':        '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    'container':     '<path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9c-.1-.1-.4-.2-.6-.2-.2 0-.4.1-.6.2L7.5 6.2c-.5.3-.8.9-.8 1.5v6.3c0 .6.4 1.2.8 1.5l6.3 3.9c.1.1.4.2.6.2.2 0 .5-.1.6-.2l6.3-3.9c.5-.3.8-.9.8-1.5z"/><path d="M10 21.94 6 19.5"/><path d="M2.94 13H5"/><path d="M2.94 9H5"/><path d="M2.94 5H5"/>',
    'list-checks':   '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'package':       '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>',
    'rocket':        '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22 22 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'shield':        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'arrow-right':   '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'home':          '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
}


# Map common emoji codepoints (and a few text-form labels) to a lucide-name OR a stripped variant.
EMOJI_TO_ICON = {
    '🎫': 'ticket',
    '📋': 'list-checks',
    '🎯': 'check',
    '🏗': 'layers',
    '🏗️': 'layers',
    '🧩': 'package',
    '🛠': 'cog',
    '🛠️': 'cog',
    '🚀': 'rocket',
    '📂': 'file-text',
    '🌐': 'globe',
    '🚢': 'container',
    '📅': 'calendar',
    '👥': 'users',
    '📖': 'book-open',
    '✅': 'check',
    '✓': 'check',
    '⏳': 'clock',
    '⚠️': 'alert-circle',
    '⬜': '',  # blank checkbox
    '🔄': '',
    '🐛': 'alert-circle',
    '📊': 'layers',
    '🤝': 'users',
    '🔒': 'shield',
    '🎨': 'cog',
    '🟢': '',
    '🔴': '',
    '🎤': 'presentation',
}


# Strip ALL remaining emojis after our replacements (broad unicode emoji ranges)
EMOJI_RE = re.compile(
    "["
    "\U0001F1E0-\U0001F1FF"
    "\U0001F300-\U0001F5FF"
    "\U0001F600-\U0001F64F"
    "\U0001F680-\U0001F6FF"
    "\U0001F700-\U0001F77F"
    "\U0001F780-\U0001F7FF"
    "\U0001F800-\U0001F8FF"
    "\U0001F900-\U0001F9FF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "☀-⛿"
    "✀-➿"
    "⌀-⏿"
    "]+",
    flags=re.UNICODE,
)


def replace_emoji_in_heading(line: str) -> str:
    """In a markdown heading (# ...), replace the leading emoji with a placeholder
    that the html renderer will turn into a Lucide SVG."""
    m = re.match(r'^(#{1,6})\s+(.*)$', line)
    if not m:
        return line
    hashes, content = m.groups()
    # Replace any known emoji with [[ICON:name]] so md→html keeps it; we'll post-process.
    for emo, name in EMOJI_TO_ICON.items():
        if emo in content:
            content = content.replace(emo, f'[[ICON:{name}]]' if name else '')
    # Strip any leftover emojis
    content = EMOJI_RE.sub('', content).strip()
    return f'{hashes} {content}'


def preprocess(md: str) -> str:
    out_lines = []
    for line in md.splitlines():
        if line.lstrip().startswith('#'):
            line = replace_emoji_in_heading(line)
        else:
            # Replace inline emojis with icon tokens or blanks
            for emo, name in EMOJI_TO_ICON.items():
                if emo in line:
                    line = line.replace(emo, f'[[ICON:{name}]]' if name else '')
            line = EMOJI_RE.sub('', line)
        out_lines.append(line)
    return '\n'.join(out_lines)


def md_to_html(md: str) -> str:
    md = preprocess(md)
    html = markdown.markdown(
        md,
        extensions=['extra', 'sane_lists', 'tables', 'fenced_code', 'codehilite', 'toc'],
        extension_configs={'codehilite': {'noclasses': False, 'css_class': 'highlight'}},
    )
    # Replace [[ICON:name]] tokens with inline SVG
    def icon_repl(m):
        return lucide(m.group(1), size=20)
    html = re.sub(r'\[\[ICON:([a-z\-]+)\]\]', icon_repl, html)
    return html


def strip_first_h1(html: str) -> str:
    """Remove the first <h1>...</h1> so the part-title at the top stays the largest."""
    return re.sub(r'<h1[^>]*>.*?</h1>', '', html, count=1, flags=re.DOTALL)


SECTIONS = [
    ('overview',       'Project Overview',                       'home',          'README.md'),
    ('srs',            'Software Requirements Specification',    'file-text',     'docs/SRS.md'),
    ('architecture',   'Architecture and Design Patterns',       'layers',        'docs/ARCHITECTURE.md'),
    ('testing',        'Test Cases and Quality Assurance',       'flask',         'docs/TEST_CASES.md'),
    ('delivery',       'Delivery Index',                         'package',       'docs/DELIVERABLES.md'),
]


def load(rel: str) -> str:
    with open(os.path.join(PROJ, rel), 'r', encoding='utf-8') as f:
        return f.read()


def render_section(section_id: str, title: str, icon_name: str, md_path: str, idx: int) -> str:
    body_html = strip_first_h1(md_to_html(load(md_path)))
    badge = f'Part {idx + 1}'
    return f'''
<section id="{section_id}" class="part">
  <div class="part-head">
    <div class="part-tag">{badge}</div>
    <div class="part-title">
      {lucide(icon_name, size=34)}
      <h1>{title}</h1>
    </div>
  </div>
  <div class="part-body">
    {body_html}
  </div>
</section>
'''


COVER_HTML = '''
<header class="cover">
  <div class="cover-tag">SE PROJECT &middot; FINAL DELIVERY &middot; 2026</div>
  <h1 class="cover-title">
    <span>Smart</span>
    <em>E-Ticketing</em>
    <span>System</span>
  </h1>
  <p class="cover-sub">
    Software Engineering &mdash; Course Project. Demonstrating Agile/Scrum, Clean Code, SOLID,
    GoF Design Patterns, automated testing, CI/CD, Docker, and live deployment.
  </p>
  <div class="cover-grid">
    <div class="cover-card">
      <div class="cover-card-tag">''' + lucide('users', 14) + '''Team</div>
      <div class="cover-card-body">
        <strong>Mahmoud</strong> &mdash; Product Owner &amp; Scrum Master<br>
        <strong>Mohammed</strong> &mdash; Software Engineer<br>
        <strong>Esraa</strong> &mdash; Software Engineer<br>
        <strong>Ali</strong> &mdash; Backend Developer<br>
        <strong>Amr</strong> &mdash; Frontend Developer<br>
        <strong>Seif</strong> &mdash; QA / Test Engineer
      </div>
    </div>
    <div class="cover-card">
      <div class="cover-card-tag">''' + lucide('shield', 14) + '''Supervisor</div>
      <div class="cover-card-body">
        <strong>Dr. Ihab Ramadan</strong><br>
        Software Engineering &middot; 2026
      </div>
    </div>
    <div class="cover-card">
      <div class="cover-card-tag">''' + lucide('globe', 14) + '''Live System</div>
      <div class="cover-card-body">
        <a href="https://smart-e-ticket.vercel.app">smart-e-ticket.vercel.app</a> &mdash; frontend<br>
        <a href="https://smart-eticketing-backend-production-0222.up.railway.app/api-docs">/api-docs</a> &mdash; Swagger<br>
        <a href="https://github.com/MahmoudSayed0/Smart-E-ticket-PR">github.com/MahmoudSayed0/Smart-E-ticket-PR</a>
      </div>
    </div>
  </div>
</header>
'''


def build():
    sections_html = ''.join(render_section(s, t, i, p, idx) for idx, (s, t, i, p) in enumerate(SECTIONS))

    nav_links = '\n'.join(
        f'<a class="nav-link" href="#{s}">{lucide(i, 16)}<span>{t}</span></a>'
        for (s, t, i, _) in SECTIONS
    )

    html = HTML_TEMPLATE.replace('{{NAV}}', nav_links).replace(
        '{{COVER}}', COVER_HTML).replace('{{SECTIONS}}', sections_html)

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'wrote {OUT} ({len(html):,} chars)')


HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Smart E-Ticketing System — Documentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0a0a0a;
    --ink-2: #2a2a2a;
    --ink-3: #5a5a5a;
    --paper: #F8F5EB;
    --paper-2: #efe9d8;
    --card: #FFFFFF;
    --primary: #5A3BDE;
    --primary-soft: #ece6ff;
    --secondary: #2DBAAC;
    --secondary-soft: #d6f1ed;
    --accent: #F2A640;
    --accent-soft: #fbe7c8;
    --line: rgba(0, 0, 0, 0.18);
    --line-strong: #0a0a0a;
    --shadow-sm: 4px 4px 0 0 #0a0a0a;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--paper);
    color: var(--ink);
    font-family: "DM Sans", system-ui, sans-serif;
    line-height: 1.6;
    font-size: 15px;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    max-width: 1400px;
    margin: 0 auto;
    gap: 0;
  }

  /* Sidebar */
  aside.sidebar {
    position: sticky;
    top: 0;
    align-self: start;
    height: 100vh;
    overflow-y: auto;
    padding: 30px 24px;
    border-right: 2px solid var(--line-strong);
    background: var(--paper);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    padding: 10px 12px;
    background: var(--primary);
    color: white;
    border: 2px solid var(--line-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
  }
  .brand .ic { color: var(--accent); }
  .brand-text { line-height: 1.1; }
  .brand-text .top {
    font-size: 11px;
    letter-spacing: 0.16em;
    font-family: "Space Mono", monospace;
    color: var(--accent);
    text-transform: uppercase;
  }
  .brand-text .name {
    font-size: 16px;
    font-weight: 700;
    margin-top: 2px;
  }

  .nav-title {
    font-family: "Space Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--ink-3);
    text-transform: uppercase;
    margin: 0 0 12px 8px;
    font-weight: 600;
  }
  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 4px;
    border: 2px solid transparent;
  }
  .nav-link:hover, .nav-link:focus { background: var(--card); border-color: var(--line); text-decoration: none; }
  .nav-link.active { background: var(--primary-soft); border-color: var(--primary); color: var(--primary); font-weight: 700; }
  .nav-link .ic { color: var(--primary); flex-shrink: 0; }

  .nav-foot {
    margin-top: 28px;
    padding-top: 18px;
    border-top: 1.5px dashed var(--line);
    font-family: "Space Mono", monospace;
    font-size: 11px;
    color: var(--ink-3);
    line-height: 1.5;
  }

  /* Main */
  main { padding: 40px 56px 80px; max-width: 940px; }

  /* Cover */
  .cover {
    border: 2px solid var(--line-strong);
    border-radius: 18px;
    padding: 44px 40px;
    background: var(--card);
    box-shadow: var(--shadow-sm);
    margin-bottom: 48px;
  }
  .cover-tag {
    display: inline-block;
    font-family: "Space Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    background: var(--primary);
    color: white;
    padding: 5px 14px;
    border-radius: 999px;
    border: 2px solid var(--line-strong);
    font-weight: 700;
  }
  .cover-title {
    font-size: 64px;
    line-height: 0.98;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 18px 0 0;
  }
  .cover-title em {
    font-family: "Fraunces", serif;
    font-style: italic;
    font-weight: 400;
    color: var(--primary);
  }
  .cover-sub {
    font-size: 16px;
    color: var(--ink-2);
    margin: 18px 0 32px;
    max-width: 720px;
  }
  .cover-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-top: 28px;
  }
  .cover-card {
    background: var(--paper-2);
    border: 2px solid var(--line-strong);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .cover-card-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: "Space Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    color: var(--primary);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .cover-card-body { font-size: 13px; line-height: 1.55; }
  .cover-card-body strong { color: var(--ink); }
  .cover-card-body a { word-break: break-all; }

  /* Sections / parts */
  section.part { margin-bottom: 56px; scroll-margin-top: 16px; }
  section.part + section.part { padding-top: 56px; border-top: 1.5px dashed var(--line); }

  .part-head {
    margin-bottom: 22px;
  }
  .part-tag {
    display: inline-block;
    font-family: "Space Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--primary);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .part-title {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .part-title h1 {
    margin: 0;
    font-size: 36px;
    line-height: 1.05;
    letter-spacing: -0.018em;
    font-weight: 700;
  }
  .part-title .ic { color: var(--primary); flex-shrink: 0; }

  /* Body content (rendered from markdown) */
  .part-body { color: var(--ink); }
  .part-body h1, .part-body h2 {
    color: var(--primary);
    margin: 36px 0 12px;
    line-height: 1.2;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .part-body h1 { font-size: 26px; border-bottom: 1.5px solid var(--line); padding-bottom: 8px; }
  .part-body h2 { font-size: 22px; }
  .part-body h3 { color: var(--secondary); font-size: 17px; margin: 24px 0 8px; font-weight: 700; display:flex; align-items:center; gap:8px; }
  .part-body h4 { font-size: 15px; margin: 18px 0 6px; font-weight: 700; }
  .part-body p { margin: 8px 0 12px; font-size: 14.5px; }
  .part-body ul, .part-body ol { padding-left: 24px; margin: 8px 0 14px; }
  .part-body li { margin: 4px 0; font-size: 14.5px; }
  .part-body strong { color: var(--ink); }
  .part-body em { color: var(--ink-2); }

  .part-body code {
    font-family: "Space Mono", monospace;
    background: var(--primary-soft);
    color: var(--primary);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .part-body pre {
    background: #0d0d18;
    color: #f3f0ff;
    padding: 16px 18px;
    border-radius: 10px;
    border: 2px solid var(--line-strong);
    box-shadow: var(--shadow-sm);
    overflow-x: auto;
    font-size: 12.5px;
    line-height: 1.55;
    margin: 14px 0;
  }
  .part-body pre code { background: transparent; color: inherit; padding: 0; font-size: inherit; }

  .part-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 13.5px;
    border: 2px solid var(--line-strong);
    border-radius: 10px;
    overflow: hidden;
  }
  .part-body th {
    background: var(--primary);
    color: white;
    padding: 9px 12px;
    text-align: left;
    font-weight: 700;
    font-family: "Space Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .part-body td {
    padding: 8px 12px;
    border-top: 1px solid var(--line);
    vertical-align: top;
  }
  .part-body tr:nth-child(even) td { background: var(--paper-2); }

  .part-body blockquote {
    border-left: 4px solid var(--accent);
    background: var(--accent-soft);
    padding: 10px 18px;
    margin: 14px 0;
    border-radius: 0 8px 8px 0;
    color: var(--ink-2);
    font-size: 14px;
  }

  .part-body hr {
    border: none;
    border-top: 1.5px dashed var(--line);
    margin: 28px 0;
  }

  /* Print */
  @media print {
    .layout { grid-template-columns: 1fr; }
    aside.sidebar { display: none; }
    main { padding: 18px; max-width: none; }
    section.part { break-after: page; }
    section.part + section.part { border-top: none; padding-top: 0; }
    .cover { break-after: page; }
    .part-body pre, .part-body table { break-inside: avoid; }
  }

  /* Mobile */
  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    aside.sidebar { position: static; height: auto; border-right: none; border-bottom: 2px solid var(--line-strong); }
    main { padding: 24px 18px; }
    .cover-title { font-size: 44px; }
  }
</style>
</head>
<body>

<div class="layout">

  <aside class="sidebar">
    <div class="brand">
      <svg class="ic" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
      <div class="brand-text">
        <div class="top">SE Project · 2026</div>
        <div class="name">Smart E-Ticketing</div>
      </div>
    </div>
    <div class="nav-title">Documentation</div>
    {{NAV}}
    <div class="nav-foot">
      Supervised by<br>
      <strong style="color:var(--ink); font-family:'DM Sans',sans-serif; font-weight:700;">Dr. Ihab Ramadan</strong>
    </div>
  </aside>

  <main>
    {{COVER}}
    {{SECTIONS}}
  </main>

</div>

<script>
  // active-section highlight as the user scrolls
  const links = document.querySelectorAll('.nav-link');
  const sections = [...links].map(a => document.getElementById(a.getAttribute('href').slice(1)));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => s && obs.observe(s));
</script>

</body>
</html>
'''


if __name__ == '__main__':
    build()
