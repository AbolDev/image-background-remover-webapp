from flask import Flask, request, render_template, send_file
from config import ALLOWED_EXTENSIONS # type: ignore
from flask_cors import CORS
from RMBG import process # type: ignore
import numpy as np
import cv2
import io

app = Flask(__name__)

CORS(app)

@app.errorhandler(404)
def page_not_found(error):
    return 'This page does not exist', 404

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def upload_form():
    return render_template('upload.html')

@app.route('/rmbg', methods=['POST'])
def rmbg():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    img_bytes = file.read()
    
    image = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), flags=cv2.IMREAD_COLOR)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_o = process(image_rgb)
    
    img_byte_array = io.BytesIO()
    image_o.save(img_byte_array, format='PNG')
    img_byte_array.seek(0)

    return send_file(img_byte_array, mimetype='image/png')

app.run(host="0.0.0.0", port=80, debug=True)
