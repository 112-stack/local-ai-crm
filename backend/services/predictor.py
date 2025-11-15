import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, Optional
import os
from openai import OpenAI

class SimplePredictor(nn.Module):
    """Simple neural network for business prediction"""
    def __init__(self, input_size=10, hidden_size=64):
        super(SimplePredictor, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc3 = nn.Linear(hidden_size // 2, 3)  # 3 classes: Low, Medium, High risk
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

class PredictorService:
    """Service for making business predictions using local GPU or OpenAI"""

    def __init__(self, config_manager):
        self.config_manager = config_manager
        self.device = self._get_device()
        self.gpu_available = torch.cuda.is_available()
        self.model = self._load_or_create_model()
        self.openai_client = None

    def _get_device(self):
        """Determine which device to use"""
        if torch.cuda.is_available() and self.config_manager.should_use_gpu():
            return torch.device('cuda')
        return torch.device('cpu')

    def _load_or_create_model(self):
        """Load existing model or create a new one"""
        model_path = 'models/business_predictor.pth'

        model = SimplePredictor().to(self.device)

        if os.path.exists(model_path):
            try:
                model.load_state_dict(torch.load(model_path, map_location=self.device))
                print(f"✓ Model loaded from {model_path}")
            except Exception as e:
                print(f"⚠ Could not load model: {e}. Creating new model...")
                self._auto_create_model(model_path, model)
        else:
            print("⚠ No saved model found. Creating new model...")
            self._auto_create_model(model_path, model)

        model.eval()
        return model

    def _auto_create_model(self, model_path, model):
        """Auto-create a model if it doesn't exist"""
        try:
            from services.model_downloader import ModelDownloader
            downloader = ModelDownloader()
            downloader.create_default_model('business_predictor.pth')
            print(f"✓ Model auto-created at {model_path}")
        except Exception as e:
            print(f"⚠ Could not auto-create model: {e}")
            print("  Using untrained model (predictions will be random until trained)")

    def reload_model(self):
        """Reload the model (useful when settings change)"""
        self.device = self._get_device()
        self.model = self._load_or_create_model()

    def _preprocess_data(self, data: Dict[str, Any]) -> torch.Tensor:
        """Convert applicant data to tensor"""
        # Extract numerical features
        features = []

        # Revenue (normalize to millions)
        revenue = float(data.get('revenue', 0) or 0) / 1_000_000
        features.append(min(revenue, 100))  # Cap at 100M

        # Employees
        employees = float(data.get('employees', 0) or 0)
        features.append(min(employees / 100, 10))  # Normalize

        # Budget (normalize to thousands)
        budget = float(data.get('budget', 0) or 0) / 1_000
        features.append(min(budget, 500))  # Cap at 500K

        # Event type encoding
        event_types = {'wedding': 1.0, 'corporate': 0.8, 'meeting': 0.5, 'conference': 0.7}
        event_type = data.get('event_type', '').lower()
        features.append(event_types.get(event_type, 0.5))

        # Industry encoding (simple hash-based)
        industry = data.get('industry', '')
        industry_value = (hash(industry) % 100) / 100 if industry else 0.5
        features.append(industry_value)

        # Add some random features to make it 10-dimensional
        features.extend([0.5, 0.5, 0.5, 0.5, 0.5])

        # Convert to tensor
        tensor = torch.tensor(features[:10], dtype=torch.float32).unsqueeze(0)
        return tensor.to(self.device)

    async def predict_with_local_model(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using local model"""
        # Preprocess data
        input_tensor = self._preprocess_data(data)

        # Get prediction
        with torch.no_grad():
            output = self.model(input_tensor)
            probabilities = torch.softmax(output, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item()

        # Map to risk levels
        risk_levels = ['Low', 'Medium', 'High']
        risk_level = risk_levels[predicted_class]

        # Generate recommendation
        if predicted_class == 0:  # Low risk
            recommendation = "Worth It - Low risk opportunity"
        elif predicted_class == 1:  # Medium risk
            recommendation = "Proceed with Caution - Moderate risk"
        else:  # High risk
            recommendation = "Not Recommended - High risk"

        return {
            'prediction': recommendation,
            'risk_level': risk_level,
            'confidence': confidence,
            'recommendation': recommendation,
            'model_used': 'local_gpu' if self.device.type == 'cuda' else 'local_cpu'
        }

    async def predict_with_openai(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using OpenAI"""
        try:
            # Initialize OpenAI client if needed
            api_key = self.config_manager.get_openai_key()
            if not api_key:
                raise Exception("OpenAI API key not configured")

            if not self.openai_client:
                self.openai_client = OpenAI(api_key=api_key)

            # Create prompt
            prompt = f"""You are a business risk analyst. Analyze the following business opportunity and provide a risk assessment.

Applicant Information:
- Name: {data.get('name', 'N/A')}
- Company: {data.get('company', 'N/A')}
- Industry: {data.get('industry', 'N/A')}
- Annual Revenue: ${data.get('revenue', 'N/A')}
- Employees: {data.get('employees', 'N/A')}
- Event Type: {data.get('event_type', 'N/A')}
- Budget: ${data.get('budget', 'N/A')}

Provide a JSON response with:
1. risk_level: "Low", "Medium", or "High"
2. recommendation: A brief recommendation
3. reasoning: Brief explanation of your assessment

Respond only with valid JSON."""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a business risk analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )

            # Parse response
            import json
            result = json.loads(response.choices[0].message.content)

            return {
                'prediction': result.get('recommendation', 'Analysis complete'),
                'risk_level': result.get('risk_level', 'Medium'),
                'confidence': 0.85,  # OpenAI doesn't provide confidence
                'recommendation': result.get('recommendation', 'See analysis'),
                'reasoning': result.get('reasoning', ''),
                'model_used': 'openai'
            }
        except Exception as e:
            raise Exception(f"OpenAI prediction failed: {str(e)}")

    async def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Main prediction method that routes to appropriate model"""
        model_type = self.config_manager.get_model_type()

        try:
            if model_type == 'openai' and self.config_manager.should_use_openai():
                return await self.predict_with_openai(data)
            elif model_type == 'hybrid':
                # Try local first, fallback to OpenAI
                try:
                    return await self.predict_with_local_model(data)
                except Exception as e:
                    print(f"Local prediction failed, trying OpenAI: {e}")
                    if self.config_manager.get_openai_key():
                        return await self.predict_with_openai(data)
                    raise e
            else:
                # Default to local
                return await self.predict_with_local_model(data)
        except Exception as e:
            # Fallback to simple rule-based prediction
            return self._fallback_prediction(data)

    def _fallback_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Simple rule-based fallback prediction"""
        budget = float(data.get('budget', 0) or 0)
        revenue = float(data.get('revenue', 0) or 0)

        # Simple risk calculation
        if revenue > 1_000_000 and budget > 10_000:
            risk_level = 'Low'
            recommendation = 'Worth It - Strong financial profile'
        elif revenue > 100_000 or budget > 5_000:
            risk_level = 'Medium'
            recommendation = 'Proceed with Caution - Moderate opportunity'
        else:
            risk_level = 'High'
            recommendation = 'Not Recommended - Limited financial capacity'

        return {
            'prediction': recommendation,
            'risk_level': risk_level,
            'confidence': 0.65,
            'recommendation': recommendation,
            'model_used': 'fallback'
        }
