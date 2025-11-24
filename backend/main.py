"""FastAPI application for nurse note AI backend."""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from models import GenerateRequest, GenerateResponse, ErrorResponse
from services.ai_service import get_ai_service
from utils.prompt_template import build_prompt

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Nurse Note AI Backend",
    description="Backend API for generating SOAP notes and care plans from nurse visit notes",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Allow POST and GET
    allow_headers=["*"],  # Allow all headers
)


# Custom exception handler to format errors as {"error": "..."}
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Format HTTP exceptions as JSON with error field."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Nurse Note AI Backend is running"}


@app.post("/generate", response_model=GenerateResponse)
async def generate_note(request: GenerateRequest):
    """
    Generate SOAP note and care plan from nurse's visit note.
    
    Args:
        request: GenerateRequest containing the nurse's note
        
    Returns:
        GenerateResponse containing the AI-generated output
        
    Raises:
        HTTPException: If generation fails or validation error occurs
    """
    try:
        # Build prompt from template
        prompt = build_prompt(request.note)
        
        # Get AI service and generate output
        ai_service = get_ai_service()
        output = ai_service.generate_output(prompt)
        return GenerateResponse(output=output)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail="Validation error"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate output"
        )
    except ConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail="Service unavailable"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate output"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

