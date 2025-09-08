"""
AI-powered geocoding service for converting place names to coordinates
"""

import json
import re
from typing import Optional, Tuple, List, Dict, Any
from common.result import Result, Success, Failure
import google.generativeai as genai
from django.conf import settings


class AIGeocodingService:
    """AI service for geocoding place names to coordinates"""

    def __init__(self):
        """Initialize the AI geocoding service"""
        try:
            if not settings.GEMINI_API_KEY:
                self.model = None
                return

            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel("gemini-pro")
        except Exception as e:
            print(f"Failed to initialize Gemini AI for geocoding: {e}")
            self.model = None

    def geocode_place(
        self, place_name: str, context: str = ""
    ) -> Result[Tuple[float, float, str], str]:
        """
        Convert a place name to latitude/longitude coordinates using AI

        Args:
            place_name: The name of the place to geocode
            context: Additional context about the place (e.g., country, region)

        Returns:
            Result containing (latitude, longitude, full_place_name) or error message
        """
        try:
            if not self.model:
                return Failure("Gemini API not configured for geocoding")

            prompt = self._build_geocoding_prompt(place_name, context)
            response = self.model.generate_content(prompt)
            result_text = getattr(response, "text", "").strip()

            if not result_text:
                return Failure("Empty response from Gemini API")

            # Parse the JSON response
            try:
                result_data = json.loads(result_text)

                if not isinstance(result_data, dict):
                    return Failure("Invalid response format from AI")

                latitude = result_data.get("latitude")
                longitude = result_data.get("longitude")
                full_name = result_data.get("full_name", place_name)
                confidence = result_data.get("confidence", 0.0)

                if latitude is None or longitude is None:
                    return Failure("Missing coordinates in AI response")

                # Validate coordinates
                if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
                    return Failure("Invalid coordinate values")

                # Only return results with reasonable confidence
                if confidence < 0.3:
                    return Failure(f"Low confidence geocoding result: {confidence}")

                return Success((float(latitude), float(longitude), full_name))

            except json.JSONDecodeError as e:
                return Failure(f"Failed to parse AI response as JSON: {e}")

        except Exception as e:
            return Failure(f"Error during geocoding: {str(e)}")

    def extract_and_geocode_places(
        self, content: str
    ) -> Result[List[Dict[str, Any]], str]:
        """
        Extract place names from content and geocode them

        Args:
            content: The diary entry content to analyze

        Returns:
            Result containing list of geocoded places or error message
        """
        try:
            if not self.model:
                return Failure("Gemini API not configured for geocoding")

            prompt = self._build_place_extraction_prompt(content)
            response = self.model.generate_content(prompt)
            result_text = getattr(response, "text", "").strip()

            if not result_text:
                return Failure("Empty response from Gemini API")

            # Parse the JSON response
            try:
                places_data = json.loads(result_text)

                if not isinstance(places_data, list):
                    return Failure("Invalid response format from AI")

                geocoded_places = []

                for place_info in places_data:
                    place_name = place_info.get("place_name", "")
                    context = place_info.get("context", "")
                    confidence = place_info.get("confidence", 0.0)

                    if not place_name or confidence < 0.3:
                        continue

                    # Geocode this place
                    geocode_result = self.geocode_place(place_name, context)

                    if geocode_result.is_successful():
                        lat, lng, full_name = geocode_result.value
                        geocoded_places.append(
                            {
                                "place_name": place_name,
                                "full_name": full_name,
                                "latitude": lat,
                                "longitude": lng,
                                "context": context,
                                "confidence": confidence,
                            }
                        )

                return Success(geocoded_places)

            except json.JSONDecodeError as e:
                return Failure(f"Failed to parse AI response as JSON: {e}")

        except Exception as e:
            return Failure(f"Error during place extraction and geocoding: {str(e)}")

    def _build_geocoding_prompt(self, place_name: str, context: str = "") -> str:
        """Build the prompt for geocoding a specific place"""
        context_info = f" Additional context: {context}" if context else ""

        return f"""
You are a geocoding expert. I need you to find the exact latitude and longitude coordinates for a place.

Place name: "{place_name}"{context_info}

Please provide the coordinates in JSON format with this exact structure:
{{
    "latitude": <decimal latitude>,
    "longitude": <decimal longitude>,
    "full_name": "<full official name of the place>",
    "confidence": <confidence score from 0.0 to 1.0>
}}

Guidelines:
- Use decimal degrees format for coordinates
- Latitude: -90 to 90 (negative for South, positive for North)
- Longitude: -180 to 180 (negative for West, positive for East)
- Provide the most specific, well-known location possible
- If the place is ambiguous, choose the most likely location based on context
- Confidence should reflect how certain you are about the location
- Only return valid JSON, no additional text

If you cannot determine the location with reasonable confidence, return:
{{"error": "Location not found or ambiguous"}}
"""

    def _build_place_extraction_prompt(self, content: str) -> str:
        """Build the prompt for extracting places from diary content"""
        return f"""
Analyze the following diary entry and extract all place names mentioned. Focus on specific, geocodable locations.

Diary entry:
"{content}"

For each place mentioned, provide:
1. The exact place name as mentioned in the text
2. Any additional context (country, region, etc.) that helps identify the location
3. A confidence score (0.0 to 1.0) indicating how certain you are this is a real, geocodable place

Return the results as a JSON array with this exact format:
[
    {{
        "place_name": "exact name from text",
        "context": "additional context like country/region",
        "confidence": 0.0 to 1.0
    }}
]

Guidelines:
- Only include places that are specific enough to be geocoded
- Exclude vague references like "home", "work", "the store" unless they have specific names
- Include cities, countries, landmarks, restaurants, venues, etc.
- Confidence should reflect how specific and well-known the place is
- Only return valid JSON, no additional text

If no places are found, return an empty array: []
"""
