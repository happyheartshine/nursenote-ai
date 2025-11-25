"""FastAPI application for NurseNote AI backend."""

import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import ErrorResponse, GenerateRequest, GenerateResponse
from services.ai_service import AIServiceError, get_ai_service
from utils.prompt_template import build_prompt

load_dotenv()

ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS")
DEFAULT_DEV_ORIGINS: List[str] = ["*"]
ALLOWED_ORIGINS = (
    [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]
    if ALLOWED_ORIGINS_ENV
    else DEFAULT_DEV_ORIGINS
)

app = FastAPI(
    title="NurseNote AI Backend",
    description="Generate SOAP＋看護計画 for psychiatric home-visit nursing.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post(
    "/generate",
    response_model=GenerateResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def generate_note(request: GenerateRequest) -> GenerateResponse:
    if not request.s.strip() and not request.o.strip():
        raise HTTPException(
            status_code=400,
            detail="SまたはOのいずれか一方は必須です。",
        )

    prompt = build_prompt(
        chief_complaint=request.chief_complaint,
        s_text=request.s,
        o_text=request.o,
    )

    try:
        output = get_ai_service().generate_output(prompt)
        return GenerateResponse(output=output)
    except AIServiceError:
        raise HTTPException(
            status_code=502,
            detail="AI生成中にエラーが発生しました。",
        )
    except Exception:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=500,
            detail="AI生成中にエラーが発生しました。",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

