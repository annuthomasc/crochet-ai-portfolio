import anthropic
import base64
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Initialise the Anthropic client once at module level
# Why? Creating a client is expensive — reusing it is efficient
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def encode_image_to_base64(image_field):
    """
    Converts a Django ImageField to base64 string for Claude's vision API.
    Why base64? Claude's API accepts images as base64-encoded strings,
    not file paths or URLs in the multimodal input format.
    """
    try:
        image_field.open('rb')
        image_data = base64.standard_b64encode(image_field.read()).decode('utf-8')
        image_field.close()
        return image_data
    except Exception as e:
        logger.error(f"Failed to encode image: {e}")
        return None


def get_image_media_type(image_field):
    """
    Determines the media type from the image file name.
    Why needed? Claude requires you to specify the media type
    explicitly alongside the base64 data.
    """
    name = image_field.name.lower()
    if name.endswith('.png'):
        return 'image/png'
    elif name.endswith('.gif'):
        return 'image/gif'
    elif name.endswith('.webp'):
        return 'image/webp'
    return 'image/jpeg'  # default


def generate_pattern_from_project(project):
    """
    Core AI function — sends project photo + metadata to Claude
    and returns a structured crochet pattern.

    Why structured JSON response? We need to save the pattern to
    the database in specific fields. Asking Claude to respond in
    JSON means we can parse it directly without messy text parsing.
    """
    # Build the prompt — this is prompt engineering
    # Being specific and structured gets much better results
    system_prompt = """You are an expert crochet pattern designer with 20 years of experience.
You analyze photos of crochet projects and generate detailed, accurate patterns.
You always respond with valid JSON only — no markdown, no explanation outside the JSON.
Your patterns are clear, professional, and suitable for the stated difficulty level."""

    user_prompt = f"""Analyze this crochet project photo and generate a complete pattern.

Project details provided by the maker:
- Title: {project.title}
- Category: {project.category}
- Difficulty: {project.difficulty}
- Yarn brand: {project.yarn_brand or 'not specified'}
- Yarn weight: {project.yarn_weight or 'not specified'}
- Hook size: {project.hook_size or 'not specified'}
- Description: {project.description or 'not provided'}

Respond with ONLY this JSON structure, no other text:
{{
    "title": "pattern title",
    "description": "2-3 sentence pattern description",
    "difficulty": "beginner|intermediate|advanced",
    "yarn_weight": "detected or confirmed yarn weight",
    "hook_size": "recommended hook size",
    "gauge": "X sc x Y rows = 10cm square",
    "yarn_amount": "approximate yardage needed",
    "finished_size": "approximate finished dimensions",
    "sizes_available": ["one size"],
    "materials_list": [
        "Yarn name and amount",
        "Hook size",
        "Other materials"
    ],
    "abbreviations": {{
        "ch": "chain",
        "sc": "single crochet",
        "dc": "double crochet"
    }},
    "instructions": "Full written pattern with numbered rows/rounds. Be very detailed.",
    "notes": "Any special techniques, tips, or finishing instructions",
    "ai_confidence": 0.85,
    "chart_data": {{
        "construction": "rows|rounds",
        "rows": [
            {{
                "row": 0,
                "label": "Foundation",
                "stitches": ["ch", "ch", "ch"],
                "note": "optional note about this row"
            }},
            {{
                "row": 1,
                "label": "Row 1",
                "stitches": ["sc", "sc", "sc"],
                "note": ""
            }}
        ]
    }}
}}

IMPORTANT for chart_data:
- Include every row and round from the pattern
- Each stitch must be one of: ch, sc, hdc, dc, trc, sl_st, inc, dec, magic_ring
- For repeated rows (e.g. rows 2-10 are identical) include each row separately
- Maximum 30 stitches per row shown in chart (if row has more, show first 30)
- Maximum 20 rows in chart
- Use "inc" for increases (2 sc in same stitch)
- Use "dec" for decreases (sc2tog)
- This data will be used to render a visual stitch chart"""

    try:
        # Build message with image if available
        content = []

        if project.image:
            image_data      = encode_image_to_base64(project.image)
            image_media_type = get_image_media_type(project.image)

            if image_data:
                # Multimodal message — image + text together
                # Why this format? This is Claude's vision API structure
                content.append({
                    "type": "image",
                    "source": {
                        "type":       "base64",
                        "media_type": image_media_type,
                        "data":       image_data,
                    }
                })

        content.append({
            "type": "text",
            "text": user_prompt
        })

        logger.info(f"Sending pattern generation request for project: {project.title}")

        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 4000,
            system     = system_prompt,
            messages   = [{"role": "user", "content": content}]
        )

        # Extract the text response
        response_text = response.content[0].text

        # Parse JSON response
        # Why strip()? Sometimes there are leading/trailing whitespace characters
        pattern_data = json.loads(response_text.strip())

        logger.info(f"Pattern generated successfully for: {project.title}")
        return {
            "success": True,
            "data":    pattern_data,
            "prompt":  user_prompt,
            "model":   "claude-sonnet-4-20250514"
        }

    except json.JSONDecodeError as e:
        logger.error(f"Claude returned invalid JSON for {project.title}: {e}")
        return {"success": False, "error": "AI returned invalid format, please try again"}

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error for {project.title}: {e}")
        return {"success": False, "error": f"AI service error: {str(e)}"}

    except Exception as e:
        logger.error(f"Unexpected error generating pattern: {e}")
        return {"success": False, "error": "Unexpected error, please try again"}


def generate_colour_suggestions(project, pattern, mood=None):
    """
    Asks Claude to suggest yarn colour combinations for a pattern.

    Why separate from pattern generation? Colour suggestions are
    requested independently — a user might want multiple palettes
    for the same pattern (warm, cool, neutral etc.)
    """
    system_prompt = """You are a professional yarn colour consultant and crochet designer.
You suggest beautiful, harmonious colour combinations for crochet projects.
You always respond with valid JSON only — no markdown, no explanation outside the JSON."""

    mood_text = f"The desired mood/vibe is: {mood}." if mood else ""

    user_prompt = f"""Suggest 3 beautiful yarn colour combinations for this crochet project.

Project: {project.title}
Category: {project.category}
Pattern description: {pattern.description}
{mood_text}

Respond with ONLY this JSON structure:
{{
    "palettes": [
        {{
            "name": "palette name e.g. Autumn Harvest",
            "mood": "warm|cool|neutral|bold|pastel|earthy|monochrome",
            "colors": ["#hex1", "#hex2", "#hex3"],
            "color_names": ["Burnt Orange", "Golden Yellow", "Deep Brown"],
            "description": "One sentence about why this palette works"
        }},
        {{
            "name": "second palette name",
            "mood": "mood",
            "colors": ["#hex1", "#hex2", "#hex3"],
            "color_names": ["name1", "name2", "name3"],
            "description": "One sentence description"
        }},
        {{
            "name": "third palette name",
            "mood": "mood",
            "colors": ["#hex1", "#hex2", "#hex3"],
            "color_names": ["name1", "name2", "name3"],
            "description": "One sentence description"
        }}
    ]
}}"""

    try:
        content = []

        # Include project image if available for visual colour matching
        if project.image:
            image_data       = encode_image_to_base64(project.image)
            image_media_type = get_image_media_type(project.image)
            if image_data:
                content.append({
                    "type": "image",
                    "source": {
                        "type":       "base64",
                        "media_type": image_media_type,
                        "data":       image_data,
                    }
                })

        content.append({"type": "text", "text": user_prompt})

        logger.info(f"Generating colour suggestions for: {pattern.title}")

        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 1500,
            system     = system_prompt,
            messages   = [{"role": "user", "content": content}]
        )

        response_text  = response.content[0].text
        palettes_data  = json.loads(response_text.strip())

        logger.info(f"Colour suggestions generated for: {pattern.title}")
        return {
            "success": True,
            "data":    palettes_data
        }

    except json.JSONDecodeError as e:
        logger.error(f"Claude returned invalid JSON for colour suggestions: {e}")
        return {"success": False, "error": "AI returned invalid format"}

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error for colour suggestions: {e}")
        return {"success": False, "error": f"AI service error: {str(e)}"}

    except Exception as e:
        logger.error(f"Unexpected error generating colours: {e}")
        return {"success": False, "error": "Unexpected error"}


def detect_stitches(project):
    """
    Analyzes a project photo and identifies the crochet stitches used.
    Why useful? Helps beginners understand what they're looking at,
    and adds educational value to your portfolio — making it more
    than just a pretty photo gallery.
    """
    if not project.image:
        return {"success": False, "error": "No image available for stitch detection"}

    system_prompt = """You are an expert crochet stitch identifier with encyclopedic knowledge
of all crochet techniques. You analyze photos and identify stitches accurately.
You always respond with valid JSON only."""

    user_prompt = """Analyze this crochet project photo and identify the stitches used.

Respond with ONLY this JSON:
{
    "primary_stitch": "main stitch name",
    "stitches_detected": [
        {
            "name": "stitch name",
            "abbreviation": "sc",
            "confidence": 0.95,
            "description": "brief description of this stitch"
        }
    ],
    "construction_method": "worked in rows|worked in rounds|granny squares|motifs",
    "special_techniques": ["any special techniques observed"],
    "notes": "any additional observations about the construction"
}"""

    try:
        image_data       = encode_image_to_base64(project.image)
        image_media_type = get_image_media_type(project.image)

        if not image_data:
            return {"success": False, "error": "Could not process image"}

        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 1000,
            messages   = [{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type":       "base64",
                            "media_type": image_media_type,
                            "data":       image_data,
                        }
                    },
                    {"type": "text", "text": user_prompt}
                ]
            }]
        )

        response_text  = response.content[0].text
        stitch_data    = json.loads(response_text.strip())

        return {"success": True, "data": stitch_data}

    except Exception as e:
        logger.error(f"Stitch detection error: {e}")
        return {"success": False, "error": str(e)}