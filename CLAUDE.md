# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**grammarlessons** - An interactive grammar instruction website for college writing students.

This is a client-side web application built with vanilla HTML, CSS, and JavaScript. It provides grammar lessons, interactive quizzes, and a question-answering system for students in composition courses (ENC1101, ENC1102, etc.).

### Key Features
- 22 grammar topics covering sentence basics, punctuation, and academic writing
- Interactive "Tutor Me!" quizzes with multiple question types
- Question analyzer that matches student questions to relevant topics
- Grammar pattern detection in student questions (teachable moments)
- Course tracking and optional Firebase analytics
- Culturally sensitive approach to teaching Standard Academic English

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Data Storage**: JSON file (`data/topics.json`)
- **Analytics** (optional): Firebase (Firestore + Analytics)
- **Deployment**: Static hosting (GitHub Pages, Netlify, or any web server)

## Getting Started

### Running Locally

No build process or dependencies required:

1. Open `index.html` in a web browser
2. Select a course from the dropdown
3. Navigate through topics and quizzes

### File Structure

```
grammarlessons/
├── index.html              # Landing page with course selection
├── main.html               # Main application interface
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── app.js              # Main application logic
│   ├── firebase-config.js  # Firebase analytics setup
│   ├── question-analyzer.js # Question matching and grammar detection
│   └── quiz-generator.js   # Quiz functionality
├── data/
│   └── topics.json         # All grammar topics (22 topics)
├── TOPIC_TEMPLATE.md       # Template for adding new topics
├── INSTRUCTOR_GUIDE.md     # Comprehensive instructor documentation
└── CLAUDE.md               # This file
```

## Development Commands

This is a static site with no build process:

- **Test locally**: Open `index.html` in browser
- **Edit content**: Modify `data/topics.json` (see TOPIC_TEMPLATE.md)
- **Edit styling**: Modify `css/styles.css`
- **Edit functionality**: Modify JS files in `js/` directory

## Architecture

### Data Flow

1. **Landing Page** (`index.html`):
   - Student selects course
   - Course stored in sessionStorage
   - Redirects to main.html

2. **Main Application** (`main.html`):
   - Loads topics from `data/topics.json`
   - Displays topic cards filtered by category/search
   - Handles question asking via `question-analyzer.js`
   - Manages quiz via `quiz-generator.js`

3. **Question Analyzer**:
   - Matches keywords from student questions to topics
   - Detects grammar patterns in questions
   - Provides resources for detected issues

4. **Quiz Generator**:
   - Dynamically creates quizzes from topic data
   - Supports multiple question types (multiple-choice, true/false, identify-error, matching)
   - Shuffles questions and answers
   - Provides immediate feedback

5. **Firebase** (optional):
   - Logs course selections, topic access, questions asked, and quiz completions
   - Data stored in Firestore collections
   - No personally identifiable information collected

### Key Conventions

- **Topic IDs**: Use lowercase with hyphens (e.g., `comma-splices`, `thesis-statement`)
- **Categories**: `sentence-basics`, `punctuation`, `academic-writing`, `mla-style`, `common-errors`
- **Content**: Use culturally sensitive language that presents SAE as one dialect among many
- **Resources**: Link to Purdue OWL, UNC Writing Center, Guide to Grammar, MLA, YouTube videos
- **Privacy**: Don't store student names or full question text

## Common Tasks

### Adding a New Grammar Topic

See `TOPIC_TEMPLATE.md` for detailed instructions.

Quick steps:
1. Edit `data/topics.json`
2. Add new topic object before closing `]`
3. Include: id, title, category, description, keywords, content, examples, resources, quiz
4. Add keywords to `js/question-analyzer.js` if needed
5. Test in browser

### Modifying Existing Content

1. Open `data/topics.json`
2. Find topic by title or id
3. Edit content, examples, resources, or quiz
4. Save and refresh browser

### Changing Styling

1. Edit `css/styles.css`
2. Main theme color: `#2c5aa0` (search and replace to change)
3. Responsive breakpoint: `768px`

### Setting up Firebase (optional)

See `INSTRUCTOR_GUIDE.md` for detailed Firebase setup instructions.

## Deployment

### Option 1: GitHub Pages
1. Push to GitHub repository
2. Enable Pages in Settings
3. Site available at `https://username.github.io/repo-name`

### Option 2: Netlify
1. Drag and drop folder to Netlify
2. Instant deployment

### Option 3: Traditional Web Hosting
- Upload all files via FTP/cPanel
- Ensure `index.html` is in the correct directory

## Notes for AI Assistance

- This is a static site—no backend, no npm, no build process
- Main content lives in `data/topics.json` (JSON format)
- When adding topics, follow the exact structure shown in existing topics
- Always validate JSON syntax before saving
- The site emphasizes cultural sensitivity: SAE is presented as a learned dialect, not as "correct" vs "incorrect" language
- Privacy is important: don't log personally identifiable information
- Students in dual-enrollment and ENC1101 courses are the primary audience

## Project Philosophy

This site teaches Standard Academic English as a **situationally appropriate dialect** that students can learn and use in academic contexts. The tone should be supportive and respectful of linguistic diversity, never suggesting that other language patterns are "wrong."
