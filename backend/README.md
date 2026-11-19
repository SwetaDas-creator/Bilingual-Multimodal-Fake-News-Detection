# Bilingual Fake News Detection API

A new FastAPI service for the existing Next.js frontend. Only English text classification is implemented. Bengali, image-only, and multimodal requests are explicitly rejected as unsupported; this backend does not return mock results.

## Backend layout

    backend/
    ├── app/
    │   ├── main.py
    │   ├── routers/
    │   │   └── predict.py
    │   ├── schemas/
    │   │   └── prediction.py
    │   └── services/
    │       └── english_bert.py
    ├── models/
    │   └── english_bert/
    │       └── .gitkeep
    ├── requirements.txt
    └── README.md

## Python environment

Use Python 3.11 or newer. From PowerShell in this directory:

    py -3.11 -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt

PyTorch wheels depend on the operating system and CPU/GPU setup. If you need a CUDA build, choose the matching command from the official PyTorch installer selector before installing dependencies.

## Add the English BERT files

Copy the saved model files locally into:

    models/english_bert/

The folder must contain the Hugging Face tokenizer, model configuration, and sequence-classification weights. The saved configuration must define both FAKE and REAL labels through id2label or label2id. Alternatively, include label_mapping.json in this folder with either an id2label object such as {"0":"FAKE","1":"REAL"} or a label2id object such as {"FAKE":0,"REAL":1}.

The service loads only local files (local_files_only=True); it does not download or fabricate model weights. Until the files and mapping are present, English prediction returns HTTP 503.

## Run

    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

The API documentation is available at http://127.0.0.1:8000/docs. GET /health returns {"status":"ok"}.

To connect the existing frontend, set this in the frontend's .env.local and restart Next.js:

    NEXT_PUBLIC_API_URL=http://localhost:8000

The frontend currently falls back to mock responses while that variable is empty. This README does not change the frontend configuration.

## API

POST /api/predict accepts multipart/form-data fields matching the frontend:

- mode: one of bengali-text, english-text, image-only, multimodal
- language: Bengali, English, or Not applicable
- text: optional text field (required for english-text)
- image: optional uploaded file

For english-text with language=English, the API returns exactly the frontend response fields: verdict, confidence, mode, language, model, and explanation. verdict maps the saved FAKE/REAL model label to likely_fake/likely_real, respectively.

Other modes return HTTP 501 with an unsupported-mode detail. Missing local model files or a missing/invalid saved label mapping return HTTP 503; inference failures return HTTP 500. No prediction is generated when the model is unavailable.
