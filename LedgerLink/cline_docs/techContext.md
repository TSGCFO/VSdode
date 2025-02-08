# Technical Context

## Technology Stack

### Backend
- Django REST Framework
- PostgreSQL Database
- JWT Authentication
- Celery for async tasks
- WebSocket support
- OpenAPI/Swagger documentation

### Frontend
- React
- Material UI
- Material React Table
- React Router
- Vite build tool

## Development Setup
1. Django backend with modular app structure
2. React frontend with Material UI components
3. RESTful API architecture
4. WebSocket for real-time features

## Technical Constraints
1. Django Settings
   - No direct modifications to settings.py
   - Additional settings must be added separately

2. Models
   - No modifications to existing Django models
   - No field additions or removals
   - No alterations to model relationships

3. Frontend Requirements
   - Material UI components mandatory
   - Material React Table for list views
   - Rules app can use alternative UI libraries
   - All components must be responsive
   - All list views must display all model fields
   - Thorough component testing required

4. Security
   - No security/authentication implementation during development

5. Development Guidelines
   - Frontend components in frontend folder only
   - Backend logic must remain unaltered
   - Comprehensive testing required