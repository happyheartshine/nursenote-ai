from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Request body for /generate."""

    chief_complaint: str = Field(
        default="",
        description="主訴（任意入力）",
    )
    s: str = Field(
        default="",
        description="S（主観）",
    )
    o: str = Field(
        default="",
        description="O（客観）",
    )


class GenerateResponse(BaseModel):
    """Successful response body."""

    output: str = Field(..., description="AI生成テキスト（SOAP＋看護計画）")


class ErrorResponse(BaseModel):
    """Error response payload."""

    error: str = Field(..., description="エラーメッセージ")

