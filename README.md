# Grammar Lessons - Writing Support Chatbot

A web-based chatbot application to help college students with grammar and writing questions in Standard Academic English.

## Features

- **Interactive Chatbot**: Pattern-matching chatbot with typo tolerance that answers grammar and writing questions
- **FAQ Index**: Quick access to commonly asked questions
- **Comprehensive Content**: 10+ topics covering commas, sentence fragments, active voice, thesis development, MLA formatting, and more
- **Resource Links**: Curated links to EFSC LibGuides, Purdue OWL, UNC Writing Center, and Guide to Grammar and Writing
- **Admin Interface**: Easy content management without coding
- **Warm, Inviting Design**: Earth-tone color scheme that's easy on the eyes
- **Mobile Responsive**: Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the application.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

Done! Vercel will give you a URL like `your-project.vercel.app`

### Option 2: GitHub Pages

The application is already configured for static export.

1. Build the static site:
   ```bash
   npm run build
   ```

2. The output is in the `out/` directory

3. Deploy to GitHub Pages:
   ```bash
   # Add GitHub Pages workflow (create .github/workflows/deploy.yml)
   # Or manually push the `out` folder to gh-pages branch
   ```

### Option 3: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build command: `npm run build`
6. Publish directory: `out`
7. Click "Deploy"

## Admin Interface

Access the admin interface at `/admin` to manage content:

- Edit welcome message and fallback message
- Add/edit/delete topics
- Modify keywords, explanations, and resources
- When done, click "Download Changes" and replace `/data/content.json` with the downloaded file

**Note**: The admin interface creates a downloadable JSON file. To persist changes, you need to replace the `data/content.json` file and commit it to your repository.

## Content Structure

Content is stored in `/data/content.json` with the following structure:

```json
{
  "welcomeMessage": "...",
  "topics": [
    {
      "id": "unique-id",
      "title": "Topic Title",
      "keywords": ["keyword1", "keyword2"],
      "summary": "Brief summary",
      "explanation": "Detailed explanation in Markdown",
      "culturalNote": "Optional note about dialects",
      "relatedTopics": ["other-topic-id"],
      "resources": [
        {
          "title": "Resource Title",
          "url": "https://...",
          "source": "EFSC LibGuides | Grammar Guide | Purdue OWL | UNC Writing Center",
          "description": "Optional description"
        }
      ]
    }
  ],
  "fallbackMessage": "..."
}
```

## Project Structure

```
grammarlessons/
├── app/
│   ├── admin/          # Admin interface
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── Chatbot.tsx     # Chat interface component
│   └── FAQIndex.tsx    # FAQ list component
├── data/
│   └── content.json    # All content (editable)
├── lib/
│   └── chatbot.ts      # Pattern matching engine
├── types/
│   └── content.ts      # TypeScript types
├── public/             # Static assets
└── README.md
```

## Customization

### Changing Colors

Edit `tailwind.config.ts` to modify the warm color palette:

```typescript
colors: {
  warm: {
    50: '#fdf8f6',
    // ... modify these values
  },
},
```

### Adding New Topics

Use the admin interface at `/admin` or manually edit `data/content.json`.

### Modifying the Chatbot Logic

Edit `lib/chatbot.ts` to adjust:
- Pattern matching sensitivity
- Typo tolerance threshold
- Keyword extraction logic

## Support

For questions or issues with this application, contact:
- Email: shorthille@easternflorida.edu

## License

This project is created for educational purposes at Eastern Florida State College.
