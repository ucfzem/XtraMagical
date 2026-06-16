import logging

logger = logging.getLogger(__name__)


async def analyze_image(image_url: str):
    try:
        from google.cloud import vision
        client = vision.ImageAnnotatorClient()
        image = vision.Image()
        image.source.image_uri = image_url

        label_response = client.label_detection(image=image)
        object_response = client.object_localization(image=image)
        color_response = client.image_properties(image=image)

        labels = [label.description for label in label_response.label_annotations]
        objects = [
            {"name": obj.name, "confidence": obj.score}
            for obj in object_response.localized_object_annotations
        ]
        colors = []
        if color_response.image_properties_annotation:
            for c in color_response.image_properties_annotation.dominant_colors.colors:
                colors.append({
                    "red": c.color.red,
                    "green": c.color.green,
                    "blue": c.color.blue,
                    "score": c.score,
                })
        text_response = client.text_detection(image=image)
        texts = [t.description for t in text_response.text_annotations]

        return labels, objects, colors, texts
    except ImportError:
        logger.warning("google-cloud-vision non installé, utilisation du mode mock")
        return _mock_analyze(image_url)


def _mock_analyze(image_url: str):
    labels = ["chaussure", "Nike", "Air Max", "basket", "mode", "sport"]
    objects = [{"name": "Shoe", "confidence": 0.95}]
    colors = [{"red": 220, "green": 50, "blue": 50, "score": 0.6}]
    texts = ["NIKE", "AIR MAX"]
    return labels, objects, colors, texts


async def normalize_labels_with_llm(labels: list, objects: list, colors: list):
    brand = ""
    model = ""
    color_name = "inconnue"
    context = "produit"

    nike_kw = ["nike", "air max", "jordan"]
    adidas_kw = ["adidas", "ultraboost"]
    for label in labels:
        label_lower = label.lower()
        if any(kw in label_lower for kw in nike_kw):
            brand = "Nike"
            if "air max" in label_lower:
                model = "Air Max"
            break
        elif any(kw in label_lower for kw in adidas_kw):
            brand = "Adidas"
            break

    if colors:
        avg = colors[0]
        r, g, b = avg["red"], avg["green"], avg["blue"]
        if r > 200 and g < 100 and b < 100:
            color_name = "rouge"
        elif g > 200 and r < 100:
            color_name = "vert"
        elif b > 200:
            color_name = "bleu"
        elif r > 200 and g > 200:
            color_name = "jaune"
        elif r < 80 and g < 80 and b < 80:
            color_name = "noir"
        elif r > 200 and g > 150 and b < 100:
            color_name = "orange"

    return {
        "brand": brand,
        "model": model,
        "color": color_name,
        "context": context,
    }
