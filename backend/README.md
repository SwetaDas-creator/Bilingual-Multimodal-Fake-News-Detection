# Bilingual Fake News Detection API

FastAPI backend for the existing Next.js project. The API supports English and Bengali text-only inference, plus English and Bengali text+image inference. Image-only inference is not implemented. The API returns model-generated predictions; it does not use a mock fallback.

## Local model files

Copy the multimodal checkpoints to these paths before starting the server:

- `models/english_multimodal/model.pt`
- `models/bangla_multimodal/model.pt`

The existing text-only models remain in `models/english_bert/` and `models/banglabert/`. Model binaries are intentionally excluded from Git; transfer them separately to each machine.

## Model input pipeline

Both multimodal models use the training notebook architecture: BERT-family text encoder, ResNet-50 with its final FC replaced by identity, concatenated CLS and image features, then a 2816→512→2 classifier. Inference uses local tokenizer/config assets, 128-token truncation and max-length padding, and CPU inference. Images are converted to RGB, resized to 224×224, converted to tensors, and normalized with ImageNet mean/std. Multimodal labels are 0=REAL and 1=FAKE.

For English, the training data text field was `clean_title`; use a headline for closest match to training. For Bengali, training text was `headline + " " + description`; enter the combined text in the frontend field.

## Setup

Use Python 3.11 or newer in this directory:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health check: `GET http://127.0.0.1:8000/health`.

## Prediction modes

`POST /api/predict` accepts multipart form fields `mode`, `language`, optional `text`, and optional `image`.

- `english-text` + `English`
- `bangla-text` + `Bengali`
- `english-multimodal` + `English` (text and image required)
- `bangla-multimodal` + `Bengali` (text and image required)

CORS allows the existing frontend at `http://localhost:3000`.
