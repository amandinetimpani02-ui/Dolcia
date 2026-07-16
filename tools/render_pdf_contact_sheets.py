from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "output" / "pdf" / "Dolcia_Product_Book_MASTER_v16_CONFIDENTIEL_2026-07-15.pdf"
OUT = ROOT / "tmp" / "pdfs" / "v16"
OUT.mkdir(parents=True, exist_ok=True)
pdf = pdfium.PdfDocument(PDF)
thumbs = []
for i in range(len(pdf)):
    bitmap = pdf[i].render(scale=1.25)
    im = bitmap.to_pil().convert("RGB")
    page_path = OUT / f"page-{i+1:02d}.png"
    im.save(page_path)
    thumb = im.copy()
    thumb.thumbnail((360, 510))
    canvas = Image.new("RGB", (380, 550), "#d8d3ca")
    canvas.paste(thumb, ((380-thumb.width)//2, 20))
    ImageDraw.Draw(canvas).text((15, 525), f"Page {i+1}", fill="black")
    thumbs.append(canvas)
for start in range(0, len(thumbs), 6):
    group = thumbs[start:start+6]
    sheet = Image.new("RGB", (1140, 1100), "#706b63")
    for j, im in enumerate(group):
        x = (j % 3) * 380
        y = (j // 3) * 550
        sheet.paste(im, (x, y))
    sheet.save(OUT / f"contact-{start//6+1:02d}.png")
print(f"pages={len(pdf)} sheets={(len(thumbs)+5)//6}")
