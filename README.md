# PDF to JPG Converter

This is a simple web-based tool that converts PDF files into JPG images using JavaScript. It leverages the `pdf.js` library to handle PDF rendering and supports password-encrypted PDFs.

## Features

- Convert each page of a PDF file to a separate JPG image.
- Supports password-encrypted PDFs (user must provide the password).
- Automatically prompts for a password if the PDF is encrypted.
- Download images directly after conversion.

## Requirements

- A modern web browser that supports JavaScript.
- Include the following libraries in your HTML file:
  - `pdf.js`: For PDF handling and rendering.
