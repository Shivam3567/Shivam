from flask import Flask, request, redirect, url_for, send_file, render_template, jsonify
from werkzeug.utils import secure_filename
from pdf2image import convert_from_path
from PIL import Image
import os
import pikepdf

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'mysite/uploads/'
app.config['CONVERTED_FOLDER'] = 'converted/'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def decrypt_pdf(input_path, output_path, password):
    try:
        with pikepdf.open(input_path, password=password) as pdf:
            pdf.save(output_path)
        return True
    except pikepdf.PasswordError:
        return False
    except Exception as e:
        print(f"Decryption error: {e}")  # Print error for debugging
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Get the password from the form
        password = request.form.get('password', '')
        decrypted_filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'decrypted_' + filename)

        # Attempt to decrypt the PDF
        if not decrypt_pdf(filepath, decrypted_filepath, password):
            return jsonify({'error': 'Incorrect password or decryption failed. Check the logs for more details.'}), 400

        try:
            # Convert decrypted PDF to images
            images = convert_from_path(decrypted_filepath)
            jpg_paths = []

            for i, image in enumerate(images):
                jpg_filename = f'{filename}_{i}.jpg'
                jpg_path = os.path.join(app.config['CONVERTED_FOLDER'], jpg_filename)
                image.save(jpg_path, 'JPEG')
                jpg_paths.append(jpg_filename)

            return render_template('result.html', jpg_paths=jpg_paths)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['CONVERTED_FOLDER'], filename), as_attachment=True, download_name=filename)

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    if not os.path.exists(app.config['CONVERTED_FOLDER']):
        os.makedirs(app.config['CONVERTED_FOLDER'])
    app.run(debug=True)
