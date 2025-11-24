from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Request model for the /generate endpoint."""
    note: str = Field(..., description="訪問記録の自由記述テキスト", min_length=1)


class GenerateResponse(BaseModel):
    """Response model for the /generate endpoint."""
    output: str = Field(..., description="AI generated SOAP + care plan")


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str = Field(..., description="Error message")

