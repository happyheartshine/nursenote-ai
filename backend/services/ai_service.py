"""AI service layer for generating SOAP notes via OpenAI."""

import os
from typing import Optional

from openai import OpenAI, OpenAIError


class AIServiceError(RuntimeError):
    """Raised when AI generation fails."""


class AIService:
    """Thin wrapper around the OpenAI Responses API."""

    def __init__(self, model: Optional[str] = None):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise AIServiceError("OPENAI_API_KEY environment variable is not set.")

        self.client = OpenAI(api_key=api_key)
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    def generate_output(self, prompt: str) -> str:
        """Send prompt to OpenAI and return the generated text."""
        try:
            response = self.client.responses.create(
                model=self.model,
                input=prompt,
                temperature=0.3,
                max_output_tokens=700,
            )

            output_text = response.output_text if hasattr(response, "output_text") else None
            if not output_text:
                raise AIServiceError("Empty response from OpenAI API.")
            return output_text.strip()

        except OpenAIError as exc:
            raise AIServiceError(f"OpenAI API error: {exc}") from exc
        except Exception as exc:  # pragma: no cover - defensive
            raise AIServiceError(f"Unexpected error during AI generation: {exc}") from exc


_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Return singleton AI service instance."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service

