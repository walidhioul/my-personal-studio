

## Plan: Generate Project Architecture PDF

### What
Create a comprehensive PDF document explaining the full frontend architecture, including:
- Project structure overview
- API layer (client, endpoints, response format)
- React Query hooks layer (caching, stale time, deduplication)
- Auth context and token management
- Type system (TypeScript interfaces)
- Data flow diagram (ASCII)
- Page-to-hook-to-API mapping
- Backend optimization recommendations (eager loading, caching, CORS)
- Laravel expected JSON response format

### How
1. Write a Python script using `reportlab` to generate a professional, well-structured PDF
2. Include sections: Overview, Architecture Diagram, API Client, API Functions, Hooks, Auth Context, Types, Pages, Backend Requirements
3. Output to `/mnt/documents/project_architecture.pdf`
4. QA by converting to images and inspecting

### Technical Details
- Use reportlab's Platypus for multi-page document with headings, code blocks, and tables
- Color-coded sections for readability
- ASCII data flow diagram embedded as monospace text

