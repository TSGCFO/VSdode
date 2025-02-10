# System Patterns

## Architecture Overview

### Backend Architecture
1. Modular Django Apps
   - ai_core: AI and ML functionality
   - api: Core API functionality and utilities
   - billing: Billing and payment processing
   - customer_services: Customer service management
   - customers: Customer data management
   - inserts: Data insertion handling
   - materials: Materials management
   - orders: Order processing
   - products: Product management
   - rules: Business rules engine
   - shipping: Shipping logistics

2. API Design
   - RESTful architecture
   - Serializer-based data transformation
   - JWT authentication
   - Custom middleware support
   - WebSocket integration

### Frontend Architecture
1. Component Structure
   - Material UI based components
   - Material React Table for list views
   - Responsive design patterns
   - Component-based architecture

2. State Management
   - React hooks for local state
   - API client utility for data fetching
   - Form validation patterns

## Key Technical Decisions
1. Database
   - SQLite for development (db.sqlite3)
   - PostgreSQL ready for production

2. Authentication
   - JWT-based authentication system
   - Deferred security implementation

3. API Documentation
   - OpenAPI/Swagger integration
   - Comprehensive endpoint documentation

4. Testing
   - Unit tests for Django apps
   - Component testing for frontend
   - Integration testing requirements

## Development Patterns
1. Code Organization
   - Modular app structure
   - Separation of concerns
   - DRY principle adherence

2. Frontend Patterns
    - Component reusability
    - Material UI design system
    - Responsive design implementation
    - API Response Handling:
      - Service layer for API interactions
      - Response unwrapping (data extraction)
      - Nested data transformation
      - Error handling standardization

3. Backend Patterns
    - Model-driven development
    - API-first approach
    - Service layer abstraction
    - Response Structure:
      - Success flag in responses
      - Data wrapper for payload
      - Nested serialization for related data
      - Consistent error format