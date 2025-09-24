from __future__ import annotations

import io
import mimetypes
from typing import Optional

from django.core.files.uploadedfile import UploadedFile

try:
    from PIL import Image
except Exception:
    Image = None  # Pillow optional during tests

try:
    import pytesseract
except Exception:
    pytesseract = None

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except Exception:
    pdf_extract_text = None


def detect_content_type(file: UploadedFile) -> str:
    """Best-effort detection of MIME type."""
    # Prefer provided content_type from Django UploadedFile
    if getattr(file, "content_type", None):
        return file.content_type
    guessed, _ = mimetypes.guess_type(getattr(file, "name", ""))
    return guessed or "application/octet-stream"


def clean_text(text: str) -> str:
    """Clean text by removing null bytes and other problematic characters."""
    if not text:
        return ""
    # Remove null bytes and other control characters that can cause database issues
    return text.replace('\x00', '').replace('\x01', '').replace('\x02', '').replace('\x03', '').replace('\x04', '').replace('\x05', '').replace('\x06', '').replace('\x07', '').replace('\x08', '').replace('\x0b', '').replace('\x0c', '').replace('\x0e', '').replace('\x0f', '').replace('\x10', '').replace('\x11', '').replace('\x12', '').replace('\x13', '').replace('\x14', '').replace('\x15', '').replace('\x16', '').replace('\x17', '').replace('\x18', '').replace('\x19', '').replace('\x1a', '').replace('\x1b', '').replace('\x1c', '').replace('\x1d', '').replace('\x1e', '').replace('\x1f', '').strip()


def extract_text_from_file(file: UploadedFile) -> str:
    """Extract text from uploaded file. Supports images (OCR), PDFs, and text files.

    Returns empty string if extraction is not possible.
    """
    try:
        content_type = detect_content_type(file)
        filename = getattr(file, "name", "")

        # Read bytes once and reuse
        file_bytes = file.read()
        # Reset file pointer so Django can save it afterwards
        try:
            file.seek(0)
        except Exception:
            pass

        if not file_bytes:
            return ""

        # Handle simple text types
        if content_type.startswith("text/") or filename.lower().endswith((".txt", ".md", ".csv", ".log")):
            try:
                return clean_text(file_bytes.decode("utf-8", errors="ignore"))
            except Exception:
                return ""

        # Handle PDFs
        if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
            if pdf_extract_text is None:
                return ""
            try:
                return clean_text(pdf_extract_text(io.BytesIO(file_bytes)) or "")
            except Exception:
                return ""

        # Handle common image types via OCR
        if content_type.startswith("image/") or filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff")):
            if Image is None or pytesseract is None:
                return ""
            try:
                image = Image.open(io.BytesIO(file_bytes))
                text = pytesseract.image_to_string(image)
                return clean_text(text or "")
            except Exception:
                return ""

        # Fallback: try to decode as text
        try:
            return clean_text(file_bytes.decode("utf-8", errors="ignore"))
        except Exception:
            return ""
    except Exception:
        return ""

