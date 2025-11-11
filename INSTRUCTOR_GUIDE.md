# Instructor Guide - Professor Shorthill's Grammar and Academic Writing Skills Hub

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [File Structure](#file-structure)
4. [Adding and Editing Content](#adding-and-editing-content)
5. [Firebase Setup (Optional)](#firebase-setup-optional)
6. [Deploying the Website](#deploying-the-website)
7. [Viewing Analytics](#viewing-analytics)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

This website provides interactive grammar instruction for writing students. It features:

- **Topic Index**: 22 grammar topics (expandable) organized by category
- **Ask a Question**: Students can type questions and get matched to relevant topics
- **Interactive Quizzes**: "Tutor Me!" feature with multiple question types
- **Grammar Detection**: When students ask questions, the system can identify grammar mistakes in their questions and offer resources
- **Course Tracking**: Students select their course (ENC1101, ENC1102, etc.) on entry
- **Analytics** (optional): Track which topics students access, questions asked, and quiz performance

### Design Philosophy

The site presents Standard Academic English (SAE) as one dialect among many—a learned skill that anyone can master and use in appropriate contexts. The tone is supportive and culturally sensitive without being preachy.

---

## Getting Started

### Prerequisites

To run this website, you need:
- A web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, Notepad++, or even Notepad)
- (Optional) A web server for deployment
- (Optional) A Firebase account for analytics

### Running Locally

1. Open `index.html` in your web browser
2. Select a course from the dropdown
3. Click "Enter Site"
4. Explore topics and features

That's it! No installation required.

---

## File Structure

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
│   └── topics.json         # All grammar topics and content
├── TOPIC_TEMPLATE.md       # Template for adding new topics
├── INSTRUCTOR_GUIDE.md     # This file
└── CLAUDE.md               # Project overview for AI assistance
```

### Key Files to Edit

- **`data/topics.json`**: Add or modify grammar topics here
- **`js/question-analyzer.js`**: Add keywords for question matching
- **`js/firebase-config.js`**: Configure Firebase (optional)
- **`css/styles.css`**: Modify appearance and styling

---

## Adding and Editing Content

### Adding a New Topic

See **TOPIC_TEMPLATE.md** for detailed instructions and a copy-paste template.

**Quick steps:**
1. Open `data/topics.json`
2. Add a comma after the last topic's closing `}`
3. Paste the template
4. Fill in your content
5. Save the file
6. Test in browser

### Editing an Existing Topic

1. Open `data/topics.json`
2. Find the topic by searching for its title
3. Edit the content, examples, resources, or quiz questions
4. Save the file
5. Refresh your browser to see changes

### Important JSON Rules

- **Strings must be in quotes**: `"title": "My Title"`
- **Separate items with commas**: `["item1", "item2", "item3"]`
- **No comma after last item**: `["item1", "item2"]` ✅  `["item1", "item2",]` ❌
- **Escape quotes inside strings**: Use `\"` for quotes within text
- **Match your brackets**: Every `{` needs a `}`, every `[` needs a `]`

**Tip**: Use an online JSON validator if you're getting errors:
- https://jsonlint.com/
- Copy and paste your JSON to check for syntax errors

### Adding Keywords for Question Matching

When students ask questions, the system matches keywords to topics.

**To add keywords:**

1. Open `js/question-analyzer.js`
2. Find the `keywordMappings` object (around line 90)
3. Add entries like this:

```javascript
'your keyword': ['topic-id-1', 'topic-id-2'],
'another keyword': ['topic-id-3'],
```

**Example:**
```javascript
'plagiarism': ['avoiding-plagiarism', 'citations'],
'works cited': ['mla-works-cited'],
```

---

## Firebase Setup (Optional)

Firebase provides free analytics to track:
- Which courses students are in
- Which topics are accessed most
- What questions students ask (keywords only, not full text)
- Quiz completion rates and scores

### Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name it (e.g., "Grammar Lessons")
4. Disable Google Analytics if you don't need it (simpler)
5. Click "Create Project"

### Step 2: Add a Web App

1. In your Firebase project, click the web icon (`</>`)
2. Register app (nickname: "Grammar Website")
3. **Don't** check "Set up Firebase Hosting" (unless you want to use it)
4. Copy the configuration code that appears

### Step 3: Add Configuration to Your Site

1. Open `js/firebase-config.js`
2. Find these lines (around line 6):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace with the configuration Firebase gave you
4. Save the file

### Step 4: Add Firebase SDK

In both `index.html` and `main.html`, add these lines before the closing `</body>` tag:

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

### Step 5: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Start in **Test Mode** (for now)
4. Choose a location close to you
5. Click "Enable"

### Step 6: Test

1. Open your website
2. Select a course and browse some topics
3. Go to Firebase Console → Firestore Database
4. You should see collections: `course_selections`, `topic_access`, etc.

---

## Deploying the Website

### Option 1: GitHub Pages (Free)

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload all your files
4. Go to Settings → Pages
5. Select branch: `main`, folder: `/root`
6. Your site will be at: `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free)

1. Go to https://www.netlify.com/
2. Sign up for free
3. Drag and drop your project folder
4. Your site is live! (Custom domain available)

### Option 3: Your Own Server

Upload all files to your web server via FTP or cPanel file manager. Make sure `index.html` is in the root directory or a subdirectory you want to use.

---

## Viewing Analytics

### Without Firebase

Without Firebase, you won't have analytics, but the site will work perfectly fine. This is ideal if you just want a simple resource for students without tracking.

### With Firebase

#### Firestore Database

Go to Firebase Console → Firestore Database to see:

- **course_selections**: Every time a student selects a course
- **topic_access**: Every topic view with timestamp
- **questions**: Keywords from questions asked
- **quiz_completions**: Quiz scores and completion rates

#### Viewing Data

You can:
1. Export data as JSON or CSV
2. Use Firebase queries to filter by course, date, etc.
3. Build a custom dashboard (more advanced)

#### Simple Query Examples

To see most accessed topics:
1. Go to Firestore → `topic_access` collection
2. Use the console to count entries by `topic_id`

To see quiz performance:
1. Go to `quiz_completions`
2. Check `percentage` field for scores

---

## Troubleshooting

### The website doesn't load or shows blank page

**Solution:**
- Open browser console (F12 or right-click → Inspect)
- Look for JavaScript errors
- Common issue: missing comma in `topics.json`
- Use JSON validator to check syntax

### Topics aren't showing up

**Solution:**
- Check `data/topics.json` for syntax errors
- Make sure the file is saved
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check console for errors

### Question matching isn't working

**Solution:**
- Add keywords to `js/question-analyzer.js`
- Make sure keywords match what students might type
- Check that topic IDs in keyword mappings match actual topic IDs in `topics.json`

### Firebase isn't tracking

**Solutions:**
1. Check that Firebase SDK scripts are loaded (view page source)
2. Verify `firebaseConfig` in `js/firebase-config.js` is correct
3. Open browser console—look for Firebase errors
4. Make sure Firestore is enabled in Firebase Console
5. Check Firestore security rules (test mode allows all writes)

### Quiz doesn't start

**Solution:**
- Make sure the topic has a `quiz` field in `topics.json`
- Check that quiz has `questions` array with at least one question
- Verify question structure matches one of the types (see TOPIC_TEMPLATE.md)

### Students can't submit questions

**Solution:**
- Check browser console for JavaScript errors
- Make sure `js/question-analyzer.js` is loaded
- Test with a simple question like "comma splice"

---

## Customization

### Changing Colors

Edit `css/styles.css`. The main blue color (`#2c5aa0`) appears throughout. Search and replace to change the theme color.

### Adding Course Codes

1. Open `index.html`
2. Find the `<select id="courseSelect">` dropdown
3. Add new `<option>` tags:

```html
<option value="NEWCOURSE">NEWCOURSE</option>
```

### Changing Categories

Current categories:
- Sentence Basics
- Punctuation & Mechanics
- Academic Writing
- MLA Style
- Common Errors

To add a category:
1. Add filter button in `main.html`
2. Add category name mapping in `js/app.js`
3. Update styles in `css/styles.css` if needed

---

## Best Practices

### Content Creation

1. **Test topics before publishing**: Add topic → Test in browser → Fix any issues
2. **Include varied examples**: Show correct AND incorrect usage
3. **Link to credible sources**: Purdue OWL, UNC Writing Center, MLA Style Center
4. **Write quizzes that teach**: Include explanations for correct answers
5. **Use natural language**: Avoid being preachy or overly formal

### Maintenance

1. **Backup regularly**: Keep a copy of `topics.json` before major changes
2. **Test after updates**: Always check that site works after editing
3. **Review analytics monthly**: See what students use most
4. **Update resources**: Check that external links still work

### Student Privacy

- The system does NOT store student names or identifiable information
- Questions are logged as keywords only (not full text)
- Session IDs are random and don't connect to individual students
- This is intentional to protect student privacy

---

## Getting Help

### If you get stuck:

1. Check this guide and TOPIC_TEMPLATE.md
2. Use online JSON validators for syntax issues
3. Check browser console for specific error messages
4. Search error messages online (Stack Overflow is helpful)

### For Future Development

If you need to add features or make changes beyond content updates, you may want to work with someone familiar with:
- HTML/CSS (for layout changes)
- JavaScript (for functionality changes)
- Firebase (for advanced analytics)

---

## Quick Reference Card

| Task | File to Edit | Section |
|------|--------------|---------|
| Add new topic | `data/topics.json` | Add before final `]` |
| Edit topic content | `data/topics.json` | Find by title |
| Add keywords | `js/question-analyzer.js` | `keywordMappings` |
| Change colors | `css/styles.css` | Search for `#2c5aa0` |
| Add course code | `index.html` | `<select id="courseSelect">` |
| Setup Firebase | `js/firebase-config.js` | Replace config |
| View analytics | Firebase Console | Firestore Database |

---

**Remember**: This site is designed to be simple and maintainable. Don't hesitate to make changes—you can always revert by keeping backups of your files!
