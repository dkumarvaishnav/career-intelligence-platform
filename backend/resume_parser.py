import fitz # pymupdf
import logging

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file stream.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = []
        for page in doc:
            text.append(page.get_text())
        return "\n".join(text)
    except Exception as e:
        logging.error(f"Error parsing PDF: {e}")
        raise ValueError("Could not parse PDF file.")
