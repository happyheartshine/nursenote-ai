# Nurse Note AI Backend

FastAPI backend for generating SOAP notes and care plans from psychiatric home-visit nursing documentation.

## Features

- **POST /generate**: Generate SOAP notes and care plans from free-text visit notes
- OpenAI GPT-4o-mini integration
- Japanese psychiatric nursing documentation format
- Comprehensive error handling
- CORS enabled for development

## Prerequisites

- Python 3.10 or higher
- OpenAI API key

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set up environment variables:

Create a `.env` file in the `backend` directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Or export it in your shell:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

## Running the Server

### Development Mode (with auto-reload)

```bash
uvicorn main:app --reload
```

The server will start on `http://localhost:8000`

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /generate

Generate SOAP note and care plan from a nurse's visit note.

**Request:**
```json
{
  "note": "訪問記録の自由記述テキスト"
}
```

**Response:**
```json
{
  "output": "S（主観）:\nO（客観）:\nA（アセスメント）:\nP（計画）:\n\n【看護計画書】\n長期目標:\n短期目標:\n看護援助の方針:"
}
```

**Error Response:**
```json
{
  "error": "Failed to generate output"
}
```

### GET /

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Nurse Note AI Backend is running"
}
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application and endpoints
├── models.py               # Pydantic request/response models
├── services/
│   └── ai_service.py       # OpenAI service integration
├── utils/
│   └── prompt_template.py  # Prompt template for AI generation
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Error Handling

The API handles various error scenarios:

- **400 Bad Request**: Validation errors (invalid request format)
- **500 Internal Server Error**: AI generation failures, missing API key
- **503 Service Unavailable**: Connection errors to OpenAI API

All errors return JSON format:
```json
{
  "error": "Error message"
}
```

## Development

### Testing the API

You can test the API using curl:

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{"note": "患者は本日、不安が強く、睡眠が取れていない様子でした。"}'
```

Or using Python requests:

```python
import requests

response = requests.post(
    "http://localhost:8000/generate",
    json={"note": "患者は本日、不安が強く、睡眠が取れていない様子でした。"}
)
print(response.json())
```

## Notes

- The model used is `gpt-4o-mini` (fast and stable)
- CORS is enabled for all origins (`*`) for development
- The prompt template is optimized for Japanese psychiatric home-visit nursing documentation
- Output format follows standard SOAP notation and care plan structure

