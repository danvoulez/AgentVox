# AgentVox: Advanced AI Assistant Platform

AgentVox is a sophisticated AI assistant platform that combines voice recognition, natural language processing, and memory evolution to provide a personalized and intelligent user experience.

## Key Features

- **Voice Command System**: Natural language voice interface for seamless interaction
- **Memory & Evolution**: AI that remembers past interactions and evolves over time
- **Dashboard Analytics**: Comprehensive insights into user interactions and system performance
- **Dark Theme UI**: Modern, eye-friendly interface designed for extended use
- **Legacy System Integration**: Import data from Kyte and other legacy systems
- **Secure Authentication**: Built with Supabase for robust user authentication
- **Comprehensive API**: Well-structured endpoints for people, products, sales, and more

## Architecture

The system is built with a modern tech stack:

- **Frontend**: Next.js with TypeScript and Chakra UI
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Voice Processing**: Advanced speech recognition and NLP

## Project Structure

```
/frontend           # Next.js frontend application
  /src
    /components     # Reusable UI components
    /contexts       # React contexts for state management
    /pages          # Next.js pages and API routes
    /styles         # Global styles
    /utils          # Utility functions

/server             # Dedicated server for complex operations
  /src
    /middleware     # Server middleware
    /routes         # Server routes

/supabase           # Supabase configuration and migrations
  /migrations       # Database migrations
```

## Getting Started

1. Clone the repository
2. Set up environment variables
3. Install dependencies: `npm install` in both frontend and server directories
4. Run the development server: `npm run dev`

## Deployment

The system is designed to be deployed to Vercel for the frontend and API routes, with Supabase handling the database and authentication.

---

© 2025 AgentVox - The next generation of AI assistants with memory retention and evolutionary learning.
