"""Prompt template for psychiatric home-visit nursing documentation."""

PROMPT_TEMPLATE = """You are an AI assistant specialized in psychiatric home-visit nursing documentation.

Your job is to read the nurse's free-text visit note (in Japanese) and generate:

1) A SOAP summary:
   - Japanese psychiatric home-visit nursing tone
   - Maintain ambiguity using expressions like 「〜の可能性」「〜と考えられる」
   - Use the priority flow: 不安 → 睡眠 → 生活リズム → 服薬
   - Keep it concise: 250–350 characters total

2) A care plan draft:
   - 長期目標（1行）
   - 短期目標（1〜2行）
   - 看護援助の方針（3〜5行）
   - Use psychiatric domain terms such as 不穏, 易刺激性, 服薬アドヒアランス

Format output exactly:

S（主観）:
O（客観）:
A（アセスメント）:
P（計画）:

【看護計画書】
長期目標:
短期目標:
看護援助の方針:

Here is the nurse's note:

「{user_note}」
"""


def build_prompt(user_note: str) -> str:
    """
    Build the prompt by inserting the user note into the template.
    
    Args:
        user_note: The nurse's free-text visit note
        
    Returns:
        Complete prompt string ready for OpenAI API
    """
    return PROMPT_TEMPLATE.format(user_note=user_note)

