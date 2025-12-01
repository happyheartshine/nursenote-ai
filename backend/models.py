from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Request body for /generate."""

    userName: str = Field(
        default="",
        description="利用者名",
    )
    diagnosis: str = Field(
        default="",
        description="主疾患",
    )
    nurses: list[str] = Field(
        default_factory=list,
        description="看護師名（複数選択可）",
    )
    visitDate: str = Field(
        default="",
        description="訪問日（YYYY-MM-DD形式）",
    )
    startTime: str = Field(
        default="",
        description="訪問開始時間（HH:MM形式）",
    )
    endTime: str = Field(
        default="",
        description="訪問終了時間（HH:MM形式）",
    )
    chiefComplaint: str = Field(
        default="",
        description="主訴（任意入力）",
    )
    sText: str = Field(
        default="",
        description="S（主観）",
    )
    oText: str = Field(
        default="",
        description="O（客観）",
    )


class GenerateResponse(BaseModel):
    """Successful response body."""

    output: str = Field(..., description="AI生成テキスト（SOAP＋看護計画）")


class ErrorResponse(BaseModel):
    """Error response payload."""

    error: str = Field(..., description="エラーメッセージ")

