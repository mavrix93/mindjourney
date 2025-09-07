import google.generativeai as genai
import re
import json
from typing import List, Dict, Any
from google.api_core.exceptions import GoogleAPIError
from django.conf import settings
from returns.result import Result, Success, Failure
from pydantic import BaseModel, Field


class InsightData(BaseModel):
    """Pydantic model for insight data"""

    text_snippet: str = Field(..., description="The specific text that was categorized")
    category_name: str = Field(
        ..., description="Name of the category (e.g., 'London', 'Ice Cream')"
    )
    category_type: str = Field(
        ..., description="Type of category (place, product, movie, meal, etc.)"
    )
    sentiment_score: float = Field(
        ..., ge=-1.0, le=1.0, description="Sentiment score from -1.0 to 1.0"
    )
    confidence_score: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0"
    )
    start_position: int = Field(
        ..., ge=0, description="Start position in the original text"
    )
    end_position: int = Field(
        ..., ge=0, description="End position in the original text"
    )


class AIInsightExtractor:
    """AI service for extracting insights from diary entries"""

    def __init__(self):
        # Configure Gemini client
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use a strong default model; can be overridden later if needed
        self.model = genai.GenerativeModel("gemini-1.5-pro")

    def extract_insights(self, content: str) -> Result[List[InsightData], str]:
        """Extract insights from diary entry content"""
        try:
            if not settings.GEMINI_API_KEY:
                return Failure("Gemini API key not configured")

            prompt = self._build_prompt(content)
            # Generate content with Gemini
            response = self.model.generate_content(prompt)

            # google-generativeai returns text on .text
            insights_text = getattr(response, "text", None)
            if not insights_text:
                return Failure("Empty response from Gemini API")
            insights_data = self._parse_insights(insights_text, content)

            return Success(insights_data)

        except (GoogleAPIError, Exception) as e:
            return Failure(f"Error extracting insights: {str(e)}")

    def _build_prompt(self, content: str) -> str:
        """Build the prompt for AI insight extraction"""
        return f"""
Analyze the following diary entry and extract insights. For each insight, identify:

1. The specific text snippet that contains the insight
2. The category name (e.g., "London", "Ice Cream", "The Matrix")
3. The category type (place, product, movie, meal, person, activity, emotion, other)
4. The sentiment score (-1.0 to 1.0, where -1.0 is very negative, 0 is neutral, 1.0 is very positive)
5. The confidence score (0.0 to 1.0, how confident you are in this categorization)
6. The start and end positions of the text snippet in the original text

Diary entry:
"{content}"

Return the results as a JSON array with this exact format:
[
    {{
        "text_snippet": "exact text from the entry",
        "category_name": "name of the category",
        "category_type": "place|product|movie|meal|person|activity|emotion|other",
        "sentiment_score": -1.0 to 1.0,
        "confidence_score": 0.0 to 1.0,
        "start_position": 0,
        "end_position": 0
    }}
]

Only include insights that are meaningful and have a confidence score above 0.5. Focus on concrete entities like places, products, movies, meals, people, and activities rather than abstract concepts.
"""

    def _parse_insights(
        self, insights_text: str, original_content: str
    ) -> List[InsightData]:
        """Parse the AI response and validate insights"""
        try:
            # Extract JSON from the response
            json_match = re.search(r"\[.*\]", insights_text, re.DOTALL)
            if not json_match:
                return []

            insights_json = json.loads(json_match.group())
            insights_data = []

            for insight_dict in insights_json:
                try:
                    # Validate and create InsightData
                    insight = InsightData(**insight_dict)

                    # Validate that the text snippet exists in the original content
                    if insight.text_snippet.lower() in original_content.lower():
                        insights_data.append(insight)

                except Exception as e:
                    # Skip invalid insights
                    continue

            return insights_data

        except Exception as e:
            return []

    def calculate_overall_sentiment(self, insights: List[InsightData]) -> float:
        """Calculate overall sentiment for the entry based on insights"""
        if not insights:
            return 0.0

        # Weight sentiment by confidence score
        weighted_sentiment = sum(
            insight.sentiment_score * insight.confidence_score for insight in insights
        )
        total_confidence = sum(insight.confidence_score for insight in insights)

        if total_confidence == 0:
            return 0.0

        return weighted_sentiment / total_confidence
