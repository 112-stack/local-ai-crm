# Hugging Face Models Integration

This document explains how to use the pre-trained Hugging Face models integrated into the CRM Business Predictor application.

## Overview

The application now supports multiple pre-trained models from Hugging Face for various NLP tasks:

- **Sentiment Analysis**: Detect positive/negative sentiment in text
- **Emotion Detection**: Identify emotions (joy, sadness, anger, fear, etc.)
- **Named Entity Recognition (NER)**: Extract person, organization, location entities
- **Question Answering**: Answer questions based on context
- **Financial Sentiment**: Specialized sentiment analysis for financial text
- **Text Summarization**: Summarize long documents
- **Zero-Shot Classification**: Classify text without training
- **Text Generation**: Generate text continuations

## Installation

All required dependencies are already in `requirements.txt`:

```bash
pip install -r backend/requirements.txt
```

## Downloading Models

### Quick Start: Download Recommended Models

Download the most useful models for business applications:

```bash
cd backend
python -m services.model_downloader download-recommended
```

This downloads:
- Sentiment analysis (~250MB)
- Emotion detection (~310MB)
- Named Entity Recognition (~420MB)
- Financial sentiment (~440MB)

### Download All Models

Download all available models (excluding large ones):

```bash
python -m services.model_downloader download-all-hf
```

To include large models (>1GB):

```bash
python -m services.model_downloader download-all-hf --include-large
```

### Download Specific Models

List available models:

```bash
python -m services.model_downloader list-hf
```

Download a specific model:

```bash
python -m services.model_downloader download-hf sentiment
python -m services.model_downloader download-hf ner
python -m services.model_downloader download-hf financial-sentiment
```

### Available Models

| Model Key | Description | Task | Size |
|-----------|-------------|------|------|
| `sentiment` | Sentiment analysis (positive/negative) | text-classification | ~250MB |
| `emotion` | Emotion detection (joy, sadness, anger, fear, etc.) | text-classification | ~310MB |
| `ner` | Named Entity Recognition | token-classification | ~420MB |
| `qa` | Question Answering | question-answering | ~260MB |
| `financial-sentiment` | Financial sentiment analysis | text-classification | ~440MB |
| `text-generation` | Text generation (GPT-2 small) | text-generation | ~350MB |
| `summarization` | Text summarization | summarization | ~1.6GB |
| `zero-shot` | Zero-shot classification | zero-shot-classification | ~1.6GB |

## Usage

### Using the HuggingFaceService

```python
from services.huggingface_service import HuggingFaceService

# Initialize service
hf_service = HuggingFaceService()

# Sentiment Analysis
text = "This is a great business opportunity!"
result = hf_service.analyze_sentiment(text)
print(result)
# {'sentiment': 'POSITIVE', 'confidence': 0.9998, 'model': 'distilbert-sst2'}

# Emotion Detection
result = hf_service.analyze_emotion("I'm so excited about this project!")
print(result)
# {'emotion': 'joy', 'confidence': 0.95, 'model': 'emotion-distilroberta'}

# Named Entity Recognition
text = "Apple Inc. is located in Cupertino, California."
entities = hf_service.extract_entities(text)
print(entities)
# [{'text': 'Apple Inc.', 'type': 'ORG', 'confidence': 0.99}, ...]

# Financial Sentiment
text = "The company reported strong Q3 earnings with revenue up 15%."
result = hf_service.analyze_financial_sentiment(text)
print(result)
# {'sentiment': 'positive', 'confidence': 0.92, 'model': 'finbert'}

# Question Answering
question = "What is the company's revenue?"
context = "The company's annual revenue is $50 million."
result = hf_service.answer_question(question, context)
print(result)
# {'answer': '$50 million', 'confidence': 0.95}

# Comprehensive Analysis
text = "Our company has seen tremendous growth with revenue increasing by 25%."
analysis = hf_service.analyze_applicant_text(text)
print(analysis)
# Returns sentiment, emotion, entities, and financial sentiment
```

### Integration with Existing Code

The HuggingFace models can be integrated with the existing predictor service:

```python
from services.huggingface_service import HuggingFaceService
from services.predictor import PredictorService

hf_service = HuggingFaceService()

# Analyze applicant description
applicant_text = applicant_data.get('description', '')
if applicant_text:
    text_analysis = hf_service.analyze_applicant_text(applicant_text)

    # Use sentiment in risk calculation
    if text_analysis['sentiment']['sentiment'] == 'NEGATIVE':
        risk_score += 10

    # Check for concerning emotions
    if text_analysis['emotion']['emotion'] in ['anger', 'fear', 'sadness']:
        risk_score += 5
```

## API Endpoints

You can create new API endpoints to expose the Hugging Face models:

```python
# In backend/app.py

@app.post("/api/analyze-text")
async def analyze_text(request: dict):
    """Analyze text using Hugging Face models"""
    text = request.get('text', '')
    analysis_type = request.get('type', 'comprehensive')

    hf_service = HuggingFaceService()

    if analysis_type == 'sentiment':
        return hf_service.analyze_sentiment(text)
    elif analysis_type == 'emotion':
        return hf_service.analyze_emotion(text)
    elif analysis_type == 'entities':
        return {'entities': hf_service.extract_entities(text)}
    elif analysis_type == 'comprehensive':
        return hf_service.analyze_applicant_text(text)
    else:
        raise HTTPException(status_code=400, detail="Invalid analysis type")
```

## Command Line Interface

### Model Management Commands

```bash
# Setup all models (PyTorch + recommended HF models)
python -m services.model_downloader setup

# List downloaded models
python -m services.model_downloader list

# List available Hugging Face models
python -m services.model_downloader list-hf

# Download specific model
python -m services.model_downloader download-hf <model_key>

# Download all models
python -m services.model_downloader download-all-hf

# Download recommended models
python -m services.model_downloader download-recommended

# Clean up old models
python -m services.model_downloader cleanup
```

## Model Storage

Models are stored in the `models/` directory:

```
models/
├── business_predictor.pth          # PyTorch model
├── transformers_cache/              # Hugging Face models cache
│   ├── models--distilbert-base-uncased-finetuned-sst-2-english/
│   ├── models--j-hartmann--emotion-english-distilroberta-base/
│   ├── models--dslim--bert-base-NER/
│   └── ...
└── manifest.json                    # Model metadata
```

## Performance Considerations

### Model Loading

Models are loaded on first use and cached in memory. Subsequent calls to the same model are much faster.

### Memory Usage

- Small models (250-500MB): Minimal memory footprint
- Large models (>1GB): May require 4-8GB RAM when loaded
- Consider downloading only the models you need

### Offline Operation

Once downloaded, all models work completely offline. No internet connection is required.

## Troubleshooting

### Models Not Found

If you get "Model not found" errors:

```bash
# Check which models are downloaded
python -m services.model_downloader list

# Download missing models
python -m services.model_downloader download-recommended
```

### Out of Memory

If you run out of memory:

1. Download only essential models
2. Avoid loading multiple large models simultaneously
3. Use smaller model variants (e.g., `distilbert` instead of `bert-large`)

### Slow First Run

The first time you use a model, it needs to be loaded from disk, which can take a few seconds. Subsequent uses are cached and much faster.

## Examples

### Example 1: Analyze Customer Feedback

```python
from services.huggingface_service import HuggingFaceService

hf = HuggingFaceService()

feedback = """
We had an amazing experience! The team was professional and
delivered exactly what we needed. Highly recommend!
"""

analysis = hf.analyze_applicant_text(feedback)
print(f"Sentiment: {analysis['sentiment']['sentiment']}")
print(f"Emotion: {analysis['emotion']['emotion']}")
```

### Example 2: Extract Business Information

```python
text = """
TechCorp Inc., located in San Francisco, California, has announced
Q4 revenue of $100 million. CEO John Smith stated the company
expects continued growth.
"""

entities = hf.extract_entities(text)
for entity in entities:
    print(f"{entity['text']} ({entity['type']})")

# Output:
# TechCorp Inc. (ORG)
# San Francisco (LOC)
# California (LOC)
# John Smith (PER)
```

### Example 3: Financial News Analysis

```python
news = "Company reported Q3 earnings beat expectations with revenue up 20%"
sentiment = hf.analyze_financial_sentiment(news)
print(f"Financial Sentiment: {sentiment['sentiment']}")
print(f"Confidence: {sentiment['confidence']:.2%}")
```

## Best Practices

1. **Download models during setup**: Don't download during production
2. **Cache pipelines**: The `HuggingFaceService` automatically caches loaded models
3. **Error handling**: Always handle cases where models aren't downloaded
4. **Choose appropriate models**: Use smaller models for real-time analysis
5. **Monitor memory**: Large models consume significant RAM

## Further Reading

- [Hugging Face Models Hub](https://huggingface.co/models)
- [Transformers Documentation](https://huggingface.co/docs/transformers)
- [Model Performance Benchmarks](https://huggingface.co/spaces/huggingface/model-leaderboard)
