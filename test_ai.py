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


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Test the Gemini AI client for extracting insights."
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
    args = parser.parse_args()

    setup_django()

    # Import after Django is configured
    from insights.ai_service import AIInsightExtractor, InsightData

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

