# Topic Template

This document shows you exactly how to add new grammar topics to the website.

## Where to Add Topics

All topics are stored in `/data/topics.json`. This is a JSON file (basically a structured list) that contains all the grammar topics.

## Topic Structure

Each topic follows this exact structure. Copy this template and fill in your content:

```json
{
  "id": "unique-topic-id",
  "title": "Display Title of Topic",
  "category": "category-name",
  "description": "Brief one-sentence description for the topic card",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "content": "<p>Main explanation goes here. Use HTML paragraph tags.</p><p>Add more paragraphs as needed.</p>",
  "examples": [
    {
      "label": "Example Type",
      "text": "The example text goes here."
    },
    {
      "label": "Another Example",
      "text": "Another example text."
    }
  ],
  "resources": [
    {
      "title": "Resource Title",
      "url": "https://example.com/resource"
    },
    {
      "title": "Another Resource",
      "url": "https://example.com/another"
    }
  ],
  "quiz": {
    "questions": [
      {
        "type": "multiple-choice",
        "question": "Your question here?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "answer": "Option B",
        "explanation": "Explain why this answer is correct."
      }
    ]
  }
}
```

## Field Explanations

### Required Fields

- **id**: A unique identifier (use lowercase with hyphens, like "comma-usage" or "mla-citations")
- **title**: The display name shown to students
- **category**: Must be one of:
  - `sentence-basics`
  - `punctuation`
  - `academic-writing`
  - `mla-style`
  - `common-errors`
- **description**: Short description (1-2 sentences) for the topic card
- **keywords**: Array of search terms students might use to find this topic
- **content**: The main explanation (use HTML paragraph tags: `<p>...</p>`)

### Optional but Recommended Fields

- **examples**: Array of examples showing correct/incorrect usage
- **resources**: Array of external links (Purdue OWL, UNC, etc.)
- **quiz**: Interactive questions for the "Tutor Me!" feature

## Quiz Question Types

### 1. Multiple Choice

```json
{
  "type": "multiple-choice",
  "question": "What is the correct usage?",
  "options": [
    "First option",
    "Second option (correct)",
    "Third option",
    "Fourth option"
  ],
  "answer": "Second option (correct)",
  "explanation": "This is correct because..."
}
```

### 2. True/False

```json
{
  "type": "true-false",
  "question": "Is this statement true or false?",
  "answer": "True",
  "explanation": "This is true because..."
}
```

### 3. Identify Error

```json
{
  "type": "identify-error",
  "question": "Which sentence is correct?",
  "sentences": [
    "First sentence",
    "Second sentence (correct)",
    "Third sentence",
    "Fourth sentence"
  ],
  "correctIndex": 1,
  "explanation": "The second sentence (index 1) is correct because..."
}
```

**Note**: `correctIndex` starts at 0 (first sentence = 0, second = 1, third = 2, etc.)

### 4. Matching (More Advanced)

```json
{
  "type": "matching",
  "question": "Match each term with its definition:",
  "pairs": [
    {
      "term": "Term 1",
      "definition": "Definition of term 1"
    },
    {
      "term": "Term 2",
      "definition": "Definition of term 2"
    }
  ],
  "explanation": "Explanation of the matching exercise."
}
```

## Step-by-Step: Adding a New Topic

### Step 1: Open the topics.json file

Location: `/data/topics.json`

### Step 2: Find the end of the array

Scroll to the bottom. You'll see a closing bracket `]`. You need to add your topic BEFORE this bracket.

### Step 3: Add a comma after the last topic

After the last topic's closing `}`, add a comma if there isn't one already.

### Step 4: Paste your new topic

Copy the template above, fill it in with your content, and paste it in.

### Step 5: Check your JSON syntax

Common mistakes:
- Missing commas between items in arrays
- Missing quotes around strings
- Forgetting to escape quotes inside strings (use `\"` for quotes within text)
- Mismatched brackets `{}` or `[]`

**Pro tip**: Use a JSON validator online (search "JSON validator") to check your syntax before saving.

### Step 6: Test your changes

1. Open `index.html` in a web browser
2. Select a course
3. Navigate to your new topic
4. Make sure everything displays correctly

## Adding Keywords for the Question Analyzer

If you want students to be able to find your topic by asking questions, you need to add keywords to the question analyzer.

Location: `/js/question-analyzer.js`

Find the `keywordMappings` object and add entries like this:

```javascript
'your keyword': ['your-topic-id'],
'another keyword': ['your-topic-id', 'related-topic-id'],
```

For example:
```javascript
'comma': ['commas', 'comma-splices'],
'thesis': ['thesis-statement'],
```

## Recommended Resources for Content

When creating new topics, draw from these sources:

1. **Purdue OWL**: https://owl.purdue.edu/
   - Most comprehensive grammar and writing resource
   - Great for citations and MLA

2. **UNC Writing Center**: https://writingcenter.unc.edu/tips-and-tools/
   - Excellent handouts on all writing topics

3. **Guide to Grammar and Writing**: https://guidetogrammar.org/
   - Clear explanations with examples

4. **MLA Style Center**: https://style.mla.org/
   - Official MLA guidelines

5. **EFSC Library Research Guides**: [Your institution's guides]

6. **YouTube Resources**:
   - Grammar videos from educational channels
   - Schoolhouse Rock Grammar Rocks series

## Writing Tips

### Keep the Tone Natural

✅ **Good**: "Academic English is a specific dialect that anyone can learn and use effectively in appropriate settings."

❌ **Avoid**: "Standard Academic English is the only correct form of English and must be used in all formal contexts."

### Be Clear and Concise

- Use short sentences when possible
- Define technical terms
- Provide concrete examples
- Explain the "why" behind rules

### Focus on Common Student Issues

Prioritize topics based on what your students struggle with most:
- MLA citations
- Comma usage
- Run-ons and fragments
- Thesis statements
- Avoiding plagiarism

## Need Help?

If you're stuck or unsure about JSON syntax, common issues, or content creation, refer to the INSTRUCTOR_GUIDE.md for more detailed information and troubleshooting tips.
