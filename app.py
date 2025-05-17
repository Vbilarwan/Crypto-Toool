from flask import Flask, render_template, request, send_file
import pandas as pd
from fpdf import FPDF
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        df = pd.read_csv(filepath) if filename.endswith('.csv') else pd.read_excel(filepath)
        report = generate_report(df)
        pdf_path = create_pdf(report)

        return send_file(pdf_path, as_attachment=True)

def generate_report(df):
    summary = f"Report Summary:\nTotal Records: {len(df)}\n"
    summary += f"Columns: {', '.join(df.columns)}\n\n"
    summary += df.head(10).to_string(index=False)
    return summary

def create_pdf(text):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    for line in text.split('\n'):
        pdf.cell(200, 10, txt=line, ln=1)

    path = "report.pdf"
    pdf.output(path)
    return path

if __name__ == "__main__":
    app.run(debug=True)
