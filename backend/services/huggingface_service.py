"""
Hugging Face Model Service
Provides easy access to downloaded Hugging Face models
"""

from typing import Dict, List, Any, Optional
from pathlib import Path
import json


class HuggingFaceService:
    """Service for using pre-trained Hugging Face models"""

    def __init__(self, models_dir='models'):
        self.models_dir = Path(models_dir)
        self.cache_dir = self.models_dir / 'transformers_cache'
        self.manifest_file = self.models_dir / 'manifest.json'
        self.pipelines = {}
        self._load_manifest()

    def _load_manifest(self):
        """Load the models manifest"""
        if self.manifest_file.exists():
            with open(self.manifest_file, 'r') as f:
                self.manifest = json.load(f)
        else:
            self.manifest = {}

    def _get_pipeline(self, model_key: str):
        """Get or create a pipeline for the specified model"""
        # Check if pipeline already exists
        if model_key in self.pipelines:
            return self.pipelines[model_key]

        # Check if model is downloaded
        manifest_key = f'hf_{model_key}'
        if manifest_key not in self.manifest:
            raise Exception(f"Model '{model_key}' not found. Run model_downloader to download it.")

        model_info = self.manifest[manifest_key]
        if model_info.get('status') != 'downloaded':
            raise Exception(f"Model '{model_key}' not properly downloaded")

        try:
            from transformers import pipeline

            # Create pipeline
            model_name = model_info['model_name']
            task = model_info['task']

            pipe = pipeline(
                task,
                model=model_name,
                cache_dir=str(self.cache_dir)
            )

            # Cache the pipeline
            self.pipelines[model_key] = pipe
            return pipe

        except ImportError:
            raise Exception("transformers library not installed")
        except Exception as e:
            raise Exception(f"Failed to load model '{model_key}': {e}")

    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of text

        Args:
            text: Text to analyze

        Returns:
            Dict with sentiment label and score
        """
        try:
            pipe = self._get_pipeline('sentiment')
            result = pipe(text)[0]
            return {
                'sentiment': result['label'],
                'confidence': result['score'],
                'model': 'distilbert-sst2'
            }
        except Exception as e:
            return {
                'error': str(e),
                'sentiment': 'unknown',
                'confidence': 0.0
            }

    def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """
        Detect emotions in text

        Args:
            text: Text to analyze

        Returns:
            Dict with emotion label and score
        """
        try:
            pipe = self._get_pipeline('emotion')
            result = pipe(text)[0]
            return {
                'emotion': result['label'],
                'confidence': result['score'],
                'model': 'emotion-distilroberta'
            }
        except Exception as e:
            return {
                'error': str(e),
                'emotion': 'unknown',
                'confidence': 0.0
            }

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract named entities from text

        Args:
            text: Text to analyze

        Returns:
            List of entities with type and confidence
        """
        try:
            pipe = self._get_pipeline('ner')
            results = pipe(text)

            # Group consecutive tokens
            entities = []
            current_entity = None

            for item in results:
                entity_type = item['entity'].replace('B-', '').replace('I-', '')

                if item['entity'].startswith('B-'):
                    # Start new entity
                    if current_entity:
                        entities.append(current_entity)

                    current_entity = {
                        'text': item['word'],
                        'type': entity_type,
                        'confidence': item['score'],
                        'start': item['start'],
                        'end': item['end']
                    }
                elif item['entity'].startswith('I-') and current_entity:
                    # Continue current entity
                    if current_entity['type'] == entity_type:
                        # Handle subword tokens (##word)
                        if item['word'].startswith('##'):
                            current_entity['text'] += item['word'][2:]
                        else:
                            current_entity['text'] += ' ' + item['word']
                        current_entity['end'] = item['end']
                        current_entity['confidence'] = (current_entity['confidence'] + item['score']) / 2

            # Add last entity
            if current_entity:
                entities.append(current_entity)

            return entities

        except Exception as e:
            return [{'error': str(e)}]

    def analyze_financial_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of financial text (earnings calls, news, etc.)

        Args:
            text: Financial text to analyze

        Returns:
            Dict with sentiment (positive, negative, neutral) and confidence
        """
        try:
            pipe = self._get_pipeline('financial-sentiment')
            result = pipe(text)[0]
            return {
                'sentiment': result['label'],
                'confidence': result['score'],
                'model': 'finbert'
            }
        except Exception as e:
            return {
                'error': str(e),
                'sentiment': 'neutral',
                'confidence': 0.0
            }

    def answer_question(self, question: str, context: str) -> Dict[str, Any]:
        """
        Answer a question based on context

        Args:
            question: Question to answer
            context: Context containing the answer

        Returns:
            Dict with answer and confidence
        """
        try:
            pipe = self._get_pipeline('qa')
            result = pipe(question=question, context=context)
            return {
                'answer': result['answer'],
                'confidence': result['score'],
                'start': result['start'],
                'end': result['end'],
                'model': 'distilbert-squad'
            }
        except Exception as e:
            return {
                'error': str(e),
                'answer': 'Unable to answer',
                'confidence': 0.0
            }

    def classify_zero_shot(self, text: str, candidate_labels: List[str]) -> Dict[str, Any]:
        """
        Classify text without training (zero-shot classification)

        Args:
            text: Text to classify
            candidate_labels: List of possible labels

        Returns:
            Dict with labels and scores
        """
        try:
            pipe = self._get_pipeline('zero-shot')
            result = pipe(text, candidate_labels=candidate_labels)
            return {
                'labels': result['labels'],
                'scores': result['scores'],
                'top_label': result['labels'][0],
                'top_score': result['scores'][0],
                'model': 'bart-mnli'
            }
        except Exception as e:
            return {
                'error': str(e),
                'labels': [],
                'scores': []
            }

    def summarize_text(self, text: str, max_length: int = 130, min_length: int = 30) -> Dict[str, Any]:
        """
        Summarize long text

        Args:
            text: Text to summarize
            max_length: Maximum length of summary
            min_length: Minimum length of summary

        Returns:
            Dict with summary
        """
        try:
            pipe = self._get_pipeline('summarization')
            result = pipe(text, max_length=max_length, min_length=min_length)[0]
            return {
                'summary': result['summary_text'],
                'model': 'bart-large-cnn'
            }
        except Exception as e:
            return {
                'error': str(e),
                'summary': ''
            }

    def generate_text(self, prompt: str, max_length: int = 100) -> Dict[str, Any]:
        """
        Generate text continuation

        Args:
            prompt: Starting text
            max_length: Maximum length of generated text

        Returns:
            Dict with generated text
        """
        try:
            pipe = self._get_pipeline('text-generation')
            result = pipe(prompt, max_length=max_length)[0]
            return {
                'generated_text': result['generated_text'],
                'model': 'distilgpt2'
            }
        except Exception as e:
            return {
                'error': str(e),
                'generated_text': ''
            }

    def analyze_applicant_text(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive text analysis for business applicants
        Combines sentiment, emotion, and entity extraction

        Args:
            text: Text to analyze (e.g., applicant description, comments)

        Returns:
            Dict with comprehensive analysis
        """
        analysis = {}

        # Basic sentiment
        sentiment = self.analyze_sentiment(text)
        analysis['sentiment'] = sentiment

        # Emotion detection
        emotion = self.analyze_emotion(text)
        analysis['emotion'] = emotion

        # Extract entities
        entities = self.extract_entities(text)
        analysis['entities'] = entities

        # Financial sentiment if text seems financial
        financial_keywords = ['revenue', 'profit', 'loss', 'earnings', 'investment', 'budget']
        if any(keyword in text.lower() for keyword in financial_keywords):
            financial_sentiment = self.analyze_financial_sentiment(text)
            analysis['financial_sentiment'] = financial_sentiment

        return analysis

    def list_available_models(self) -> List[Dict[str, Any]]:
        """List all downloaded Hugging Face models"""
        available = []

        for key, info in self.manifest.items():
            if key.startswith('hf_') and info.get('status') == 'downloaded':
                available.append({
                    'key': info.get('model_key', key),
                    'name': info.get('model_name'),
                    'task': info.get('task'),
                    'description': info.get('description'),
                    'downloaded_at': info.get('created_at')
                })

        return available


# Example usage
if __name__ == '__main__':
    service = HuggingFaceService()

    print("Available Hugging Face Models:")
    models = service.list_available_models()
    for model in models:
        print(f"  - {model['key']}: {model['description']}")

    # Example: Analyze sentiment
    text = "This is a great opportunity for our business!"
    result = service.analyze_sentiment(text)
    print(f"\nSentiment Analysis: {result}")
