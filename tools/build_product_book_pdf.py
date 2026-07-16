from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle
)

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "Dolcia_Product_Book_MASTER_v16_CONFIDENTIEL_2026-07-15.docx"
OUT_DIR = ROOT / "output" / "pdf"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "Dolcia_Product_Book_MASTER_v16_CONFIDENTIEL_2026-07-15.pdf"
HERO = ROOT / "assets" / "dolcia-eclat-concept.png"

BLACK = colors.HexColor("#080909")
CREAM = colors.HexColor("#F4EFE4")
GOLD = colors.HexColor("#D8BC7C")
MUTED = colors.HexColor("#716B61")
INK = colors.HexColor("#171512")
PALE = colors.HexColor("#F3EBDD")

font_dir = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("DolciaSans", str(font_dir / "arial.ttf")))
pdfmetrics.registerFont(TTFont("DolciaSansBold", str(font_dir / "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("DolciaSerif", str(font_dir / "georgia.ttf")))
pdfmetrics.registerFont(TTFont("DolciaSerifBold", str(font_dir / "georgiab.ttf")))
pdfmetrics.registerFont(TTFont("DolciaSerifItalic", str(font_dir / "georgiai.ttf")))


class DolciaDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, rightMargin=1.65*cm, leftMargin=1.65*cm,
                         topMargin=1.75*cm, bottomMargin=1.55*cm,
                         title="Dolcia - Product Book MASTER v16",
                         author="Dolcia - document confidentiel")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates(PageTemplate(id="content", frames=[frame], onPage=self.decorate))

    def decorate(self, canvas, doc):
        if doc.page == 1:
            return
        canvas.saveState()
        canvas.setFont("DolciaSansBold", 7)
        canvas.setFillColor(GOLD)
        canvas.drawCentredString(A4[0]/2, A4[1]-0.72*cm, "DOLCIA  •  CONFIDENTIEL - DIFFUSION CONTROLEE  •  MASTER v16")
        canvas.setStrokeColor(colors.HexColor("#D8BC7C66"))
        canvas.line(1.65*cm, A4[1]-0.88*cm, A4[0]-1.65*cm, A4[1]-0.88*cm)
        canvas.setFont("DolciaSans", 7)
        canvas.setFillColor(MUTED)
        canvas.drawCentredString(A4[0]/2, 0.72*cm, f"DOLCIA - 15 JUILLET 2026  •  {doc.page}")
        canvas.restoreState()


styles = getSampleStyleSheet()
body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="DolciaSans", fontSize=9.5,
                      leading=13.2, textColor=INK, spaceAfter=6)
h1 = ParagraphStyle("H1", fontName="DolciaSerif", fontSize=26, leading=28, textColor=INK,
                    spaceBefore=2, spaceAfter=10)
h2 = ParagraphStyle("H2", fontName="DolciaSerif", fontSize=15.5, leading=18, textColor=INK,
                    spaceBefore=8, spaceAfter=6)
h3 = ParagraphStyle("H3", fontName="DolciaSansBold", fontSize=10.5, leading=13, textColor=INK,
                    spaceBefore=7, spaceAfter=5)
kicker = ParagraphStyle("Kicker", fontName="DolciaSansBold", fontSize=7.2, leading=9,
                        textColor=GOLD, spaceAfter=7, tracking=1)
lead = ParagraphStyle("Lead", fontName="DolciaSans", fontSize=11, leading=15, textColor=MUTED,
                      spaceAfter=10)
bullet = ParagraphStyle("Bullet", parent=body, leftIndent=13, firstLineIndent=-8, bulletIndent=2,
                        spaceAfter=4)
quote_style = ParagraphStyle("Quote", fontName="DolciaSerifItalic", fontSize=15.5, leading=20,
                             textColor=CREAM, alignment=TA_CENTER, leftIndent=14, rightIndent=14)
cover_title = ParagraphStyle("Cover", fontName="DolciaSerif", fontSize=36, leading=39,
                             textColor=CREAM, alignment=TA_CENTER)
cover_sub = ParagraphStyle("CoverSub", fontName="DolciaSansBold", fontSize=10, leading=13,
                           textColor=GOLD, alignment=TA_CENTER)
cover_tag = ParagraphStyle("CoverTag", fontName="DolciaSerif", fontSize=18, leading=22,
                           textColor=CREAM, alignment=TA_CENTER)


def safe(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace("—", "-").replace("‑", "-").replace("•", "&#8226;"))


story = []
cover_data = [[
    Paragraph("DOLCIA", cover_title),
], [
    Paragraph("PRODUCT BOOK MASTER v16", cover_sub),
]]
cover_table = Table(cover_data, colWidths=[17.7*cm], rowHeights=[1.5*cm, .9*cm])
cover_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), BLACK), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 10), ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8),
]))
story.extend([cover_table, Spacer(1, .25*cm)])
if HERO.exists():
    im = Image(str(HERO), width=17.7*cm, height=9.96*cm)
    story.append(im)
story.extend([
    Spacer(1, .35*cm),
    Table([[Paragraph("VOS PROCHAINES EMOTIONS COMMENCENT ICI.", cover_tag)],
           [Paragraph("CONFIDENTIEL - DIFFUSION CONTROLEE<br/>15 juillet 2026 • Le Touquet, territoire pilote", cover_sub)]],
          colWidths=[17.7*cm], style=TableStyle([
              ("BACKGROUND", (0,0), (-1,-1), BLACK), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
              ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9),
          ])),
    PageBreak()
])

src = Document(DOCX)
identity_image_added = False


def has_page_break(p):
    return bool(p._p.xpath('.//w:br[@w:type="page"]'))


def paragraph_flow(p):
    global identity_image_added
    text = p.text.strip()
    if has_page_break(p):
        story.append(PageBreak())
    if not text:
        return
    style = p.style.name if p.style else ""
    if style == "Heading 1":
        story.append(Paragraph(safe(text), h1))
        if text == "Le D vivant & L'Éclat" and HERO.exists() and not identity_image_added:
            story.append(Image(str(HERO), width=13.6*cm, height=7.65*cm))
            story.append(Spacer(1, .15*cm))
            identity_image_added = True
    elif style == "Heading 2":
        story.append(Paragraph(safe(text), h2))
    elif style == "Heading 3":
        story.append(Paragraph(safe(text), h3))
    elif style.startswith("List Bullet"):
        story.append(Paragraph("• " + safe(text), bullet))
    elif text.upper() == text and len(text) < 90:
        story.append(Paragraph(safe(text), kicker))
    elif text.startswith("Dolcia transforme") or text.startswith("Quatre espaces") or text.startswith("Le D est") or text.startswith("Dolcia distingue") or text.startswith("Une conversation") or text.startswith("Les réponses") or text.startswith("Le choix") or text.startswith("Un vrai programme") or text.startswith("Dolcia préfère") or text.startswith("Dolcia mémorise") or text.startswith("Dolcia peut") or text.startswith("Dolcia détecte") or text.startswith("Le cockpit") or text.startswith("Le luxe") or text.startswith("Le Product") or text.startswith("Protéger") or text.startswith("La vision") or text.startswith("Ces règles"):
        story.append(Paragraph(safe(text), lead))
    elif len(text) < 180 and (text.startswith("Dolcia connaît") or text.startswith("Nous sommes") or text.startswith("Un programme réussi") or text.startswith("Chaque instant")):
        q = Table([[Paragraph(safe(text), quote_style)]], colWidths=[17.2*cm])
        q.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), BLACK), ("BOX", (0,0), (-1,-1), .6, GOLD),
                               ("TOPPADDING", (0,0), (-1,-1), 13), ("BOTTOMPADDING", (0,0), (-1,-1), 13)]))
        story.append(q)
        story.append(Spacer(1, .15*cm))
    else:
        story.append(Paragraph(safe(text), body))


def table_flow(tbl):
    data = []
    for ridx, row in enumerate(tbl.rows):
        vals = []
        for cell in row.cells:
            txt = "<br/>".join(safe(p.text.strip()) for p in cell.paragraphs if p.text.strip())
            st = ParagraphStyle("cell", parent=body, fontName="DolciaSansBold" if ridx == 0 else "DolciaSans",
                                fontSize=7.4 if ridx == 0 else 7.8, leading=9.7,
                                textColor=GOLD if ridx == 0 else INK, spaceAfter=0)
            vals.append(Paragraph(txt or " ", st))
        data.append(vals)
    if not data:
        return
    cols = len(data[0])
    widths = [17.2*cm/cols] * cols
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="CENTER")
    commands = [
        ("BACKGROUND", (0,0), (-1,0), BLACK),
        ("BOX", (0,0), (-1,-1), .35, colors.HexColor("#CBB98F")),
        ("INNERGRID", (0,0), (-1,-1), .25, colors.HexColor("#D8CBAF")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7),
    ]
    for r in range(1, len(data)):
        commands.append(("BACKGROUND", (0,r), (-1,r), PALE if r % 2 else colors.HexColor("#E9DFCF")))
    t.setStyle(TableStyle(commands))
    story.append(t)
    story.append(Spacer(1, .14*cm))


# Skip the cover table already recreated; convert document body in source order.
seen_table = 0
for child in src.element.body.iterchildren():
    if child.tag == qn("w:p"):
        from docx.text.paragraph import Paragraph as DocxParagraph
        paragraph_flow(DocxParagraph(child, src))
    elif child.tag == qn("w:tbl"):
        seen_table += 1
        if seen_table == 1:
            continue
        from docx.table import Table as DocxTable
        table_flow(DocxTable(child, src))

doc = DolciaDoc(str(OUT))
doc.build(story)
print(OUT)
