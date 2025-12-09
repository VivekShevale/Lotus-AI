# app/controllers/data_controller.py
from flask import Flask, request, send_file, jsonify
from app.services.clean_data import clean_data
import io
import time

# app/controllers/data_controller.py

def clean_file():
    time.sleep(2)
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        f = request.files['file']

        # Convert incoming options
        missing_threshold = float(request.form.get("missing_threshold", 0.6))
        outlier_method = request.form.get("outlier_method", "iqr")
        scale_features = request.form.get("scale_features", "false").lower() == "true"

        # Step-toggles from frontend
        remove_duplicates = request.form.get("remove_duplicates", "true") == "true"
        handle_missing = request.form.get("handle_missing", "true") == "true"
        clean_text = request.form.get("clean_text", "true") == "true"
        remove_outliers = request.form.get("remove_outliers", "true") == "true"

        # Run cleaning
        df, encoders = clean_data(
            input_csv=f,
            missing_threshold=missing_threshold,
            outlier_method=outlier_method,
            remove_outliers=remove_outliers,
            scale_features=scale_features,
            run_remove_duplicates=remove_duplicates,
            run_handle_missing=handle_missing,
            run_clean_text=clean_text
        )

        # Prepare CSV for download
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)

        # Build response
        response = send_file(
            output,
            mimetype="text/csv",
            as_attachment=True,
            download_name="cleaned_data.csv"
        )

        # Add stats headers
        response.headers['X-Original-Rows'] = str(request.form.get("original_rows", 0))
        response.headers['X-Cleaned-Rows'] = str(len(df))
        response.headers['X-Removed-Rows'] = str(int(request.form.get("original_rows", 0)) - len(df))

        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500