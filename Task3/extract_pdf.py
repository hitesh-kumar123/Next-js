import pdfplumber
import os

pdf_path = r"C:\HiteeshHub\Projects\Practice project\Next js Task\Task2\Nextjs Graphql Fullstack Task Description Doc.pdf"
output_path = r"c:\HiteeshHub\Projects\Practice project\Next js Task\Task3\pdf_text.txt"

if not os.path.exists(pdf_path):
    print(f"Error: PDF file not found at {pdf_path}")
    exit(1)

print(f"Extracting text from {pdf_path}...")
with pdfplumber.open(pdf_path) as pdf:
    full_text = []
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        full_text.append(f"--- PAGE {i+1} ---")
        full_text.append(text)

with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(full_text))

print(f"Successfully saved extracted text to {output_path}")
