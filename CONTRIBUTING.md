# Contributing to React CRM Business Predictor

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork
3. Run the installation script: `./install.sh` (Linux/Mac) or `install.bat` (Windows)
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Project Structure

```
.
├── src/                    # React frontend
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── store/            # State management
├── backend/              # Python backend
│   ├── services/        # Business logic
│   ├── models/          # ML models
│   └── app.py           # FastAPI application
└── public/              # Static assets
```

## Coding Standards

### Frontend (React/JavaScript)
- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

### Backend (Python)
- Follow PEP 8 style guide
- Use type hints where applicable
- Add docstrings to functions and classes
- Keep functions focused on single responsibility
- Handle errors gracefully

## Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Update documentation if needed
4. Commit with clear, descriptive messages
5. Push to your fork
6. Create a pull request

## Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
cd backend
pytest
```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the version numbers following [SemVer](http://semver.org/)
3. The PR will be merged once you have the sign-off of a maintainer

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Questions?

Feel free to open an issue for any questions or concerns.
