import os
from typing import Dict, Any, Optional

class ConfigManager:
    """Manages application configuration and settings"""

    def __init__(self):
        self.settings = {
            'useLocalGPU': os.getenv('USE_LOCAL_GPU', 'true').lower() == 'true',
            'useOpenAI': os.getenv('USE_OPENAI', 'false').lower() == 'true',
            'openAIKey': os.getenv('OPENAI_API_KEY', ''),
            'modelType': os.getenv('MODEL_TYPE', 'local'),
            'cuda_device': os.getenv('CUDA_VISIBLE_DEVICES', '0')
        }

    def get_setting(self, key: str) -> Any:
        """Get a specific setting"""
        return self.settings.get(key)

    def get_all_settings(self) -> Dict[str, Any]:
        """Get all settings"""
        # Don't expose the full API key
        safe_settings = self.settings.copy()
        if safe_settings.get('openAIKey'):
            key = safe_settings['openAIKey']
            safe_settings['openAIKey'] = key[:7] + '...' if len(key) > 7 else ''
        return safe_settings

    def update_setting(self, key: str, value: Any):
        """Update a specific setting"""
        self.settings[key] = value

    def update_settings(self, settings: Dict[str, Any]):
        """Update multiple settings"""
        self.settings.update(settings)

    def should_use_gpu(self) -> bool:
        """Check if GPU should be used"""
        return self.settings.get('useLocalGPU', False)

    def should_use_openai(self) -> bool:
        """Check if OpenAI should be used"""
        return self.settings.get('useOpenAI', False)

    def get_openai_key(self) -> Optional[str]:
        """Get OpenAI API key"""
        return self.settings.get('openAIKey')

    def get_model_type(self) -> str:
        """Get model type (local, openai, hybrid)"""
        return self.settings.get('modelType', 'local')
