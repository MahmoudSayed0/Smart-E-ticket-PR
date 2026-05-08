"""Combine all project docs into one Markdown file with PDF-ready frontmatter,
then run md-to-pdf to produce docs/DOCUMENTATION.pdf."""
import subprocess, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(ROOT)
OUT_MD = os.path.join(ROOT, '_documentation_build.md')
OUT_PDF = os.path.join(ROOT, 'DOCUMENTATION.pdf')

FRONTMATTER = '''---
pdf_options:
  format: A4
  margin: 22mm 18mm
  printBackground: true
  headerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#888;font-family:DM Sans,sans-serif;padding:6px 20px;">Smart E-Ticketing System &middot; Software Engineering Project &middot; 2026</div>'
  footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#888;font-family:DM Sans,sans-serif;padding:6px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  displayHeaderFooter: true
stylesheet:
  - https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap
---
<style>
  body { font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.55; color: #1a1a1a; font-size: 12px; }
  h1 { color: #5A3BDE; font-size: 28px; font-weight: 700; margin: 36px 0 12px; border-bottom: 2px solid #5A3BDE; padding-bottom: 6px; }
  h2 { color: #5A3BDE; font-size: 19px; font-weight: 700; margin: 26px 0 10px; }
  h3 { color: #2DBAAC; font-size: 15px; font-weight: 700; margin: 18px 0 8px; }
  h4 { color: #1a1a1a; font-size: 13px; font-weight: 700; margin: 14px 0 6px; }
  p, li { font-size: 12px; }
  a { color: #5A3BDE; text-decoration: none; }
  code { font-family: 'Space Mono', monospace; background: #f3f0ff; padding: 1px 5px; border-radius: 3px; font-size: 11px; }
  pre { background: #0d0d18; color: #f3f0ff; padding: 14px 16px; border-radius: 8px; font-size: 10.5px; line-height: 1.5; overflow-x: auto; }
  pre code { background: transparent; color: inherit; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 11px; }
  th { background: #5A3BDE; color: white; padding: 7px 10px; text-align: left; font-weight: 700; }
  td { padding: 6px 10px; border: 1px solid #d8d8d8; vertical-align: top; }
  tr:nth-child(even) td { background: #faf8f0; }
  blockquote { border-left: 4px solid #F2A640; background: #fff8eb; padding: 10px 16px; margin: 12px 0; color: #4a4a4a; font-size: 11.5px; }
  hr { border: none; border-top: 1.5px dashed #c8c8c8; margin: 24px 0; }
  .cover { page-break-after: always; min-height: 950px; display: flex; flex-direction: column; justify-content: center; }
  .cover .badge { display: inline-block; padding: 6px 18px; background: #5A3BDE; color: white; font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.18em; border-radius: 999px; }
  .cover h1 { font-size: 64px; line-height: 1.0; border: none; margin: 18px 0 0; padding: 0; }
  .cover h1 em { font-family: serif; font-style: italic; font-weight: 500; color: #5A3BDE; }
  .cover .meta { margin-top: 80px; font-size: 13px; color: #4a4a4a; }
  .cover .meta strong { color: #1a1a1a; }
  .toc { page-break-after: always; }
  .toc ol { padding-left: 22px; }
  .toc li { margin: 4px 0; font-size: 13px; }
  .pagebreak { page-break-before: always; }
</style>

<div class="cover">
  <span class="badge">SE PROJECT &middot; 2026 &middot; FINAL DELIVERY</span>
  <h1>Smart <em>E-Ticketing</em><br>System</h1>
  <div class="meta">
    <p><strong>Software Engineering &mdash; Course Project</strong></p>
    <p>Demonstrating Agile/Scrum, Clean Code, SOLID, GoF Design Patterns,<br>
    automated testing, CI/CD, Docker, and live deployment.</p>
    <p style="margin-top:36px;"><strong>Team:</strong> Mahmoud (PO &amp; Scrum Master) &middot; Mohammed (SE) &middot; Esraa (SE) &middot; Ali (Backend Dev) &middot; Amr (Frontend Dev) &middot; Seif (QA)</p>
    <p><strong>Supervisor:</strong> Dr. Ihab Ramadan</p>
    <p style="margin-top:28px;"><strong>Live frontend:</strong> https://smart-e-ticket.vercel.app<br>
    <strong>Live backend:</strong> https://smart-eticketing-backend-production-0222.up.railway.app/api-docs<br>
    <strong>Source:</strong> https://github.com/MahmoudSayed0/Smart-E-ticket-PR</p>
  </div>
</div>

<div class="toc">

# Table of Contents

1. **Project Overview** &mdash; what was built and why
2. **Software Requirements Specification (SRS)** &mdash; functional + non-functional requirements
3. **Architecture &amp; Design Patterns** &mdash; layered architecture, Repository / Factory / Strategy, SOLID
4. **Test Cases** &mdash; 46 unit tests + 15 manual cases
5. **Delivery Index** &mdash; rubric coverage map and bonus deliverables

</div>

'''

SECTIONS = [
    ('# Part 1 &mdash; Project Overview', 'README.md', None),
    ('# Part 2 &mdash; Software Requirements Specification', 'docs/SRS.md', '# '),
    ('# Part 3 &mdash; Architecture &amp; Design Patterns', 'docs/ARCHITECTURE.md', '# '),
    ('# Part 4 &mdash; Test Cases', 'docs/TEST_CASES.md', '# '),
    ('# Part 5 &mdash; Delivery Index', 'docs/DELIVERABLES.md', '# '),
]


def load(rel):
    path = os.path.join(PROJ, rel)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def strip_first_h1(text):
    """Drop the first top-level # heading so we can prepend our own part-title."""
    lines = text.splitlines()
    out = []
    skipped = False
    for line in lines:
        if not skipped and line.startswith('# ') and not line.startswith('## '):
            skipped = True
            continue
        out.append(line)
    return '\n'.join(out)


def downshift(text):
    """Demote h1→h2, h2→h3 so the part-title at the top stays the largest."""
    text = re.sub(r'^# (?!# )', '## ', text, flags=re.MULTILINE)
    return text


def main():
    parts = [FRONTMATTER]
    for idx, (title, path, hint) in enumerate(SECTIONS):
        body = load(path)
        body = strip_first_h1(body)
        body = downshift(body)
        if idx > 0:
            parts.append('\n\n<div class="pagebreak"></div>\n\n')
        parts.append(f"\n\n{title}\n\n{body}\n\n")
    combined = ''.join(parts)
    with open(OUT_MD, 'w', encoding='utf-8') as f:
        f.write(combined)
    print(f"wrote {OUT_MD} ({len(combined):,} chars)")
    subprocess.run(['npx', 'md-to-pdf', OUT_MD, '--launch-options', '{"args":["--no-sandbox"]}'], check=True)
    # md-to-pdf produces _documentation_build.pdf next to the source; rename it
    produced = OUT_MD.replace('.md', '.pdf')
    if os.path.exists(produced):
        os.replace(produced, OUT_PDF)
    os.remove(OUT_MD)
    print(f"PDF written → {OUT_PDF}")


if __name__ == '__main__':
    main()
