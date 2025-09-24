#!/usr/bin/env python3
import argparse
import json
import os
import sys


def setup_django() -> None:
    # Ensure backend is on sys.path and configure Django settings
    repo_root = os.path.dirname(os.path.abspath(__file__))
    backend_path = os.path.join(repo_root, "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mindjourney.settings")

    import django

    django.setup()


def load_input_text(args: argparse.Namespace) -> str:
    if args.text:
        return args.text
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            return f.read()
    # Read from stdin if no args provided
    if not sys.stdin.isatty():
        return sys.stdin.read()
    raise SystemExit("No input provided. Use --text, --file, or pipe content via stdin.")


def test_geocoding(place_name: str, pretty: bool = False) -> None:
    """Test geocoding a specific place"""
    from insights.geocoding_service import AIGeocodingService
    geocoding_service = AIGeocodingService()
    try:
        # Debug: Check if model is available
        if not geocoding_service.model:
            error_result = {
                "error": "Gemini API not configured - check GEMINI_API_KEY setting",
                "place_name": place_name
            }
            if pretty:
                print(json.dumps(error_result, indent=2, ensure_ascii=False))
            else:
                print(json.dumps(error_result, ensure_ascii=False))
            return
            
        lat, lng, full_name = geocoding_service.geocode_place(place_name)
        result = {
            "place_name": place_name,
            "full_name": full_name,
            "latitude": lat,
            "longitude": lng
        }
        if pretty:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        error_result = {
            "error": str(e),
            "place_name": place_name
        }
        if pretty:
            print(json.dumps(error_result, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(error_result, ensure_ascii=False))


def test_extract_places(content: str, pretty: bool = False) -> None:
    """Test extracting and geocoding places from content"""
    from insights.geocoding_service import AIGeocodingService
    geocoding_service = AIGeocodingService()
    try:
        places = geocoding_service.extract_and_geocode_places(content)
        if pretty:
            print(json.dumps(places, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(places, ensure_ascii=False))
    except Exception as e:
        error_result = {
            "error": str(e),
            "content_length": len(content)
        }
        if pretty:
            print(json.dumps(error_result, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(error_result, ensure_ascii=False))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Test the Gemini AI client for extracting insights and geocoding."
    )
    parser.add_argument(
        "--text",
        type=str,
        help="Inline text to analyze.",
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Path to a text file to analyze.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON output.",
    )
    parser.add_argument(
        "--geocode",
        type=str,
        help="Geocode a specific place name.",
    )
    parser.add_argument(
        "--extract-places",
        action="store_true",
        help="Extract and geocode places from the input text.",
    )
    args = parser.parse_args()

    setup_django()

    # Import after Django is configured
    from insights.ai_service import AIInsightExtractor, InsightData

    # Handle geocoding commands
    if args.geocode:
        test_geocoding(args.geocode, args.pretty)
        sys.exit(0)
    
    if args.extract_places:
        text = load_input_text(args)
        test_extract_places(text, args.pretty)
        sys.exit(0)

    # Default: extract insights
    text = load_input_text(args)

    extractor = AIInsightExtractor()
    try:
        insights = extractor.extract_insights(text)
        payload = [
            {
                "text_snippet": ins.text_snippet,
                "category_name": ins.category_name,
                "category_type": ins.category_type,
                "sentiment_score": ins.sentiment_score,
                "confidence_score": ins.confidence_score,
                "start_position": ins.start_position,
                "end_position": ins.end_position,
            }
            for ins in insights
        ]
        if args.pretty:
            print(json.dumps(payload, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(payload, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

