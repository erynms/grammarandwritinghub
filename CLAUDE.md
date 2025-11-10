# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**grammarlessons** - A Next.js web application providing grammar and writing support for college students. Features an interactive chatbot with pattern matching and typo tolerance, helping students with Standard Academic English questions.

**Tech Stack:**
- Next.js 16 (React 19) with TypeScript
- Tailwind CSS 4 (warm color palette)
- Static export for easy deployment
- Pattern-matching chatbot (no AI API needed)

**Target Audience:** First-year college writing students at Eastern Florida State College

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
├── layout.tsx          # Root layout with metadata
├── page.tsx            # Home page with chatbot and FAQ
├── admin/page.tsx      # Admin interface for content management
└── globals.css         # Global styles with Tailwind imports

components/
├── Chatbot.tsx         # Chat interface with message history
└── FAQIndex.tsx        # Clickable FAQ grid

data/
└── content.json        # ALL CONTENT - edit here or via /admin
                        # Contains topics, keywords, explanations, resources

lib/
└── chatbot.ts          # Pattern matching engine with:
                        # - Levenshtein distance for typo tolerance
                        # - Keyword extraction (removes stop words)
                        # - Fuzzy matching with scoring

types/
└── content.ts          # TypeScript interfaces for content structure
```

## Content Management

### Primary Method: Admin Interface
1. Navigate to `/admin` in browser
2. Select a topic or welcome message to edit
3. Make changes in the form
4. Click "Download Changes" button
5. Replace `data/content.json` with the downloaded file
6. Commit and push changes

### Alternative: Direct Editing
Edit `data/content.json` directly. Structure:
- `welcomeMessage`: Displayed at top of home page
- `topics[]`: Array of grammar topics
  - `id`: Unique identifier (used for related topics)
  - `title`: Topic name shown in UI
  - `keywords[]`: Words for pattern matching (include variations, common misspellings)
  - `summary`: Brief description (shown in FAQ index)
  - `explanation`: Full content in Markdown
  - `culturalNote`: Optional note about dialects/grapholects
  - `relatedTopics[]`: Array of related topic IDs
  - `resources[]`: Links to EFSC, Purdue OWL, UNC, Grammar Guide
- `fallbackMessage`: Shown when no topic matches

### Adding a New Topic
1. Use admin interface OR
2. Copy existing topic in `content.json`, update all fields
3. Ensure `id` is unique
4. Add comprehensive keywords (include plurals, variations, typos)
5. Link to related topics via IDs

## Chatbot Logic

**Pattern Matching Algorithm** (`lib/chatbot.ts`):
1. User input → normalize text → extract keywords (remove stop words)
2. Compare against all topic keywords using:
   - Exact match: +10 points
   - Fuzzy match (typo tolerance): +7 points
   - Partial match (substring): +3 points
3. Also check topic titles with similar scoring
4. Return best match if score ≥ 5, otherwise show fallback

**Typo Tolerance:**
- Uses Levenshtein distance
- Allows up to 2 character differences or 20% of word length
- Short words (< 3 chars) require exact match

**Tuning Sensitivity:**
- Adjust score thresholds in `findMatchingTopic()` function
- Modify `isSimilar()` threshold parameter (default: 2)
- Edit stop words list if needed

## Design System

**Color Palette** (warm, inviting):
- warm-50 to warm-900 (beige/brown scale)
- Defined in `tailwind.config.ts`
- Background: warm-50 gradient
- Headers: warm-800
- Buttons: warm-500/600
- Text: warm-900

**Key UI Patterns:**
- Cards with rounded corners and shadows
- Hover states on interactive elements
- Cultural notes displayed in warm-50 boxes with border
- Related topics as clickable pills
- Resources listed with source attribution in priority order

## Deployment

**Configured for static export** (`next.config.js` has `output: 'export'`)

**Deploy to Vercel:**
1. Push to GitHub
2. Import project in Vercel
3. Deploy (automatic)

**Deploy to Netlify:**
1. Build command: `npm run build`
2. Publish directory: `out`

**Deploy to GitHub Pages:**
1. Run `npm run build`
2. Deploy `out/` directory to gh-pages branch

## Important Notes

- Content is stored in JSON, not a database
- Admin changes must be manually applied (download → replace file → commit)
- Chatbot is pattern-based, not AI-powered (no API keys needed)
- Application is fully static after build (no server required)
- All external resource links should remain in priority order: EFSC → Grammar Guide → Purdue OWL → UNC
- Cultural sensitivity: Content acknowledges SAE as academic grapholect while respecting other dialects

## Common Tasks

**Add new grammar topic:**
1. Go to `/admin`
2. Click "+ Add" button
3. Fill in all fields
4. Download and replace `content.json`

**Change colors:**
Edit `warm` palette in `tailwind.config.ts`

**Modify welcome message:**
1. Go to `/admin`
2. Click "Welcome Message"
3. Edit and download

**Update external links:**
Edit `resources` arrays in `data/content.json` topics

**Adjust chatbot sensitivity:**
Modify scoring in `lib/chatbot.ts` `findMatchingTopic()` function
