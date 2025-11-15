"""
Enhanced Predictor Service
Uses pre-trained transformer models for high-accuracy business predictions
Optimized for RTX 4090 GPU
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, Optional, List
from pathlib import Path
import os


class EnhancedPredictorService:
    """
    Enhanced predictor using transformer models for business risk assessment
    Optimized for RTX 4090 with 24GB VRAM
    """

    def __init__(self, config_manager, models_dir='models'):
        self.config_manager = config_manager
        self.models_dir = Path(models_dir)
        self.device = self._get_device()
        self.gpu_available = torch.cuda.is_available()

        # Initialize models lazily (load on first use)
        self._sentiment_pipeline = None
        self._financial_sentiment_pipeline = None
        self._zero_shot_pipeline = None
        self._sentence_transformer = None
        self._ner_pipeline = None

        print(f"✓ Enhanced Predictor initialized on {self.device}")
        if self.gpu_available:
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
            print(f"  GPU: {gpu_name} ({gpu_memory:.1f}GB VRAM)")

    def _get_device(self):
        """Determine which device to use"""
        if torch.cuda.is_available() and self.config_manager.should_use_gpu():
            return torch.device('cuda')
        return torch.device('cpu')

    def _get_sentiment_pipeline(self):
        """Load sentiment analysis pipeline"""
        if self._sentiment_pipeline is None:
            try:
                from transformers import pipeline
                cache_dir = str(self.models_dir / 'transformers_cache')

                self._sentiment_pipeline = pipeline(
                    "text-classification",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    cache_dir=cache_dir,
                    device=0 if self.gpu_available else -1
                )
                print("✓ Sentiment model loaded")
            except Exception as e:
                print(f"⚠ Could not load sentiment model: {e}")
                self._sentiment_pipeline = None

        return self._sentiment_pipeline

    def _get_financial_sentiment_pipeline(self):
        """Load financial sentiment analysis pipeline"""
        if self._financial_sentiment_pipeline is None:
            try:
                from transformers import pipeline
                cache_dir = str(self.models_dir / 'transformers_cache')

                # Try FinBERT first, fallback to finbert-tone
                try:
                    self._financial_sentiment_pipeline = pipeline(
                        "text-classification",
                        model="ProsusAI/finbert",
                        cache_dir=cache_dir,
                        device=0 if self.gpu_available else -1
                    )
                    print("✓ FinBERT model loaded")
                except:
                    self._financial_sentiment_pipeline = pipeline(
                        "text-classification",
                        model="yiyanghkust/finbert-tone",
                        cache_dir=cache_dir,
                        device=0 if self.gpu_available else -1
                    )
                    print("✓ FinBERT-tone model loaded")

            except Exception as e:
                print(f"⚠ Could not load financial sentiment model: {e}")
                self._financial_sentiment_pipeline = None

        return self._financial_sentiment_pipeline

    def _get_zero_shot_pipeline(self):
        """Load zero-shot classification pipeline"""
        if self._zero_shot_pipeline is None:
            try:
                from transformers import pipeline
                cache_dir = str(self.models_dir / 'transformers_cache')

                self._zero_shot_pipeline = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    cache_dir=cache_dir,
                    device=0 if self.gpu_available else -1
                )
                print("✓ Zero-shot classification model loaded")
            except Exception as e:
                print(f"⚠ Could not load zero-shot model: {e}")
                self._zero_shot_pipeline = None

        return self._zero_shot_pipeline

    def _get_sentence_transformer(self):
        """Load sentence transformer for embeddings"""
        if self._sentence_transformer is None:
            try:
                from sentence_transformers import SentenceTransformer
                cache_dir = str(self.models_dir / 'transformers_cache')

                self._sentence_transformer = SentenceTransformer(
                    'sentence-transformers/all-mpnet-base-v2',
                    cache_folder=cache_dir,
                    device=str(self.device)
                )
                print("✓ Sentence transformer loaded")
            except Exception as e:
                print(f"⚠ Could not load sentence transformer: {e}")
                self._sentence_transformer = None

        return self._sentence_transformer

    def _get_ner_pipeline(self):
        """Load NER pipeline"""
        if self._ner_pipeline is None:
            try:
                from transformers import pipeline
                cache_dir = str(self.models_dir / 'transformers_cache')

                self._ner_pipeline = pipeline(
                    "ner",
                    model="dslim/bert-base-NER",
                    cache_dir=cache_dir,
                    device=0 if self.gpu_available else -1,
                    aggregation_strategy="simple"
                )
                print("✓ NER model loaded")
            except Exception as e:
                print(f"⚠ Could not load NER model: {e}")
                self._ner_pipeline = None

        return self._ner_pipeline

    def _extract_text_features(self, data: Dict[str, Any]) -> str:
        """Extract and combine text features from applicant data"""
        text_parts = []

        # Company and industry info
        if data.get('company'):
            text_parts.append(f"Company: {data['company']}")
        if data.get('industry'):
            text_parts.append(f"Industry: {data['industry']}")

        # Event details
        if data.get('event_type'):
            text_parts.append(f"Event type: {data['event_type']}")

        # Financial info
        revenue = data.get('revenue', 0)
        if revenue:
            text_parts.append(f"Annual revenue: ${revenue}")

        budget = data.get('budget', 0)
        if budget:
            text_parts.append(f"Budget: ${budget}")

        employees = data.get('employees', 0)
        if employees:
            text_parts.append(f"Employees: {employees}")

        return ". ".join(text_parts) if text_parts else "No information provided"

    def _analyze_with_transformers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive analysis using transformer models"""
        text = self._extract_text_features(data)
        results = {}

        # 1. General sentiment analysis
        sentiment_pipe = self._get_sentiment_pipeline()
        if sentiment_pipe:
            try:
                sentiment_result = sentiment_pipe(text[:512])[0]  # Limit text length
                results['sentiment'] = {
                    'label': sentiment_result['label'],
                    'score': sentiment_result['score']
                }
            except Exception as e:
                print(f"Sentiment analysis failed: {e}")
                results['sentiment'] = {'label': 'NEUTRAL', 'score': 0.5}

        # 2. Financial sentiment analysis
        financial_pipe = self._get_financial_sentiment_pipeline()
        if financial_pipe:
            try:
                financial_result = financial_pipe(text[:512])[0]
                results['financial_sentiment'] = {
                    'label': financial_result['label'],
                    'score': financial_result['score']
                }
            except Exception as e:
                print(f"Financial sentiment analysis failed: {e}")
                results['financial_sentiment'] = {'label': 'neutral', 'score': 0.5}

        # 3. Zero-shot risk classification
        zero_shot_pipe = self._get_zero_shot_pipeline()
        if zero_shot_pipe:
            try:
                risk_labels = ['low risk', 'medium risk', 'high risk', 'excellent opportunity']
                zero_shot_result = zero_shot_pipe(
                    text[:512],
                    candidate_labels=risk_labels,
                    multi_label=False
                )
                results['zero_shot_risk'] = {
                    'label': zero_shot_result['labels'][0],
                    'score': zero_shot_result['scores'][0],
                    'all_scores': dict(zip(zero_shot_result['labels'], zero_shot_result['scores']))
                }
            except Exception as e:
                print(f"Zero-shot classification failed: {e}")
                results['zero_shot_risk'] = {'label': 'medium risk', 'score': 0.5}

        # 4. Extract entities (companies, people, locations)
        ner_pipe = self._get_ner_pipeline()
        if ner_pipe:
            try:
                entities = ner_pipe(text[:512])
                results['entities'] = entities
            except Exception as e:
                print(f"NER failed: {e}")
                results['entities'] = []

        return results

    def _calculate_numerical_score(self, data: Dict[str, Any]) -> float:
        """Calculate numerical risk score from business metrics"""
        score = 50  # Base score (neutral)

        # Revenue impact (+/- 20 points)
        revenue = float(data.get('revenue', 0) or 0)
        if revenue > 10_000_000:
            score += 20
        elif revenue > 1_000_000:
            score += 15
        elif revenue > 100_000:
            score += 10
        elif revenue > 10_000:
            score += 5
        else:
            score -= 10

        # Employee count (+/- 15 points)
        employees = float(data.get('employees', 0) or 0)
        if employees > 500:
            score += 15
        elif employees > 100:
            score += 10
        elif employees > 10:
            score += 5
        elif employees > 0:
            score += 2
        else:
            score -= 5

        # Budget (+/- 15 points)
        budget = float(data.get('budget', 0) or 0)
        if budget > 100_000:
            score += 15
        elif budget > 50_000:
            score += 10
        elif budget > 10_000:
            score += 5
        elif budget > 1_000:
            score += 2
        else:
            score -= 5

        # Ensure score is between 0 and 100
        return max(0, min(100, score))

    def _combine_predictions(self, transformer_results: Dict[str, Any], numerical_score: float, data: Dict[str, Any]) -> Dict[str, Any]:
        """Combine transformer and numerical predictions into final assessment"""

        # Start with numerical score
        final_score = numerical_score

        # Adjust based on sentiment (up to +/- 15 points)
        if 'sentiment' in transformer_results:
            sentiment = transformer_results['sentiment']
            if sentiment['label'] == 'POSITIVE':
                final_score += sentiment['score'] * 15
            else:
                final_score -= sentiment['score'] * 15

        # Adjust based on financial sentiment (up to +/- 20 points)
        if 'financial_sentiment' in transformer_results:
            fin_sent = transformer_results['financial_sentiment']
            label = fin_sent['label'].lower()
            if 'positive' in label or 'bullish' in label:
                final_score += fin_sent['score'] * 20
            elif 'negative' in label or 'bearish' in label:
                final_score -= fin_sent['score'] * 20

        # Ensure final score is between 0 and 100
        final_score = max(0, min(100, final_score))

        # Determine risk level
        if final_score >= 75:
            risk_level = 'Low'
            recommendation = 'Worth It - Strong opportunity'
        elif final_score >= 60:
            risk_level = 'Low-Medium'
            recommendation = 'Good Opportunity - Proceed with standard due diligence'
        elif final_score >= 45:
            risk_level = 'Medium'
            recommendation = 'Proceed with Caution - Requires careful evaluation'
        elif final_score >= 30:
            risk_level = 'Medium-High'
            recommendation = 'Risky - Thorough investigation required'
        else:
            risk_level = 'High'
            recommendation = 'Not Recommended - Significant concerns identified'

        # Build detailed analysis
        analysis = {
            'prediction': recommendation,
            'risk_level': risk_level,
            'confidence': min(final_score / 100, 1.0),
            'score': round(final_score, 2),
            'recommendation': recommendation,
            'model_used': 'enhanced_transformer',
            'device': str(self.device),
            'analysis': {
                'numerical_score': round(numerical_score, 2),
                'transformer_insights': transformer_results,
                'factors': self._generate_risk_factors(data, final_score, transformer_results)
            }
        }

        return analysis

    def _generate_risk_factors(self, data: Dict[str, Any], score: float, transformer_results: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate human-readable risk factors"""
        positive_factors = []
        negative_factors = []

        # Financial factors
        revenue = float(data.get('revenue', 0) or 0)
        if revenue > 1_000_000:
            positive_factors.append(f"Strong revenue: ${revenue:,.0f}")
        elif revenue < 50_000:
            negative_factors.append(f"Limited revenue: ${revenue:,.0f}")

        budget = float(data.get('budget', 0) or 0)
        if budget > 50_000:
            positive_factors.append(f"Substantial budget: ${budget:,.0f}")
        elif budget < 5_000:
            negative_factors.append(f"Limited budget: ${budget:,.0f}")

        employees = float(data.get('employees', 0) or 0)
        if employees > 100:
            positive_factors.append(f"Large organization: {employees} employees")
        elif employees < 5:
            negative_factors.append(f"Small team: {employees} employees")

        # Sentiment factors
        if 'sentiment' in transformer_results:
            sent = transformer_results['sentiment']
            if sent['label'] == 'POSITIVE' and sent['score'] > 0.8:
                positive_factors.append(f"Positive sentiment detected (confidence: {sent['score']:.1%})")
            elif sent['label'] == 'NEGATIVE' and sent['score'] > 0.8:
                negative_factors.append(f"Negative sentiment detected (confidence: {sent['score']:.1%})")

        # Financial sentiment factors
        if 'financial_sentiment' in transformer_results:
            fin_sent = transformer_results['financial_sentiment']
            label = fin_sent['label'].lower()
            if ('positive' in label or 'bullish' in label) and fin_sent['score'] > 0.7:
                positive_factors.append(f"Positive financial outlook ({fin_sent['score']:.1%} confidence)")
            elif ('negative' in label or 'bearish' in label) and fin_sent['score'] > 0.7:
                negative_factors.append(f"Negative financial indicators ({fin_sent['score']:.1%} confidence)")

        return {
            'positive': positive_factors,
            'negative': negative_factors
        }

    async def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Main prediction method using enhanced transformer models"""
        try:
            # Check if we should use transformers
            if not self.gpu_available and not self.config_manager.should_use_gpu():
                return self._fallback_prediction(data)

            # Analyze with transformers
            transformer_results = self._analyze_with_transformers(data)

            # Calculate numerical score
            numerical_score = self._calculate_numerical_score(data)

            # Combine predictions
            final_prediction = self._combine_predictions(
                transformer_results,
                numerical_score,
                data
            )

            return final_prediction

        except Exception as e:
            print(f"Enhanced prediction failed: {e}")
            import traceback
            traceback.print_exc()
            return self._fallback_prediction(data)

    def _fallback_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Simple rule-based fallback prediction"""
        score = self._calculate_numerical_score(data)

        if score >= 70:
            risk_level = 'Low'
            recommendation = 'Worth It - Good opportunity'
        elif score >= 50:
            risk_level = 'Medium'
            recommendation = 'Proceed with Caution'
        else:
            risk_level = 'High'
            recommendation = 'Not Recommended'

        return {
            'prediction': recommendation,
            'risk_level': risk_level,
            'confidence': score / 100,
            'score': round(score, 2),
            'recommendation': recommendation,
            'model_used': 'fallback_rule_based',
            'device': 'cpu'
        }
