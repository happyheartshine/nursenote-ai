"""AI service for generating SOAP notes and care plans using OpenAI."""

import os
from typing import Optional
from openai import OpenAI
from openai import APIError, APIConnectionError, RateLimitError


class AIService:
    """Service for interacting with OpenAI API."""
    
    def __init__(self):
        """Initialize the AI service with OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"  # Using gpt-4o-mini as gpt-4.1-mini doesn't exist
    
    def generate_output(self, prompt: str) -> str:
        """
        Generate output using OpenAI API.
        
        Args:
            prompt: The complete prompt string
            
        Returns:
            Generated text output
            
        Raises:
            APIError: If OpenAI API returns an error
            APIConnectionError: If connection to OpenAI fails
            RateLimitError: If rate limit is exceeded
            ValueError: If API key is missing or invalid
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in psychiatric home-visit nursing documentation."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            print('ai response', response);
            if not response.choices or not response.choices[0].message.content:
                raise ValueError("Empty response from OpenAI API")
            
            return response.choices[0].message.content.strip()
            
        except APIConnectionError as e:
            raise ConnectionError(f"Failed to connect to OpenAI API: {str(e)}")
        except RateLimitError as e:
            raise ValueError(f"OpenAI API rate limit exceeded: {str(e)}")
        except APIError as e:
            raise ValueError(f"OpenAI API error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Unexpected error during AI generation: {str(e)}")


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """
    Get or create the AI service singleton.
    
    Returns:
        AIService instance
    """
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service

