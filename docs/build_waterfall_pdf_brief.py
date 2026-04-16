"""Brief bilingual (English + Arabic) research PDF on the Waterfall model.

Short version — focused on the essentials only. Each section has the English
points and an Arabic translation side-by-side so the student can study quickly.
"""

import os

import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ---------- Register an Arabic-capable font ----------
ARABIC_FONT_PATH = "/Library/Fonts/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont("ArabicFont", ARABIC_FONT_PATH))
# Use the same font as a bold fallback so weighted paragraphs don't break
pdfmetrics.registerFont(TTFont("ArabicFontBold", ARABIC_FONT_PATH))


def ar(text: str) -> str:
    """Reshape and apply bidi to make Arabic text display correctly in ReportLab."""
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)


# ---------- Brand colors ----------
BRAND = colors.HexColor("#1F3A68")
ACCENT = colors.HexColor("#C25E00")
SOFT_BG = colors.HexColor("#F3F5F8")
TEXT = colors.HexColor("#1C1C1C")
MUTED = colors.HexColor("#5A5A5A")
RULE = colors.HexColor("#D1D5DB")
GREEN = colors.HexColor("#1E7A4D")
RED = colors.HexColor("#A3211A")


def make_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="Title1",
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        alignment=TA_CENTER,
        textColor=BRAND,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="Title1AR",
        fontName="ArabicFont",
        fontSize=26,
        leading=34,
        alignment=TA_CENTER,
        textColor=BRAND,
        spaceAfter=14,
    ))
    styles.add(ParagraphStyle(
        name="Subtitle",
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        alignment=TA_CENTER,
        textColor=MUTED,
        spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        name="H1EN",
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=BRAND,
        spaceBefore=10,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="H1AR",
        fontName="ArabicFont",
        fontSize=15,
        leading=20,
        alignment=TA_RIGHT,
        textColor=ACCENT,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="BodyEN",
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        alignment=TA_LEFT,
        textColor=TEXT,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name="BodyAR",
        fontName="ArabicFont",
        fontSize=11,
        leading=16,
        alignment=TA_RIGHT,
        textColor=TEXT,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="BulletEN",
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        leftIndent=12,
        textColor=TEXT,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="BulletAR",
        fontName="ArabicFont",
        fontSize=11,
        leading=15,
        rightIndent=12,
        alignment=TA_RIGHT,
        textColor=TEXT,
        spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="QLabel",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=BRAND,
        spaceBefore=8,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="ALabel",
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=TEXT,
        leftIndent=10,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="QLabelAR",
        fontName="ArabicFont",
        fontSize=11,
        leading=15,
        alignment=TA_RIGHT,
        textColor=ACCENT,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name="ALabelAR",
        fontName="ArabicFont",
        fontSize=11,
        leading=15,
        alignment=TA_RIGHT,
        textColor=TEXT,
        rightIndent=10,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="Caption",
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=MUTED,
        spaceAfter=8,
    ))
    return styles


# ---------- Page decoration ----------
def on_page(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(2 * cm, A4[1] - 1.4 * cm, A4[0] - 2 * cm, A4[1] - 1.4 * cm)
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(MUTED)
        canvas.drawString(2 * cm, A4[1] - 1.1 * cm, "Waterfall Model — Quick Study Guide")
        canvas.drawRightString(A4[0] - 2 * cm, A4[1] - 1.1 * cm, f"Page {doc.page}")

        canvas.line(2 * cm, 1.4 * cm, A4[0] - 2 * cm, 1.4 * cm)
        canvas.setFont("Helvetica-Oblique", 8)
        canvas.drawCentredString(A4[0] / 2, 1.0 * cm, "Software Engineering · Research Summary")
    canvas.restoreState()


# ---------- Cascade diagram flowable ----------
class CascadeStep(Flowable):
    def __init__(self, en_text, ar_text, fill_color, left_offset, width=8 * cm, height=0.9 * cm):
        super().__init__()
        self.en_text = en_text
        self.ar_text = ar_text
        self.fill_color = fill_color
        self.left_offset = left_offset
        self.w = width
        self.h = height

    def wrap(self, availWidth, availHeight):
        return (availWidth, self.h)

    def draw(self):
        c = self.canv
        x = self.left_offset
        y = 0
        c.setFillColor(self.fill_color)
        c.setStrokeColor(colors.HexColor("#0D1F3A"))
        c.setLineWidth(0.7)
        c.roundRect(x, y, self.w, self.h, 6, stroke=1, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x + 14, y + self.h / 2 - 3, self.en_text)
        c.setFont("ArabicFont", 11)
        c.drawRightString(x + self.w - 14, y + self.h / 2 - 3, ar(self.ar_text))


# ---------- Build the document ----------
def build(output_path: str):
    doc = BaseDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=1.8 * cm,
        title="The Waterfall Model — Quick Study Guide (EN/AR)",
        author="Software Engineering Course",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="std", frames=frame, onPage=on_page)])

    styles = make_styles()
    story = []

    # ============================================================
    # COVER
    # ============================================================
    story.append(Spacer(1, 4 * cm))
    story.append(Paragraph("The Waterfall Model", styles["Title1"]))
    story.append(Paragraph(ar("نموذج الشلال"), styles["Title1AR"]))

    # decorative rule
    rule = Table([[""]], colWidths=[12 * cm], rowHeights=[0.08 * cm])
    rule.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), ACCENT)]))
    rule.hAlign = "CENTER"
    story.append(rule)
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph("Quick Study Guide  ·  Software Engineering", styles["Subtitle"]))
    story.append(Paragraph(ar("ملخص سريع · هندسة البرمجيات"),
                           ParagraphStyle(name="SubAR", fontName="ArabicFont",
                                          fontSize=13, alignment=TA_CENTER,
                                          textColor=MUTED, spaceAfter=20)))

    story.append(Spacer(1, 3 * cm))
    cover_blurb = (
        "A brief bilingual summary of the Waterfall SDLC model: phases, "
        "pros and cons, comparison with Agile, and the most likely exam questions."
    )
    story.append(Paragraph(cover_blurb,
                           ParagraphStyle(name="CoverBlurbEN", parent=styles["BodyEN"],
                                          alignment=TA_CENTER, textColor=MUTED,
                                          fontSize=10)))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        ar("ملخص مختصر ثنائي اللغة لنموذج الشلال في دورة حياة تطوير البرمجيات: "
           "المراحل، المزايا والعيوب، والمقارنة مع المنهجية الرشيقة، "
           "وأهم الأسئلة المتوقعة في الامتحان."),
        ParagraphStyle(name="CoverBlurbAR", fontName="ArabicFont", fontSize=11,
                       alignment=TA_CENTER, textColor=MUTED, leading=16)
    ))
    story.append(PageBreak())

    # ============================================================
    # 1. DEFINITION + ORIGIN
    # ============================================================
    story.append(Paragraph("1. What is the Waterfall Model?", styles["H1EN"]))
    story.append(Paragraph(ar("ما هو نموذج الشلال؟"), styles["H1AR"]))

    story.append(Paragraph(
        "The Waterfall model is the oldest and simplest Software Development "
        "Life Cycle (SDLC) model. It organizes development into a strict "
        "sequence of phases where each phase must be fully completed before "
        "the next begins. Introduced by Dr. Winston W. Royce in 1970.",
        styles["BodyEN"]
    ))
    story.append(Paragraph(
        ar("نموذج الشلال هو أقدم وأبسط نماذج دورة حياة تطوير البرمجيات. "
           "يقوم بتنظيم عملية التطوير في سلسلة صارمة من المراحل المتتابعة، "
           "حيث يجب إنهاء كل مرحلة بشكل كامل قبل البدء في المرحلة التالية. "
           "قُدِّم هذا النموذج من قِبَل الدكتور وينستون رويس عام 1970."),
        styles["BodyAR"]
    ))

    # ============================================================
    # 2. PHASES
    # ============================================================
    story.append(Paragraph("2. The 6 Phases", styles["H1EN"]))
    story.append(Paragraph(ar("المراحل الست"), styles["H1AR"]))

    phases = [
        ("Requirements", "تحليل المتطلبات",
         "Gather and document all requirements in an SRS document.",
         "جمع جميع المتطلبات وتوثيقها في مستند مواصفات المتطلبات."),
        ("Design", "التصميم",
         "Translate requirements into architecture, UML, and database design.",
         "ترجمة المتطلبات إلى معمارية النظام ومخططات UML وتصميم قاعدة البيانات."),
        ("Implementation", "البرمجة والتنفيذ",
         "Write the source code module by module, based on the design.",
         "كتابة الكود البرمجي وحدة بوحدة بناءً على التصميم."),
        ("Testing", "الاختبار",
         "Unit, integration, system, and acceptance testing against the SRS.",
         "اختبار الوحدات والتكامل والنظام والقبول وفقًا لمستند المتطلبات."),
        ("Deployment", "النشر والتسليم",
         "Deliver the system to the customer and install it in production.",
         "تسليم النظام للعميل وتثبيته في بيئة التشغيل الفعلية."),
        ("Maintenance", "الصيانة",
         "Fix bugs and adapt the software to changes after deployment.",
         "إصلاح الأخطاء وتكييف البرنامج مع المتغيرات بعد التسليم."),
    ]

    phase_rows = [[Paragraph("<b>Phase (EN)</b>", styles["BodyEN"]),
                   Paragraph("<b>Description</b>", styles["BodyEN"]),
                   Paragraph(ar("<b>المرحلة والوصف</b>"),
                             ParagraphStyle(name="THAR", fontName="ArabicFont",
                                            fontSize=10, alignment=TA_RIGHT,
                                            textColor=colors.white))]]
    # header styled separately; we'll use a different approach: two tables
    phase_data = []
    phase_data.append([
        Paragraph("<b>Phase</b>", ParagraphStyle(
            name="thead", fontName="Helvetica-Bold", fontSize=10, textColor=colors.white)),
        Paragraph("<b>Description (EN)</b>", ParagraphStyle(
            name="thead2", fontName="Helvetica-Bold", fontSize=10, textColor=colors.white)),
        Paragraph(ar("الوصف"), ParagraphStyle(
            name="thead3", fontName="ArabicFont", fontSize=11,
            alignment=TA_RIGHT, textColor=colors.white)),
    ])
    for en_name, ar_name, en_desc, ar_desc in phases:
        phase_data.append([
            Paragraph(f"<b>{en_name}</b><br/><font size=8 color='#5A5A5A'>{en_name}</font>",
                      styles["BodyEN"]),
            Paragraph(en_desc, styles["BodyEN"]),
            Paragraph(ar(f"<b>{ar_name}</b><br/>{ar_desc}"),
                      ParagraphStyle(name=f"ar_{en_name}", fontName="ArabicFont",
                                     fontSize=10, alignment=TA_RIGHT,
                                     textColor=TEXT, leading=14)),
        ])
    phase_tbl = Table(phase_data, colWidths=[3 * cm, 7 * cm, 7 * cm])
    phase_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT_BG]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(phase_tbl)
    story.append(Spacer(1, 6))

    # ============================================================
    # 3. DIAGRAM  (kept together on one page)
    # ============================================================
    phase_labels = [
        ("Requirements", "المتطلبات"),
        ("Design", "التصميم"),
        ("Implementation", "التنفيذ"),
        ("Testing", "الاختبار"),
        ("Deployment", "النشر"),
        ("Maintenance", "الصيانة"),
    ]
    phase_colors = [
        colors.HexColor("#1F3A68"),
        colors.HexColor("#2E5799"),
        colors.HexColor("#3F7CC4"),
        colors.HexColor("#C25E00"),
        colors.HexColor("#D88A2E"),
        colors.HexColor("#8B8B8B"),
    ]

    diagram_block = [
        Paragraph("3. Diagram", styles["H1EN"]),
        Paragraph(ar("المخطط التوضيحي"), styles["H1AR"]),
        Spacer(1, 4),
    ]
    for i, ((en, ara), color) in enumerate(zip(phase_labels, phase_colors)):
        diagram_block.append(CascadeStep(en, ara, color, left_offset=i * 1.0 * cm))
        diagram_block.append(Spacer(1, 3))
    diagram_block.append(Spacer(1, 6))
    diagram_block.append(Paragraph(
        "Figure 1 — Work flows downward, one phase at a time.",
        ParagraphStyle(name="cap_en", fontName="Helvetica-Oblique", fontSize=9,
                       alignment=TA_CENTER, textColor=MUTED)
    ))
    diagram_block.append(Paragraph(
        ar("الشكل 1 — العمل يتدفق إلى الأسفل مرحلة تلو الأخرى"),
        ParagraphStyle(name="cap_ar", fontName="ArabicFont", fontSize=9,
                       alignment=TA_CENTER, textColor=MUTED)
    ))

    story.append(KeepTogether(diagram_block))

    story.append(PageBreak())

    # ============================================================
    # 4. ADVANTAGES / DISADVANTAGES (side by side)
    # ============================================================
    story.append(Paragraph("4. Advantages & Disadvantages", styles["H1EN"]))
    story.append(Paragraph(ar("المزايا والعيوب"), styles["H1AR"]))

    advantages = [
        ("Simple and easy to understand", "بسيط وسهل الفهم"),
        ("Clear structure and milestones", "هيكل واضح ومراحل محددة"),
        ("Strong documentation", "توثيق قوي"),
        ("Easy to manage and track", "سهل الإدارة والمتابعة"),
        ("Works well for fixed requirements", "مناسب للمتطلبات الثابتة"),
    ]
    disadvantages = [
        ("Inflexible to change", "لا يتقبل التغيير"),
        ("Late customer feedback", "ملاحظات العميل تأتي متأخرة"),
        ("Bugs found late and expensive", "اكتشاف الأخطاء متأخرًا ومكلف"),
        ("No working software until the end", "لا يوجد برنامج يعمل إلا في النهاية"),
        ("Poor fit for unclear requirements", "غير مناسب للمتطلبات غير الواضحة"),
    ]

    # Two column table: green pros | red cons
    # IMPORTANT: we render English and Arabic as SEPARATE paragraphs stacked in
    # each cell. Mixing them in one Paragraph with inline <font> tags breaks
    # Arabic shaping because ReportLab re-tokenizes the already-bidi'd text.
    cell_en_style = ParagraphStyle(
        name="pcell_en", fontName="Helvetica", fontSize=10,
        leading=13, textColor=TEXT, alignment=TA_LEFT,
    )
    cell_ar_style = ParagraphStyle(
        name="pcell_ar", fontName="ArabicFont", fontSize=11,
        leading=15, textColor=TEXT, alignment=TA_RIGHT,
    )
    header_en_style = ParagraphStyle(
        name="prosH_en", fontName="Helvetica-Bold", fontSize=11,
        textColor=colors.white, alignment=TA_LEFT,
    )
    header_ar_style = ParagraphStyle(
        name="prosH_ar", fontName="ArabicFont", fontSize=11,
        textColor=colors.white, alignment=TA_RIGHT,
    )

    pros_cons_data = [[
        [Paragraph("✔ Advantages", header_en_style),
         Paragraph(ar("المزايا"), header_ar_style)],
        [Paragraph("✘ Disadvantages", header_en_style),
         Paragraph(ar("العيوب"), header_ar_style)],
    ]]
    for (adv_en, adv_ar), (dis_en, dis_ar) in zip(advantages, disadvantages):
        pros_cons_data.append([
            [Paragraph(f"• {adv_en}", cell_en_style),
             Paragraph(ar(f"• {adv_ar}"), cell_ar_style)],
            [Paragraph(f"• {dis_en}", cell_en_style),
             Paragraph(ar(f"• {dis_ar}"), cell_ar_style)],
        ])
    pros_cons_tbl = Table(pros_cons_data, colWidths=[8.5 * cm, 8.5 * cm])
    pros_cons_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), GREEN),
        ("BACKGROUND", (1, 0), (1, 0), RED),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(pros_cons_tbl)
    story.append(Spacer(1, 10))

    # ============================================================
    # 5. WHEN TO USE
    # ============================================================
    story.append(Paragraph("5. When to Use Waterfall", styles["H1EN"]))
    story.append(Paragraph(ar("متى نستخدم نموذج الشلال؟"), styles["H1AR"]))

    use_cases_en = [
        "Requirements are clear and will not change.",
        "The technology is well-known and stable.",
        "The project is short and well-defined.",
        "The customer demands formal documentation (government, military, medical).",
    ]
    use_cases_ar = [
        "عندما تكون المتطلبات واضحة ولن تتغير.",
        "عندما تكون التقنية معروفة ومستقرة.",
        "عندما يكون المشروع قصيرًا ومحددًا جيدًا.",
        "عندما يطلب العميل توثيقًا رسميًا (المشاريع الحكومية، العسكرية، الطبية).",
    ]
    for en, ara in zip(use_cases_en, use_cases_ar):
        story.append(Paragraph(f"• {en}", styles["BulletEN"]))
        story.append(Paragraph(ar(f"• {ara}"), styles["BulletAR"]))

    story.append(PageBreak())

    # ============================================================
    # 6. WATERFALL VS AGILE
    # ============================================================
    story.append(Paragraph("6. Waterfall vs. Agile", styles["H1EN"]))
    story.append(Paragraph(ar("الشلال مقابل الرشيقة"), styles["H1AR"]))

    # Structure: (english_label, arabic_label)
    comparison_rows = [
        (("Aspect", "الجانب"),
         ("Waterfall", "الشلال"),
         ("Agile", "الرشيقة")),
        (("Approach", "المنهجية"),
         ("Linear, one pass", "خطي، مرحلة واحدة"),
         ("Iterative, many cycles", "تكراري، عدة دورات")),
        (("Requirements", "المتطلبات"),
         ("Frozen upfront", "ثابتة مسبقًا"),
         ("Evolve each sprint", "تتطور كل فترة")),
        (("Feedback", "التغذية الراجعة"),
         ("End of project", "في نهاية المشروع"),
         ("Every sprint", "بعد كل سبرنت")),
        (("Documentation", "التوثيق"),
         ("Heavy", "كثيف ومفصل"),
         ("Light", "خفيف ومختصر")),
        (("Change", "التغيير"),
         ("Hard to handle", "صعب التعامل معه"),
         ("Embraced", "مُرحَّب به")),
        (("Delivery", "التسليم"),
         ("One final release", "تسليم نهائي واحد"),
         ("Continuous releases", "إصدارات متتابعة")),
        (("Best for", "الأنسب لـ"),
         ("Stable, fixed scope", "النطاق الثابت المستقر"),
         ("Evolving requirements", "المتطلبات المتغيرة")),
    ]

    # Styles used inside the cells. Each cell stacks an English paragraph
    # and an Arabic paragraph — never mixed inside a single Paragraph.
    cmp_header_en = ParagraphStyle(
        name="cmp_h_en", fontName="Helvetica-Bold", fontSize=10,
        textColor=colors.white, alignment=TA_CENTER, leading=13,
    )
    cmp_header_ar = ParagraphStyle(
        name="cmp_h_ar", fontName="ArabicFont", fontSize=11,
        textColor=colors.white, alignment=TA_CENTER, leading=14,
    )
    cmp_body_en = ParagraphStyle(
        name="cmp_b_en", fontName="Helvetica", fontSize=9,
        textColor=TEXT, alignment=TA_CENTER, leading=12,
    )
    cmp_body_ar = ParagraphStyle(
        name="cmp_b_ar", fontName="ArabicFont", fontSize=10,
        textColor=TEXT, alignment=TA_CENTER, leading=13,
    )

    cmp_cells = []
    for i, row in enumerate(comparison_rows):
        cmp_row = []
        for en_text, ar_text in row:
            if i == 0:
                cmp_row.append([
                    Paragraph(en_text, cmp_header_en),
                    Paragraph(ar(ar_text), cmp_header_ar),
                ])
            else:
                cmp_row.append([
                    Paragraph(en_text, cmp_body_en),
                    Paragraph(ar(ar_text), cmp_body_ar),
                ])
        cmp_cells.append(cmp_row)

    cmp_tbl = Table(cmp_cells, colWidths=[4 * cm, 6.5 * cm, 6.5 * cm])
    cmp_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(cmp_tbl)
    story.append(Spacer(1, 8))

    story.append(PageBreak())

    # ============================================================
    # 7. TOP EXAM QUESTIONS (brief)
    # ============================================================
    story.append(Paragraph("7. Most Likely Exam Questions", styles["H1EN"]))
    story.append(Paragraph(ar("أهم الأسئلة المتوقعة في الامتحان"), styles["H1AR"]))

    questions = [
        (
            "Q1. Who invented the Waterfall model and when?",
            "Winston W. Royce in 1970.",
            "من هو مخترع نموذج الشلال ومتى؟",
            "الدكتور وينستون رويس عام 1970.",
        ),
        (
            "Q2. What are the phases?",
            "Requirements → Design → Implementation → Testing → Deployment → Maintenance.",
            "ما هي مراحل النموذج؟",
            "المتطلبات ← التصميم ← التنفيذ ← الاختبار ← النشر ← الصيانة.",
        ),
        (
            "Q3. Why is it called 'Waterfall'?",
            "Because the work flows downward from one phase to the next like a waterfall, with no going back.",
            "لماذا يُسمى نموذج الشلال؟",
            "لأن العمل يتدفق من مرحلة إلى التي تليها مثل الشلال، بدون الرجوع للخلف.",
        ),
        (
            "Q4. Main advantage?",
            "Simple, well-structured, heavily documented, easy to manage.",
            "ما هي أهم ميزة؟",
            "بسيط، منظم، موثق بشكل كامل، وسهل الإدارة.",
        ),
        (
            "Q5. Main disadvantage?",
            "Cannot handle changes. Customer sees the software only at the end, so mistakes are discovered too late.",
            "ما هو أهم عيب؟",
            "لا يتقبل التغيير، والعميل لا يرى البرنامج إلا في النهاية، فتُكتشف الأخطاء متأخرًا.",
        ),
        (
            "Q6. When should you use it?",
            "When requirements are stable, the project is short, and heavy documentation is required — like in government, military, or medical projects.",
            "متى نستخدمه؟",
            "عندما تكون المتطلبات ثابتة، والمشروع قصيرًا، ويُطلب توثيق رسمي — مثل المشاريع الحكومية، العسكرية، والطبية.",
        ),
        (
            "Q7. How is Waterfall different from Agile?",
            "Waterfall is linear and plan-driven; Agile is iterative and feedback-driven. Waterfall freezes requirements; Agile expects them to change.",
            "ما الفرق بين الشلال والرشيقة (Agile)؟",
            "الشلال خطي ويعتمد على التخطيط المسبق، والرشيقة تكرارية وتعتمد على التغذية الراجعة. الشلال يثبّت المتطلبات، أما الرشيقة فتتوقع تغيّرها.",
        ),
        (
            "Q8. What happens if requirements change during coding?",
            "The team must go back to the requirements phase, update the SRS and design, then restart coding. This is expensive.",
            "ماذا يحدث إذا تغيّرت المتطلبات أثناء البرمجة؟",
            "يجب على الفريق الرجوع إلى مرحلة المتطلبات، وتحديث الوثائق والتصميم، ثم إعادة البرمجة. وهذا مكلف جدًا.",
        ),
        (
            "Q9. What is the V-Model?",
            "A Waterfall variant shaped like a 'V' that pairs each development phase with a matching testing phase.",
            "ما هو نموذج V (V-Model)؟",
            "هو تعديل على نموذج الشلال على شكل حرف V، يربط كل مرحلة تطوير بمرحلة اختبار مقابلة لها.",
        ),
        (
            "Q10. Is Waterfall still used today?",
            "Yes — in aerospace, defense, medical devices, and government projects where strict documentation and regulation are required.",
            "هل ما زال نموذج الشلال مُستخدمًا اليوم؟",
            "نعم — في مشاريع الطيران والدفاع والأجهزة الطبية والحكومية حيث يُطلب التوثيق الصارم والامتثال التنظيمي.",
        ),
    ]

    for q_en, a_en, q_ar, a_ar in questions:
        story.append(Paragraph(q_en, styles["QLabel"]))
        story.append(Paragraph(a_en, styles["ALabel"]))
        story.append(Paragraph(ar(q_ar), styles["QLabelAR"]))
        story.append(Paragraph(ar(a_ar), styles["ALabelAR"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "— End · انتهى —",
        ParagraphStyle(name="end", fontName="ArabicFont", fontSize=10,
                       alignment=TA_CENTER, textColor=MUTED)
    ))

    doc.build(story)
    print(f"PDF generated: {output_path}")


if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    output = os.path.join(out_dir, "waterfall_brief_EN_AR.pdf")
    build(output)
