"""Generate a research-grade PDF on the Waterfall SDLC Model.

Produces: waterfall_model_research.pdf
Author target: Software Engineering course project (college).
"""

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    ListFlowable,
    ListItem,
)


# ---------- Styling ----------
BRAND = colors.HexColor("#1F3A68")      # deep blue
ACCENT = colors.HexColor("#C25E00")     # burnt orange
SOFT_BG = colors.HexColor("#F3F5F8")
TEXT = colors.HexColor("#1C1C1C")
MUTED = colors.HexColor("#5A5A5A")
RULE = colors.HexColor("#D1D5DB")


def make_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            fontName="Helvetica-Bold",
            fontSize=32,
            leading=38,
            alignment=TA_CENTER,
            textColor=BRAND,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverSubtitle",
            fontName="Helvetica",
            fontSize=16,
            leading=22,
            alignment=TA_CENTER,
            textColor=MUTED,
            spaceAfter=30,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverMeta",
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=TEXT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1",
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=26,
            textColor=BRAND,
            spaceBefore=18,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2",
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=BRAND,
            spaceBefore=12,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H3",
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=ACCENT,
            spaceBefore=8,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            textColor=TEXT,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyLeft",
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            alignment=TA_LEFT,
            textColor=TEXT,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletItem",
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            leftIndent=14,
            bulletIndent=2,
            textColor=TEXT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Quote",
            fontName="Helvetica-Oblique",
            fontSize=11,
            leading=16,
            leftIndent=20,
            rightIndent=20,
            textColor=MUTED,
            spaceBefore=6,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Caption",
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=MUTED,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="QA_Q",
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=15,
            textColor=BRAND,
            spaceBefore=10,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="QA_A",
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            alignment=TA_JUSTIFY,
            textColor=TEXT,
            leftIndent=14,
            spaceAfter=6,
        )
    )
    return styles


# ---------- Page decoration ----------
def on_page(canvas, doc):
    canvas.saveState()
    page_num = doc.page

    # Header rule on every page except cover
    if page_num > 1:
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(2 * cm, A4[1] - 1.6 * cm, A4[0] - 2 * cm, A4[1] - 1.6 * cm)
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(MUTED)
        canvas.drawString(2 * cm, A4[1] - 1.3 * cm, "The Waterfall Model  ·  Software Engineering Research")
        canvas.drawRightString(A4[0] - 2 * cm, A4[1] - 1.3 * cm, f"Page {page_num}")

    # Footer
    if page_num > 1:
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(2 * cm, 1.6 * cm, A4[0] - 2 * cm, 1.6 * cm)
        canvas.setFont("Helvetica-Oblique", 8)
        canvas.setFillColor(MUTED)
        canvas.drawCentredString(A4[0] / 2, 1.1 * cm,
                                 "Prepared as a course research deliverable")

    canvas.restoreState()


def build_document(output_path: str):
    doc = BaseDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2.2 * cm,
        bottomMargin=2 * cm,
        title="The Waterfall Model — Software Engineering Research",
        author="Software Engineering Course",
        subject="SDLC: Waterfall Model",
    )

    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="normal",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    doc.addPageTemplates([PageTemplate(id="Standard", frames=frame, onPage=on_page)])

    styles = make_styles()
    story = []

    # ============================================================
    # COVER PAGE
    # ============================================================
    story.append(Spacer(1, 4 * cm))
    story.append(Paragraph("The Waterfall Model", styles["CoverTitle"]))
    story.append(Paragraph("A Classical Software Development Life Cycle Approach",
                           styles["CoverSubtitle"]))

    # Decorative rule
    rule_tbl = Table([[""]], colWidths=[12 * cm], rowHeights=[0.08 * cm])
    rule_tbl.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), ACCENT)]))
    rule_tbl.hAlign = "CENTER"
    story.append(rule_tbl)
    story.append(Spacer(1, 1.2 * cm))

    cover_meta = [
        ["Course", "Software Engineering"],
        ["Topic", "Software Development Life Cycle (SDLC)"],
        ["Model", "Waterfall"],
        ["Document Type", "Research Report"],
    ]
    meta_tbl = Table(cover_meta, colWidths=[4.5 * cm, 7.5 * cm])
    meta_tbl.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), "Helvetica", 11),
                ("FONT", (0, 0), (0, -1), "Helvetica-Bold", 11),
                ("TEXTCOLOR", (0, 0), (0, -1), BRAND),
                ("TEXTCOLOR", (1, 0), (1, -1), TEXT),
                ("ALIGN", (0, 0), (0, -1), "RIGHT"),
                ("ALIGN", (1, 0), (1, -1), "LEFT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("LINEBELOW", (0, 0), (-1, -2), 0.4, RULE),
            ]
        )
    )
    meta_tbl.hAlign = "CENTER"
    story.append(meta_tbl)

    story.append(Spacer(1, 4 * cm))
    story.append(Paragraph(
        "An in-depth study of the Waterfall model: its phases, principles, "
        "strengths, limitations, and place in modern software engineering.",
        ParagraphStyle(
            name="CoverBlurb",
            parent=styles["Body"],
            alignment=TA_CENTER,
            textColor=MUTED,
            fontSize=10,
        ),
    ))
    story.append(PageBreak())

    # ============================================================
    # TABLE OF CONTENTS
    # ============================================================
    story.append(Paragraph("Table of Contents", styles["H1"]))
    toc_rows = [
        ("1.", "Abstract", "3"),
        ("2.", "Introduction to the SDLC", "3"),
        ("3.", "Origin and Historical Background", "4"),
        ("4.", "The Phases of the Waterfall Model", "5"),
        ("5.", "Diagrammatic Representation", "7"),
        ("6.", "Core Principles and Characteristics", "8"),
        ("7.", "Advantages of the Waterfall Model", "9"),
        ("8.", "Disadvantages and Limitations", "10"),
        ("9.", "Variants of the Waterfall Model", "11"),
        ("10.", "When to Use the Waterfall Model", "12"),
        ("11.", "Waterfall vs. Agile: A Comparative Analysis", "13"),
        ("12.", "Real-World Applications", "14"),
        ("13.", "Conclusion", "15"),
        ("14.", "References", "15"),
        ("A.", "Appendix: Anticipated Examination Questions", "16"),
    ]
    toc_tbl = Table(
        [[num, title, page] for num, title, page in toc_rows],
        colWidths=[1.2 * cm, 13 * cm, 1.5 * cm],
    )
    toc_tbl.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), "Helvetica", 11),
                ("FONT", (0, 0), (0, -1), "Helvetica-Bold", 11),
                ("TEXTCOLOR", (0, 0), (0, -1), ACCENT),
                ("TEXTCOLOR", (1, 0), (-1, -1), TEXT),
                ("ALIGN", (2, 0), (2, -1), "RIGHT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, RULE),
            ]
        )
    )
    story.append(toc_tbl)
    story.append(PageBreak())

    # ============================================================
    # 1. ABSTRACT
    # ============================================================
    story.append(Paragraph("1. Abstract", styles["H1"]))
    story.append(Paragraph(
        "The Waterfall model is one of the earliest and most influential software "
        "development life cycle (SDLC) methodologies. First formally described by "
        "Dr. Winston W. Royce in 1970, the model structures the software development "
        "process as a strictly sequential flow of phases: requirements, design, "
        "implementation, testing, deployment, and maintenance. Each phase must be "
        "completed in full before the next begins, and each produces formal "
        "documentation that serves as input to the subsequent phase. This research "
        "paper presents a comprehensive study of the Waterfall model, covering its "
        "historical origin, phases, core principles, advantages, limitations, "
        "variants, appropriate application contexts, and comparison with modern "
        "iterative methodologies such as Agile. The goal is to equip the reader "
        "with both a theoretical and practical understanding of when and why the "
        "Waterfall model remains relevant in contemporary software engineering.",
        styles["Body"],
    ))

    # ============================================================
    # 2. INTRODUCTION
    # ============================================================
    story.append(Paragraph("2. Introduction to the SDLC", styles["H1"]))
    story.append(Paragraph(
        "The Software Development Life Cycle (SDLC) is the overarching framework "
        "that defines the stages through which software moves from an initial idea "
        "to a deployed, maintained product. Every SDLC model aims to answer the "
        "same fundamental questions: <i>what</i> should be built, <i>how</i> it "
        "should be built, <i>who</i> is responsible for each activity, and <i>when</i> "
        "each activity happens. Different models answer these questions differently. "
        "Some favor rigid sequencing and heavy documentation; others favor "
        "flexibility and continuous customer feedback.",
        styles["Body"],
    ))
    story.append(Paragraph(
        "The Waterfall model sits at one extreme of this spectrum. It assumes that "
        "requirements can be fully understood at the start of the project, that "
        "design can be completed before coding begins, and that each phase hands "
        "off a signed-off document to the next. It is the canonical example of a "
        "<b>plan-driven</b> approach to software engineering and, for decades, was "
        "the default methodology taught in universities and used in industry. "
        "Even today, where iterative methods dominate, Waterfall remains an "
        "important reference point — both as a historical foundation and as a "
        "methodology that still fits certain classes of projects.",
        styles["Body"],
    ))

    # ============================================================
    # 3. HISTORY
    # ============================================================
    story.append(Paragraph("3. Origin and Historical Background", styles["H1"]))
    story.append(Paragraph(
        "The Waterfall model is most often attributed to Dr. Winston W. Royce, who "
        "described it in his 1970 paper <i>\"Managing the Development of Large "
        "Software Systems.\"</i> Interestingly, Royce presented the pure sequential "
        "model as an example of a flawed approach and immediately advocated for "
        "iteration and prototyping on top of it. However, later practitioners and "
        "government contractors adopted the linear version of his diagram as a "
        "prescriptive standard, and it is this simplified version that became "
        "known as the \"Waterfall model.\"",
        styles["Body"],
    ))
    story.append(Paragraph(
        "\"I believe in this concept, but the implementation described above is "
        "risky and invites failure.\"",
        styles["Quote"],
    ))
    story.append(Paragraph(
        "— Winston W. Royce, 1970 (on the pure linear flow)",
        ParagraphStyle(
            name="QuoteAttribution",
            parent=styles["Body"],
            alignment=TA_CENTER,
            textColor=MUTED,
            fontSize=9,
        ),
    ))
    story.append(Paragraph(
        "The model rose to prominence throughout the 1970s and 1980s, becoming the "
        "dominant methodology in aerospace, defense, and large-scale government "
        "projects. The U.S. Department of Defense formally endorsed it through "
        "standards such as DOD-STD-2167A, which mandated a Waterfall-like process "
        "for software contracted to the department. Its decline began in the 1990s "
        "with the publication of iterative methods, the Unified Process, and "
        "eventually the Agile Manifesto in 2001.",
        styles["Body"],
    ))

    story.append(PageBreak())

    # ============================================================
    # 4. PHASES
    # ============================================================
    story.append(Paragraph("4. The Phases of the Waterfall Model", styles["H1"]))
    story.append(Paragraph(
        "The Waterfall model is typically described in five to seven sequential "
        "phases. The variant presented below uses the most widely accepted "
        "six-phase formulation.",
        styles["Body"],
    ))

    phases = [
        (
            "4.1  Requirements Analysis",
            "All functional and non-functional requirements are collected from "
            "stakeholders and documented in a Software Requirements Specification "
            "(SRS). No design or development work begins until this document is "
            "reviewed, signed off, and considered complete. The SRS becomes the "
            "contract between the development team and the customer.",
            "Primary output: Software Requirements Specification (SRS)",
        ),
        (
            "4.2  System and Software Design",
            "The requirements are translated into a blueprint for the software. "
            "Architects produce high-level design documents (system architecture, "
            "module decomposition, data models, interface definitions) and "
            "low-level design documents (class diagrams, algorithms, database "
            "schemas). Design decisions are frozen before any code is written.",
            "Primary output: System Design Document (SDD), UML diagrams",
        ),
        (
            "4.3  Implementation (Coding)",
            "Developers implement the design in source code. Work is typically "
            "divided into modules or units, each coded independently based on the "
            "design specification. The goal of this phase is to produce working "
            "units of software that conform exactly to the design.",
            "Primary output: Source code organized into modules",
        ),
        (
            "4.4  Integration and Testing",
            "Individual modules are integrated into a complete system, and the "
            "system is tested against the requirements defined in the SRS. Testing "
            "includes unit testing, integration testing, system testing, and "
            "acceptance testing. Defects discovered here must be repaired before "
            "release.",
            "Primary output: Tested executable system, test reports",
        ),
        (
            "4.5  Deployment",
            "The validated system is delivered to the customer and installed in "
            "the production environment. User training, data migration, and "
            "rollout planning occur in this phase. In classical Waterfall, "
            "deployment marks the first time the customer sees the working product.",
            "Primary output: Deployed software, user documentation",
        ),
        (
            "4.6  Maintenance",
            "Post-deployment, the software enters a long-lived maintenance phase. "
            "Bug fixes, performance tuning, and adaptations to changing environments "
            "are performed. Major new features are typically treated as a new "
            "project, not as part of the original Waterfall cycle.",
            "Primary output: Patches, updates, maintenance reports",
        ),
    ]

    for title, body, out in phases:
        story.append(Paragraph(title, styles["H2"]))
        story.append(Paragraph(body, styles["Body"]))
        story.append(Paragraph(f"<b>{out}</b>", ParagraphStyle(
            name="PhaseOut",
            parent=styles["Body"],
            fontSize=10,
            textColor=ACCENT,
            leftIndent=10,
            spaceAfter=12,
        )))

    story.append(PageBreak())

    # ============================================================
    # 5. DIAGRAM
    # ============================================================
    story.append(Paragraph("5. Diagrammatic Representation", styles["H1"]))
    story.append(Paragraph(
        "The following diagram illustrates the classical Waterfall flow. Each "
        "phase cascades into the next, with the output of one phase forming the "
        "input of the next. There is no built-in mechanism to return upstream.",
        styles["Body"],
    ))
    story.append(Spacer(1, 8))

    # Build a visual "waterfall" diagram using a stacked table where each phase
    # is offset slightly to the right to create the cascading look.
    phase_labels = [
        "1.  Requirements",
        "2.  Design",
        "3.  Implementation",
        "4.  Testing",
        "5.  Deployment",
        "6.  Maintenance",
    ]
    phase_colors = [
        colors.HexColor("#1F3A68"),
        colors.HexColor("#2E5799"),
        colors.HexColor("#3F7CC4"),
        colors.HexColor("#C25E00"),
        colors.HexColor("#D88A2E"),
        colors.HexColor("#8B8B8B"),
    ]

    diagram_rows = []
    diagram_style = [
        ("FONT", (0, 0), (-1, -1), "Helvetica-Bold", 12),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
    ]

    # Each row = [left spacer, label block, right spacer]
    step_width = 7.5 * cm
    offset_step = 1.0 * cm
    for i, (label, color) in enumerate(zip(phase_labels, phase_colors)):
        left_w = offset_step * i
        right_w = 16 * cm - step_width - left_w
        diagram_rows.append(["", label, ""])
        diagram_style.append(("BACKGROUND", (1, i), (1, i), color))
        diagram_style.append(("LEFTPADDING", (1, i), (1, i), 18))
        # Column widths must match per-row; we cheat by using fixed column widths
        # with adjusted padding below.

    # Use fixed column widths; simulate offset via left padding per row
    col_widths = [0.1 * cm, 7.5 * cm, 0.1 * cm]

    # We actually want the row to shift right each step. Since Table has fixed
    # col widths, we instead render each phase as its own single-row table and
    # stack them with HAlign = LEFT with a custom left offset.
    from reportlab.platypus import Flowable

    class CascadeStep(Flowable):
        def __init__(self, text, fill_color, left_offset, width=7.5 * cm, height=0.95 * cm):
            super().__init__()
            self.text = text
            self.fill_color = fill_color
            self.left_offset = left_offset
            self.width_ = width
            self.height_ = height

        def wrap(self, availWidth, availHeight):
            return (availWidth, self.height_)

        def draw(self):
            c = self.canv
            x = self.left_offset
            y = 0
            c.setFillColor(self.fill_color)
            c.setStrokeColor(colors.HexColor("#0D1F3A"))
            c.setLineWidth(0.7)
            c.roundRect(x, y, self.width_, self.height_, 6, stroke=1, fill=1)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(x + 16, y + self.height_ / 2 - 4, self.text)

    for i, (label, color) in enumerate(zip(phase_labels, phase_colors)):
        story.append(CascadeStep(label, color, left_offset=i * 1.1 * cm))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Figure 1 · The classical Waterfall model cascades each phase into the "
        "next. Movement is strictly downward.",
        styles["Caption"],
    ))

    story.append(PageBreak())

    # ============================================================
    # 6. PRINCIPLES
    # ============================================================
    story.append(Paragraph("6. Core Principles and Characteristics", styles["H1"]))
    principles = [
        ("Strict sequencing",
         "Phases must be completed in order. A phase begins only when the "
         "previous one is fully complete and documented."),
        ("Document-driven hand-offs",
         "Each phase produces formal documents that serve as the authoritative "
         "input to the next phase and as the formal contract between stakeholders."),
        ("Requirements frozen upfront",
         "All functional and non-functional requirements are expected to be "
         "gathered, analysed, and approved before any design or coding begins."),
        ("No backward flow",
         "In the pure model, one cannot return to an earlier phase. Changes "
         "discovered late are expensive because they force a restart."),
        ("Clear milestones and deliverables",
         "Each phase ends with a well-defined milestone and deliverable, making "
         "the model highly trackable and auditable."),
        ("Testing concentrated near the end",
         "Formal testing begins only after implementation is complete, which "
         "means defects are often discovered late in the cycle."),
        ("Customer involvement at the extremes",
         "The customer is heavily involved at the beginning (requirements) and "
         "the end (acceptance) but rarely in between."),
    ]
    for title, body in principles:
        story.append(Paragraph(f"• <b>{title}.</b> {body}", styles["BulletItem"]))
        story.append(Spacer(1, 4))

    # ============================================================
    # 7. ADVANTAGES
    # ============================================================
    story.append(Paragraph("7. Advantages of the Waterfall Model", styles["H1"]))
    advantages = [
        ("Simplicity and clarity",
         "The model is easy to understand, teach, and manage, especially for "
         "teams new to software engineering."),
        ("Well-defined structure",
         "Clear phases and deliverables allow managers to track progress, "
         "estimate effort, and allocate resources with high confidence."),
        ("Strong documentation",
         "The heavy emphasis on documents makes the project auditable, "
         "transferable between teams, and easy to onboard new members into."),
        ("Suited to fixed-scope projects",
         "When requirements are stable and fully known, Waterfall offers a "
         "predictable path to delivery."),
        ("Effective for contractual work",
         "The phase-by-phase sign-off model aligns neatly with fixed-price "
         "contracts and regulatory environments."),
        ("Quality gates",
         "Each phase transition acts as a formal quality gate, forcing "
         "inspection and sign-off before work continues."),
    ]
    for title, body in advantages:
        story.append(Paragraph(f"<b>{title}.</b>  {body}", styles["Body"]))

    story.append(PageBreak())

    # ============================================================
    # 8. DISADVANTAGES
    # ============================================================
    story.append(Paragraph("8. Disadvantages and Limitations", styles["H1"]))
    disadvantages = [
        ("Inflexibility to change",
         "Real-world requirements rarely stay frozen. Any change discovered "
         "after the requirements phase is difficult and costly to accommodate."),
        ("Late customer feedback",
         "Because working software is only visible at the end, customers "
         "may reject the final product or request fundamental changes that "
         "cannot be cheaply accommodated."),
        ("Late defect discovery",
         "Bugs rooted in design errors are not found until the testing phase, "
         "where they are dramatically more expensive to fix than if caught earlier."),
        ("High risk for large projects",
         "The longer the single pass, the greater the risk that assumptions "
         "made at the beginning will no longer hold when the project finishes."),
        ("Poor fit for research-heavy projects",
         "Projects where the desired behaviour is not yet fully understood — "
         "such as new products, startups, or research — cannot freeze "
         "requirements and therefore do not fit Waterfall."),
        ("Documentation overhead",
         "Producing and maintaining the required documents consumes significant "
         "time and effort that could otherwise be spent building software."),
        ("No working software until late",
         "Stakeholders have nothing tangible to evaluate during most of the "
         "project, which erodes trust and delays feedback."),
    ]
    for title, body in disadvantages:
        story.append(Paragraph(f"<b>{title}.</b>  {body}", styles["Body"]))

    # ============================================================
    # 9. VARIANTS
    # ============================================================
    story.append(Paragraph("9. Variants of the Waterfall Model", styles["H1"]))
    story.append(Paragraph(
        "Several refinements of the pure Waterfall model attempt to address its "
        "rigidity while preserving its phase-based structure:",
        styles["Body"],
    ))

    variants = [
        ("Iterative Waterfall",
         "Permits limited backward flow to the previous phase only. When an "
         "issue is found in a phase, the team may return to the one immediately "
         "before it to correct errors, then resume forward progress."),
        ("V-Model (Verification and Validation)",
         "Folds the Waterfall into a V-shape, pairing each development phase "
         "with a corresponding testing phase: Requirements ↔ Acceptance Testing, "
         "Design ↔ Integration Testing, Implementation ↔ Unit Testing. Emphasises "
         "that testing activities should be planned in parallel with development."),
        ("Sashimi Waterfall",
         "Allows overlapping of adjacent phases so that later phases may begin "
         "before earlier phases are fully complete. Named after the way slices "
         "of sashimi overlap on a plate."),
        ("Incremental Waterfall",
         "Divides the system into smaller increments, each delivered through a "
         "mini-Waterfall cycle. Offers early partial deliveries while "
         "preserving the sequential structure within each increment."),
    ]
    for title, body in variants:
        story.append(Paragraph(f"<b>{title}.</b>  {body}", styles["Body"]))

    story.append(PageBreak())

    # ============================================================
    # 10. WHEN TO USE
    # ============================================================
    story.append(Paragraph("10. When to Use the Waterfall Model", styles["H1"]))
    story.append(Paragraph(
        "Waterfall is an appropriate choice when the following conditions hold:",
        styles["Body"],
    ))
    good_fit = [
        "Requirements are clearly defined, understood, and unlikely to change.",
        "The technology stack and tools are well-established and stable.",
        "The project is short enough that the linear pass completes before "
        "requirements drift.",
        "The customer expects a formal, document-heavy process (typical of "
        "government, defence, aerospace, and regulated industries).",
        "The team is distributed or new, and requires rigid structure to "
        "coordinate work.",
        "There is a fixed-price contract that forbids mid-project scope changes.",
    ]
    for item in good_fit:
        story.append(Paragraph(f"• {item}", styles["BulletItem"]))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Conversely, Waterfall is a poor choice when requirements are fuzzy or "
        "evolving, when stakeholder feedback is critical during development, "
        "when the team is building a new kind of product, or when time-to-market "
        "is more important than documentation.",
        styles["Body"],
    ))

    # ============================================================
    # 11. COMPARISON WITH AGILE
    # ============================================================
    story.append(Paragraph("11. Waterfall vs. Agile: A Comparative Analysis", styles["H1"]))
    story.append(Paragraph(
        "The Agile family of methodologies (Scrum, Kanban, XP) emerged explicitly "
        "as a response to the limitations of plan-driven approaches like Waterfall. "
        "The table below summarises the core contrasts.",
        styles["Body"],
    ))

    comparison_data = [
        ["Aspect", "Waterfall", "Agile (Scrum)"],
        ["Approach", "Linear, sequential, single pass", "Iterative, incremental, many short cycles"],
        ["Requirements", "Frozen upfront in the SRS", "Evolve continuously each sprint"],
        ["Customer feedback", "End of project", "Every sprint (1–4 weeks)"],
        ["Documentation", "Heavy, formal, upfront", "Light, 'just enough'"],
        ["Handles change", "Poorly; changes are expensive", "Embraces change as a first-class concept"],
        ["Delivery", "Single big-bang release", "Continuous incremental releases"],
        ["Risk discovery", "Late (during testing phase)", "Early (each sprint review)"],
        ["Team structure", "Phase-specialised roles", "Cross-functional self-organising teams"],
        ["Best suited for", "Fixed, well-understood scope", "Fuzzy or evolving requirements"],
        ["Planning horizon", "Entire project planned upfront", "Sprint-by-sprint planning"],
        ["Testing", "Concentrated near the end", "Continuous, throughout every sprint"],
    ]
    cmp_tbl = Table(comparison_data, colWidths=[3.8 * cm, 6.4 * cm, 6.4 * cm])
    cmp_tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 10),
                ("FONT", (0, 1), (-1, -1), "Helvetica", 9.5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, RULE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT_BG]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(cmp_tbl)
    story.append(Paragraph(
        "Table 1 · Comparison between Waterfall and Agile methodologies.",
        styles["Caption"],
    ))

    story.append(PageBreak())

    # ============================================================
    # 12. REAL-WORLD EXAMPLES
    # ============================================================
    story.append(Paragraph("12. Real-World Applications", styles["H1"]))
    story.append(Paragraph(
        "Despite the rise of Agile, the Waterfall model is still used — and in "
        "some domains, still preferred — today. Notable examples include:",
        styles["Body"],
    ))
    examples = [
        ("Aerospace and defence systems",
         "Mission-critical systems such as avionics, radar, and flight control "
         "software require exhaustive documentation and traceability. These "
         "industries often mandate Waterfall-like processes through standards "
         "such as DO-178C and MIL-STD-498."),
        ("Medical devices",
         "Regulators such as the FDA require formal documentation of "
         "requirements, design, verification, and validation. A strict "
         "phase-based process simplifies compliance with standards like "
         "IEC 62304."),
        ("Government and public-sector systems",
         "Government contracts typically require fixed scope, fixed budget, "
         "and formal sign-off at each milestone — a natural fit for Waterfall."),
        ("Construction and infrastructure software",
         "Systems tightly coupled to physical infrastructure (bridges, power "
         "plants, railways) cannot be iterated easily and benefit from the "
         "up-front rigour of Waterfall."),
        ("Academic and research projects",
         "Short, well-defined projects with clear goals and fixed deadlines — "
         "such as university course projects — sometimes map well onto a "
         "compressed Waterfall pass."),
    ]
    for title, body in examples:
        story.append(Paragraph(f"<b>{title}.</b>  {body}", styles["Body"]))

    # ============================================================
    # 13. CONCLUSION
    # ============================================================
    story.append(Paragraph("13. Conclusion", styles["H1"]))
    story.append(Paragraph(
        "The Waterfall model played a foundational role in establishing software "
        "engineering as a disciplined field. Its emphasis on up-front planning, "
        "formal documentation, and phase-based sign-off brought structure to an "
        "industry that had grown organically and chaotically. Although modern "
        "practice has largely shifted towards iterative and Agile approaches — "
        "which better handle evolving requirements and rapid feedback — the "
        "Waterfall model remains an important reference point. It is still the "
        "right choice for projects with fixed scope, stable technology, strict "
        "regulatory requirements, or contractual constraints. Understanding both "
        "its strengths and its limitations equips software engineers to choose "
        "the right process for the right project, which is ultimately the goal "
        "of studying software development life cycles.",
        styles["Body"],
    ))

    # ============================================================
    # 14. REFERENCES
    # ============================================================
    story.append(Paragraph("14. References", styles["H1"]))
    refs = [
        "Royce, W. W. (1970). <i>Managing the Development of Large Software "
        "Systems.</i> Proceedings of IEEE WESCON, 26, 1–9.",
        "Sommerville, I. (2016). <i>Software Engineering</i> (10th ed.). Pearson.",
        "Pressman, R. S., &amp; Maxim, B. R. (2020). <i>Software Engineering: A "
        "Practitioner's Approach</i> (9th ed.). McGraw-Hill.",
        "Boehm, B. W. (1988). A Spiral Model of Software Development and "
        "Enhancement. <i>Computer</i>, 21(5), 61–72.",
        "Beck, K. et al. (2001). <i>Manifesto for Agile Software Development.</i> "
        "Retrieved from agilemanifesto.org.",
        "IEEE Std 830-1998. <i>IEEE Recommended Practice for Software "
        "Requirements Specifications.</i>",
        "IEC 62304:2006. <i>Medical device software — Software life cycle "
        "processes.</i>",
    ]
    for i, ref in enumerate(refs, 1):
        story.append(Paragraph(f"[{i}]  {ref}", styles["Body"]))

    story.append(PageBreak())

    # ============================================================
    # APPENDIX: PREDICTED QUESTIONS
    # ============================================================
    story.append(Paragraph("Appendix A — Anticipated Examination Questions", styles["H1"]))
    story.append(Paragraph(
        "The following questions are the most likely to be asked by the examiner "
        "when defending this research paper. Each answer is written in a form "
        "suitable for an oral defence (viva) and has been kept concise so that "
        "the student can rehearse the talking points.",
        styles["Body"],
    ))

    qa_pairs = [
        ("Q1. Who introduced the Waterfall model and when?",
         "The model is attributed to Dr. Winston W. Royce, who described it in "
         "his 1970 paper <i>Managing the Development of Large Software "
         "Systems.</i> Ironically, Royce presented the purely linear form as an "
         "example of a flawed approach and recommended iteration on top of it, "
         "but later practitioners adopted the linear version and it became "
         "known as the Waterfall model."),
        ("Q2. What are the phases of the Waterfall model?",
         "Requirements analysis, system and software design, implementation "
         "(coding), integration and testing, deployment, and maintenance. Each "
         "phase must be completed before the next begins."),
        ("Q3. Why is it called 'Waterfall'?",
         "Because work flows strictly downward from one phase to the next, like "
         "water cascading down a waterfall. Once the work leaves a phase, it "
         "cannot flow back upstream in the pure model."),
        ("Q4. What are the main advantages of the Waterfall model?",
         "Simplicity, clear milestones, strong documentation, predictable "
         "planning, suitability for fixed-scope projects and contractual work, "
         "and the presence of quality gates between phases."),
        ("Q5. What are the main disadvantages?",
         "Inflexibility to change, late customer feedback, late defect "
         "discovery, high risk for large projects, unsuitability for projects "
         "with evolving requirements, heavy documentation overhead, and the "
         "absence of working software until the end of the project."),
        ("Q6. When should the Waterfall model be used?",
         "When requirements are well understood and stable, the technology is "
         "mature, the project is short enough to complete before requirements "
         "drift, or when regulatory or contractual constraints demand formal, "
         "document-based, phase-gated processes — typical in aerospace, "
         "defence, medical devices, and government systems."),
        ("Q7. How does Waterfall differ from Agile?",
         "Waterfall is linear, plan-driven, document-heavy, and delivers "
         "software at the end of the project. Agile is iterative, "
         "feedback-driven, lightweight on documentation, and delivers working "
         "software every sprint. Waterfall freezes requirements upfront; Agile "
         "expects them to evolve."),
        ("Q8. What is the V-Model and how does it relate to Waterfall?",
         "The V-Model is a Waterfall variant that folds the model into a "
         "V-shape, pairing each development phase with a corresponding testing "
         "phase. Requirements pair with acceptance testing, design with "
         "integration testing, and implementation with unit testing. It "
         "emphasises that testing should be planned alongside development, "
         "not postponed to the end."),
        ("Q9. Why did Royce criticise the pure Waterfall model?",
         "Royce argued that the pure linear flow was risky because it did not "
         "account for feedback, prototyping, or iteration. He proposed adding "
         "feedback loops and building a prototype first. His critique was "
         "largely ignored, and the simplified linear diagram became the model "
         "that carries his name."),
        ("Q10. Give a real-world example of a project where Waterfall is "
         "appropriate.",
         "Avionics software for a commercial aircraft. The requirements are "
         "rigorously specified by aviation authorities, the system must be "
         "formally verified against standards such as DO-178C, changes are "
         "not tolerated late in the cycle, and exhaustive documentation is a "
         "legal necessity. Waterfall (or its V-Model variant) fits this "
         "environment naturally."),
        ("Q11. What happens if a requirement changes during the coding phase?",
         "In the pure Waterfall model, the team must formally return to the "
         "requirements phase, update the SRS, update the design, and re-enter "
         "implementation. This is costly and disruptive, which is why pure "
         "Waterfall is poorly suited to environments where change is common."),
        ("Q12. What role does documentation play in Waterfall?",
         "Documentation is the backbone of the methodology. Each phase "
         "produces a formal document (SRS, SDD, test plan, user manual) that "
         "serves both as the handoff to the next phase and as the contractual "
         "deliverable. Documents make the process auditable, traceable, and "
         "transferable between teams."),
        ("Q13. Is the Waterfall model still used today?",
         "Yes, in domains that require formal verification, regulatory "
         "compliance, or contractual fixed-scope delivery: aerospace, defence, "
         "medical devices, government systems, and certain infrastructure "
         "projects. It has been largely replaced by Agile in commercial "
         "software, startups, and web development."),
        ("Q14. What is the difference between the Waterfall model and the "
         "Spiral model?",
         "The Spiral model, introduced by Barry Boehm in 1988, combines "
         "elements of Waterfall with iterative prototyping and explicit risk "
         "analysis. Instead of a single linear pass, the Spiral model cycles "
         "through risk-driven iterations. Waterfall is linear and plan-driven; "
         "Spiral is iterative and risk-driven."),
        ("Q15. What is meant by 'requirements freezing' in the Waterfall "
         "model?",
         "Requirements freezing is the principle that once the Software "
         "Requirements Specification is signed off, no new requirements may "
         "be added and existing ones may not be changed without a formal "
         "change-control process. This discipline is what gives Waterfall its "
         "predictability — and also what makes it brittle in the face of "
         "real-world change."),
        ("Q16. What is a 'quality gate' in the Waterfall model?",
         "A quality gate is a formal checkpoint at the end of each phase "
         "where the output documents are reviewed, verified, and signed off "
         "before the team is allowed to proceed to the next phase. Quality "
         "gates enforce the discipline of the model and prevent defects from "
         "silently propagating downstream."),
        ("Q17. Why is fixing a bug more expensive when discovered late in "
         "Waterfall?",
         "Because a late bug may require revisiting decisions made in earlier "
         "phases — requirements, design, or code — and re-verifying all "
         "downstream artefacts. Barry Boehm's classic research on software "
         "economics showed that defects found in production can cost up to "
         "100× more to fix than defects caught during requirements analysis."),
        ("Q18. Can Waterfall and Agile be combined?",
         "Yes. Hybrid approaches (sometimes called 'Water-Scrum-Fall') use "
         "Waterfall for the high-level planning and release milestones, while "
         "running Agile sprints within the implementation phase. This can be "
         "a pragmatic compromise in organisations that need both formal "
         "contractual structure and internal iterative flexibility."),
        ("Q19. What is the role of the customer in the Waterfall model?",
         "The customer is deeply involved at the start (providing and "
         "approving requirements) and at the end (accepting the delivered "
         "system). Between these two points, the customer typically has "
         "little visibility. This is one of the main criticisms of the model: "
         "the customer may only discover that the product does not match "
         "their real needs at acceptance time."),
        ("Q20. What is the biggest lesson learned from the decline of pure "
         "Waterfall?",
         "That software requirements are inherently uncertain, that feedback "
         "is more valuable than prediction, and that working software "
         "delivered frequently is a better measure of progress than "
         "documentation completeness. These lessons directly motivated the "
         "Agile Manifesto of 2001."),
    ]

    for q, a in qa_pairs:
        story.append(Paragraph(q, styles["QA_Q"]))
        story.append(Paragraph(a, styles["QA_A"]))

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "End of document.",
        ParagraphStyle(
            name="End",
            parent=styles["Body"],
            alignment=TA_CENTER,
            textColor=MUTED,
            fontSize=9,
        ),
    ))

    doc.build(story)
    print(f"PDF generated: {output_path}")


if __name__ == "__main__":
    import os
    out_dir = os.path.dirname(os.path.abspath(__file__))
    output = os.path.join(out_dir, "waterfall_model_research.pdf")
    build_document(output)
