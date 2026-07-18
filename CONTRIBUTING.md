# Contributing to Local AI CRM

Thank you for contributing to the local-first CRM and business forecasting platform.

## Before you start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- Search existing issues and agree on scope for major model or architecture changes.
- Never commit API keys, `.env` files, customer records, model weights, or generated datasets.
- Use synthetic or properly licensed data in examples and tests.

## Local setup

Requires Node.js 18+, Python 3.9+, and optionally an NVIDIA GPU.

```bash
git clone https://github.com/112-stack/local-ai-crm.git
cd local-ai-crm
npm install
npm run build
```

Backend dependencies are documented in `backend/requirements.txt`. UI-only changes should not require downloading large models.

## Pull requests

Keep model changes reproducible, document CPU/GPU expectations, and include tests or a deterministic validation procedure. Explain privacy and performance implications for changes that process applicant or CRM data.

Useful first contributions include lightweight test fixtures, CPU-only setup improvements, accessibility fixes, and clearer model-provider abstractions.
