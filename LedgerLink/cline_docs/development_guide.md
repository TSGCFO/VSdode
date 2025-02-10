# LedgerLink Development Guide

## Table of Contents
1. [Architectural Principles](#architectural-principles)
2. [Code Standards](#code-standards)
3. [Version Control](#version-control)
4. [Documentation Requirements](#documentation-requirements)
5. [Testing Protocols](#testing-protocols)
6. [Deployment Procedures](#deployment-procedures)
7. [Rules System](#rules-system)

For detailed information about the Rules System implementation, including API endpoints, frontend components, and error handling, see [Rules System Documentation](rules_system.md).

## Architectural Principles

### Backend Architecture
1. Django Application Structure
   - Maintain modular app separation
   - Follow Django REST Framework patterns
   - No modifications to settings.py
   - No alterations to existing models

2. API Design
   - RESTful endpoints following Django REST Framework conventions
   - Consistent serializer patterns
   - Clear endpoint naming conventions
   - Proper status code usage

3. Database
   - SQLite for development
   - PostgreSQL-compatible code for production
   - No direct model modifications
   - Use migrations for all database changes

### Frontend Architecture
1. React Component Structure
   - Material UI components mandatory
   - Material React Table for list views
   - Component-based architecture
   - Responsive design required

2. State Management
   - React hooks for local state
   - Consistent API client usage
   - Proper error handling
   - Loading state management

## Code Standards

### Backend Standards
1. Python Code Style
   - Follow PEP 8 guidelines
   - Use type hints where applicable
   - Clear function and variable naming
   - Comprehensive docstrings

2. Django Patterns
   - Service layer abstraction
   - Serializer-based validation
   - Custom manager methods
   - Proper exception handling

### Frontend Standards
1. React Code Style
   - Functional components with hooks
   - Props type validation
   - Clear component file structure
   - Consistent naming conventions

2. Component Guidelines
   - Material UI design system
   - Responsive breakpoints
   - Accessibility standards
   - Performance optimization

3. Rule Management Components
   - Rule Deletion:
     ```jsx
     // Confirmation Dialog Pattern
     <Dialog open={deleteConfirm.open} onClose={handleDeleteCancel}>
       <DialogTitle>Confirm Delete</DialogTitle>
       <DialogContent>
         <DialogContentText>
           Confirmation message
         </DialogContentText>
       </DialogContent>
       <DialogActions>
         <Button onClick={handleDeleteCancel}>Cancel</Button>
         <Button onClick={handleDeleteRule} color="error">
           Delete
         </Button>
       </DialogActions>
     </Dialog>
     ```
   - Features:
     - Confirmation dialog before deletion
     - Error handling with user feedback
     - Automatic UI updates after deletion
     - Loading state management
     - Comprehensive error logging

## Version Control

### Branch Management
1. Main Branches
   - main: production-ready code
   - develop: integration branch
   - feature/*: feature branches
   - bugfix/*: bug fix branches

2. Workflow
   - Branch from develop
   - Regular commits with clear messages
   - Pull request for all changes
   - Code review required

### Commit Standards
1. Message Format
   ```
   type(scope): description
   
   - type: feat|fix|docs|style|refactor|test|chore
   - scope: component or module affected
   - description: clear, concise change description
   ```

2. Pull Request Process
   - Clear description of changes
   - Link to related issues
   - Tests included
   - Documentation updated

## Documentation Requirements

### Code Documentation
1. Python Documentation
   - Module docstrings
   - Function documentation
   - Type hints
   - Implementation notes

2. React Documentation
   - Component props documentation
   - Usage examples
   - State management explanation
   - Key dependencies noted

### API Documentation
1. Endpoint Documentation
   - Clear endpoint descriptions
   - Request/response formats
   - Authentication requirements
   - Error responses

2. Rules API Endpoints
   - Rule Deletion:
     ```
     DELETE /rules/rule/{id}/delete/api/
     
     Response (Success):
     {
       "success": true,
       "message": "Rule deleted successfully",
       "group_id": number
     }

     Response (Error):
     {
       "error": "Error message"
     }
     
     Status Codes:
     - 200: Success
     - 404: Rule not found
     - 500: Server error
     ```
   - Features:
     - Handles both basic and advanced rules
     - Returns group_id for UI state updates
     - Includes comprehensive error logging
     - Supports cascade deletion

2. OpenAPI/Swagger
   - Keep documentation updated
   - Include example requests
   - Document all status codes
   - Note rate limits

## Testing Protocols

### Backend Testing
1. Unit Tests
   - Model tests
   - View tests
   - Serializer tests
   - Service layer tests

2. Integration Tests
   - API endpoint tests
   - Authentication tests
   - Database interaction tests
   - Async operation tests

### Frontend Testing
1. Component Testing
   - Render tests
   - User interaction tests
   - State management tests
   - Error handling tests

2. Integration Testing
   - API integration tests
   - Route testing
   - Form submission tests
   - Error boundary tests

## Deployment Procedures

### Development Environment
1. Setup
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python manage.py migrate
   ```

2. Frontend Setup
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Production Deployment
1. Preparation
   - Update dependencies
   - Run test suite
   - Check documentation
   - Verify migrations

2. Deployment Steps
   - Database backup
   - Code deployment
   - Static file collection
   - Service restart

### Monitoring
1. Application Monitoring
   - Error tracking
   - Performance metrics
   - User analytics
   - Server health

2. Maintenance
   - Regular backups
   - Security updates
   - Performance optimization
   - Documentation updates

## Constraints and Limitations

1. Django Settings
   - No direct modifications to settings.py
   - Add new settings in separate files

2. Model Changes
   - No modifications to existing models
   - No field additions or removals
   - No relationship alterations

3. Frontend Requirements
   - Material UI components mandatory
   - Material React Table for lists
   - All components must be responsive
   - Thorough testing required

4. Security
   - No security implementation during development
   - Prepare for future security integration

## Best Practices

1. Code Review
   - Required for all changes
   - Focus on maintainability
   - Check for test coverage
   - Verify documentation

2. Performance
   - Optimize database queries
   - Minimize API calls
   - Implement caching where appropriate
   - Monitor frontend bundle size

3. Accessibility
   - WCAG 2.1 compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast requirements

4. Error Handling
   - Consistent error messages
   - Proper error logging
   - User-friendly error displays
   - Recovery procedures