from typing import Dict, Any, List
import numpy as np

class RiskAnalyzer:
    """Analyzes business risk based on multiple factors"""

    def __init__(self):
        self.risk_factors = {
            'financial': 0.35,
            'operational': 0.25,
            'market': 0.20,
            'timing': 0.20
        }

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive risk analysis"""

        # Calculate individual risk scores
        financial_risk = self._analyze_financial_risk(data)
        operational_risk = self._analyze_operational_risk(data)
        market_risk = self._analyze_market_risk(data)
        timing_risk = self._analyze_timing_risk(data)

        # Calculate weighted overall risk
        overall_risk = (
            financial_risk * self.risk_factors['financial'] +
            operational_risk * self.risk_factors['operational'] +
            market_risk * self.risk_factors['market'] +
            timing_risk * self.risk_factors['timing']
        )

        # Determine risk level
        if overall_risk < 0.3:
            risk_level = 'Low'
            recommendation = 'Worth It - Strong opportunity with minimal risk'
        elif overall_risk < 0.6:
            risk_level = 'Medium'
            recommendation = 'Proceed with Caution - Moderate risk factors present'
        else:
            risk_level = 'High'
            recommendation = 'Not Recommended - Significant risk factors identified'

        # Generate detailed analysis
        risk_breakdown = {
            'financial': {
                'score': financial_risk,
                'level': self._get_risk_level_name(financial_risk)
            },
            'operational': {
                'score': operational_risk,
                'level': self._get_risk_level_name(operational_risk)
            },
            'market': {
                'score': market_risk,
                'level': self._get_risk_level_name(market_risk)
            },
            'timing': {
                'score': timing_risk,
                'level': self._get_risk_level_name(timing_risk)
            }
        }

        return {
            'risk_level': risk_level,
            'overall_score': overall_risk,
            'recommendation': recommendation,
            'risk_breakdown': risk_breakdown,
            'confidence': 0.8,
            'key_factors': self._identify_key_factors(data, risk_breakdown)
        }

    def _analyze_financial_risk(self, data: Dict[str, Any]) -> float:
        """Analyze financial risk factors"""
        risk = 0.5  # Default medium risk

        revenue = float(data.get('revenue', 0) or 0)
        budget = float(data.get('budget', 0) or 0)
        employees = float(data.get('employees', 0) or 0)

        # Strong revenue reduces risk
        if revenue > 5_000_000:
            risk -= 0.3
        elif revenue > 1_000_000:
            risk -= 0.2
        elif revenue > 100_000:
            risk -= 0.1
        elif revenue < 50_000:
            risk += 0.2

        # Budget alignment
        if revenue > 0 and budget > 0:
            budget_ratio = budget / revenue
            if 0.01 <= budget_ratio <= 0.1:  # Reasonable budget ratio
                risk -= 0.1
            elif budget_ratio > 0.2:  # Too high budget ratio
                risk += 0.15

        # Company size
        if employees > 50:
            risk -= 0.1
        elif employees > 10:
            risk -= 0.05

        return max(0.0, min(1.0, risk))

    def _analyze_operational_risk(self, data: Dict[str, Any]) -> float:
        """Analyze operational risk factors"""
        risk = 0.5

        company = data.get('company', '')
        industry = data.get('industry', '')
        event_type = data.get('event_type', '')

        # Established company
        if company:
            risk -= 0.15

        # Known industry
        high_risk_industries = ['startup', 'crypto', 'gambling']
        low_risk_industries = ['healthcare', 'education', 'government', 'finance']

        industry_lower = industry.lower() if industry else ''
        if any(ind in industry_lower for ind in low_risk_industries):
            risk -= 0.2
        elif any(ind in industry_lower for ind in high_risk_industries):
            risk += 0.2

        # Event type complexity
        complex_events = ['wedding', 'conference']
        if event_type in complex_events:
            risk += 0.1

        return max(0.0, min(1.0, risk))

    def _analyze_market_risk(self, data: Dict[str, Any]) -> float:
        """Analyze market and competitive risk"""
        risk = 0.5

        industry = data.get('industry', '')

        # Industry saturation (simplified)
        saturated_industries = ['restaurant', 'retail', 'consulting']
        growing_industries = ['technology', 'healthcare', 'renewable', 'ai']

        industry_lower = industry.lower() if industry else ''
        if any(ind in industry_lower for ind in growing_industries):
            risk -= 0.2
        elif any(ind in industry_lower for ind in saturated_industries):
            risk += 0.15

        return max(0.0, min(1.0, risk))

    def _analyze_timing_risk(self, data: Dict[str, Any]) -> float:
        """Analyze timing and scheduling risk"""
        risk = 0.3  # Generally lower risk factor

        date = data.get('date', '')
        event_type = data.get('event_type', '')

        # Check if date is provided
        if not date:
            risk += 0.2

        # Wedding events have higher timing sensitivity
        if event_type == 'wedding':
            risk += 0.1

        return max(0.0, min(1.0, risk))

    def _get_risk_level_name(self, score: float) -> str:
        """Convert risk score to level name"""
        if score < 0.3:
            return 'Low'
        elif score < 0.6:
            return 'Medium'
        else:
            return 'High'

    def _identify_key_factors(self, data: Dict[str, Any], risk_breakdown: Dict) -> List[str]:
        """Identify key risk factors to highlight"""
        factors = []

        revenue = float(data.get('revenue', 0) or 0)
        budget = float(data.get('budget', 0) or 0)

        if revenue > 1_000_000:
            factors.append('Strong financial position')
        elif revenue < 100_000:
            factors.append('Limited revenue base')

        if budget > 50_000:
            factors.append('Significant budget allocation')

        # Highest risk category
        max_risk = max(risk_breakdown.items(), key=lambda x: x[1]['score'])
        if max_risk[1]['score'] > 0.6:
            factors.append(f'High {max_risk[0]} risk')

        # Lowest risk category
        min_risk = min(risk_breakdown.items(), key=lambda x: x[1]['score'])
        if min_risk[1]['score'] < 0.3:
            factors.append(f'Low {min_risk[0]} risk')

        return factors if factors else ['Standard risk profile']
