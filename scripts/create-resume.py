from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from pathlib import Path
import os
root = Path(__file__).resolve().parents[1]

def resume_font(env_var, name):
    """Use locally installed fonts; font binaries are not redistributed in this project."""
    value = os.environ.get(env_var)
    candidates = [Path(value)] if value else []
    candidates.extend([
        Path('/usr/share/fonts/truetype/dejavu') / name,
        Path('/usr/local/share/fonts') / name,
    ])
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    raise FileNotFoundError(f'Set {env_var} to the path of a locally installed {name} font file')
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('ResumeSans', resume_font('RESUME_FONT_REGULAR', 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('ResumeSans-Bold', resume_font('RESUME_FONT_BOLD', 'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('ResumeSans', normal='ResumeSans', bold='ResumeSans-Bold', italic='ResumeSans', boldItalic='ResumeSans-Bold')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='NameR', fontName='ResumeSans-Bold', fontSize=25, leading=29, textColor=HexColor('#17281d'), spaceAfter=7))
styles.add(ParagraphStyle(name='SubR', fontName='ResumeSans', fontSize=10, leading=14, textColor=HexColor('#3f553d'), spaceAfter=6))
styles.add(ParagraphStyle(name='BodyR', fontName='ResumeSans', fontSize=8.5, leading=12, textColor=HexColor('#354132'), spaceAfter=6))
styles.add(ParagraphStyle(name='HeadR', fontName='ResumeSans-Bold', fontSize=9, leading=12, textColor=HexColor('#486732'), spaceBefore=13, spaceAfter=7))
styles.add(ParagraphStyle(name='RoleR', fontName='ResumeSans-Bold', fontSize=8.5, leading=12, textColor=HexColor('#17281d'), spaceAfter=3))
story = []

def p(text, style='BodyR'):
    story.append(Paragraph(text, styles[style]))
p('Ryan Russell', 'NameR')
p('SYSTEMS ADMINISTRATOR | SOFTWARE DEVELOPER', 'SubR')
p('Salt Lake City, Utah | <link href="mailto:rjrussell605@gmail.com">rjrussell605@gmail.com</link>', 'BodyR')
p('<link href="https://www.linkedin.com/in/ryan-russell-6abb0913b/">LinkedIn: ryan-russell-6abb0913b</link> | <link href="https://github.com/RJ060501">GitHub: RJ060501</link>', 'BodyR')
story.append(HRFlowable(width='100%', thickness=1, color=HexColor('#b6c4ad'), spaceBefore=5, spaceAfter=8))
p('Systems administrator with a software development foundation and hands-on experience in infrastructure support, Microsoft 365, security monitoring, and automation. Focused on systems, cloud operations, and platform engineering.')
p('RELEVANT EXPERIENCE', 'HeadR')
p('Resolut | Systems Administrator | 2026 - Present', 'RoleR')
p('Support infrastructure and Microsoft 365 / Entra environments; build Python and PowerShell automation; contribute to security monitoring and Freshservice incident, service-request, and provisioning workflows.')
p('Salt Lake Community College | IT Lab Aid V | December 2022 - December 2024', 'RoleR')
p('Supported students and instructors with software and hardware troubleshooting. Reviewed student applications and provided technical support and tutoring across Windows, Linux, and macOS.')
p('WeAre8 | Front-End Developer, Contract | February 2020 - April 2020', 'RoleR')
p('Built React interfaces, implemented Redux state management, and translated design files into responsive UI. Worked with GitHub, Jira, JavaScript, HTML, CSS, and SCSS.')
p("Musician's Friend | Sales Specialist / Team Lead | May 2022 - February 2026", 'RoleR')
p('Provided customer support and relationship management, mentored colleagues, and contributed to process improvements in a fast-paced sales environment.')
p('SELECTED TECHNICAL WORK', 'HeadR')
p('<b>Security monitoring:</b> Building a Python application using Microsoft Graph APIs, detection rules, SQLite event state, and alerts. Exploring local AI-assisted correlation and summaries as a next phase.')
p('<b>Application development:</b> Built an accounting chatbot with React, Node.js, AWS Lex V2, and Amazon Bedrock; a Node.js article discovery API; a React video explorer; a Tech Trends API; and a Python Snake game.')
p('<b>Technical investigation:</b> Traced a Revit / SQL Server LocalDB startup failure through application logs and Windows storage sector reporting, producing a specific diagnosis and remediation handoff.')
p('EDUCATION & CREDENTIALS', 'HeadR')
p("<b>Western Governors University</b> | Bachelor's studies in cloud and network engineering<br/>Expected October 2026")
p('<b>Salt Lake Community College</b> | Associate degree in Computer Science<br/>Software Development emphasis | 2024')
p('AWS Certified Cloud Practitioner | CompTIA A+ | CompTIA Network+<br/>AWS Solutions Architect study in progress')
p('TECHNICAL SKILLS', 'HeadR')
p('Python, PowerShell, JavaScript, React, Redux, Node.js, SQL, REST APIs, Git, Docker, Linux, Windows Server, Microsoft 365, Entra, Freshservice, AWS')

def footer(c, doc):
    c.setFont('ResumeSans', 7)
    c.setFillColor(HexColor('#6c7b63'))
    c.drawString(42, 25, 'Ryan Russell | Systems, Cloud & Code')
    c.drawRightString(570, 25, str(doc.page))
SimpleDocTemplate(str(root / 'public/Ryan_Russell_Resume.pdf'), pagesize=(612, 792), rightMargin=42, leftMargin=42, topMargin=35, bottomMargin=38, title='Ryan Russell - Resume', author='Ryan Russell').build(story, onFirstPage=footer, onLaterPages=footer)
