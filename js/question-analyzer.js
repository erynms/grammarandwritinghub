// Question Analyzer - Keyword matching and grammar pattern detection
import { topics } from './app.js';

// Common grammar patterns to detect in user questions
const grammarPatterns = {
    capitalization: {
        // Check for incorrect capitalization in common words
        pattern: /\b(mother|father|sister|brother|aunt|uncle|grandma|grandpa)\b(?=[^.]*[A-Z])/g,
        contextCheck: (match, fullText) => {
            // Check if the capitalized family word comes after punctuation (valid)
            const index = fullText.indexOf(match);
            if (index === 0 || /[.!?]\s+$/.test(fullText.substring(0, index))) {
                return false; // Valid capitalization at start of sentence
            }
            // Check if it's being used as a name (e.g., "I called Mother")
            const beforeWord = fullText.substring(Math.max(0, index - 10), index);
            if (/called|asked|told|with\s*$/i.test(beforeWord)) {
                return false; // Might be used as a name
            }
            return true; // Likely incorrect
        },
        note: 'Family terms like "mother," "father," "sister," etc. are common nouns and should only be capitalized at the start of a sentence or when used as a name in direct address.',
        resources: [
            {
                title: 'Purdue OWL: Capitalization',
                url: 'https://owl.purdue.edu/owl/general_writing/mechanics/help_with_capitals.html'
            },
            {
                title: 'UNC Writing Center: Capitalization',
                url: 'https://writingcenter.unc.edu/tips-and-tools/capitalization/'
            }
        ]
    },

    sentenceCapitalization: {
        pattern: /[.!?]\s+[a-z]/g,
        note: 'Remember to capitalize the first word after a period, exclamation point, or question mark.',
        resources: [
            {
                title: 'Guide to Grammar: Capitalization Rules',
                url: 'https://guidetogrammar.org/grammar/capitals.htm'
            }
        ]
    },

    punctuationSpacing: {
        pattern: /\s+[.,;:!?]|[.,;:!?](?=[A-Za-z])/g,
        note: 'Punctuation marks should be placed directly after words without a space before them, and should have a space after them.',
        resources: [
            {
                title: 'Purdue OWL: Punctuation',
                url: 'https://owl.purdue.edu/owl/general_writing/punctuation/index.html'
            }
        ]
    },

    itsIts: {
        pattern: /\b(its'|it's)\b/gi,
        contextCheck: (match, fullText) => {
            const lower = match.toLowerCase();
            const sentence = fullText.toLowerCase();

            if (lower === "its'") {
                return true; // Always wrong
            }

            // Check if it's is used possessively (incorrect)
            const index = sentence.indexOf(lower);
            const afterText = sentence.substring(index + lower.length, index + lower.length + 20);

            if (/^\s+\w+/i.test(afterText) && !/^(s\s|been|not|going|being)/i.test(afterText)) {
                // Might be possessive (incorrect use of it's)
                return true;
            }

            return false;
        },
        note: 'Remember: "it\'s" is a contraction for "it is" or "it has," while "its" is possessive. There is no such word as "its\'".',
        resources: [
            {
                title: 'Purdue OWL: It\'s vs. Its',
                url: 'https://owl.purdue.edu/owl/general_writing/mechanics/its_versus_its.html'
            },
            {
                title: 'Grammar Bytes: Its vs. It\'s',
                url: 'https://www.chompchomp.com/terms/contraction.htm'
            }
        ]
    },

    theirThereTheyre: {
        pattern: /\b(their|there|they're|theyre)\b/gi,
        contextCheck: (match, fullText) => {
            // This is complex - just flag it as something to be aware of
            return false; // Don't auto-detect errors, just provide resources
        },
        note: 'Make sure you\'re using the right form: "their" (possessive), "there" (location), or "they\'re" (they are).',
        resources: [
            {
                title: 'Purdue OWL: Common Writing Errors',
                url: 'https://owl.purdue.edu/owl/general_writing/mechanics/index.html'
            }
        ]
    },

    yourYoure: {
        pattern: /\b(your|you're|youre)\b/gi,
        contextCheck: (match, fullText) => {
            return false; // Don't auto-detect, provide resources
        },
        note: 'Double-check: "your" is possessive, while "you\'re" means "you are."',
        resources: [
            {
                title: 'Guide to Grammar: Your vs. You\'re',
                url: 'https://guidetogrammar.org/grammar/confusion.htm'
            }
        ]
    }
};

// Keyword mappings for topic matching
const keywordMappings = {
    'active voice': ['active-voice'],
    'passive voice': ['passive-voice', 'active-voice'],
    'voice': ['active-voice', 'passive-voice'],
    'thesis': ['thesis-statement'],
    'thesis statement': ['thesis-statement'],
    'topic sentence': ['topic-sentences'],
    'comma': ['commas', 'comma-splices'],
    'comma splice': ['comma-splices'],
    'semicolon': ['semicolons'],
    'colon': ['colons'],
    'apostrophe': ['apostrophes'],
    'possessive': ['apostrophes', 'possessives'],
    'citation': ['mla-in-text', 'mla-works-cited'],
    'cite': ['mla-in-text', 'mla-works-cited'],
    'mla': ['mla-in-text', 'mla-works-cited', 'mla-format'],
    'works cited': ['mla-works-cited'],
    'annotated bibliography': ['annotated-bibliography'],
    'fragment': ['sentence-fragments'],
    'run-on': ['run-on-sentences'],
    'run on': ['run-on-sentences'],
    'subject verb agreement': ['subject-verb-agreement'],
    'verb tense': ['verb-tenses'],
    'noun': ['nouns', 'parts-of-speech'],
    'verb': ['verbs', 'parts-of-speech'],
    'adjective': ['adjectives', 'parts-of-speech'],
    'adverb': ['adverbs', 'parts-of-speech'],
    'pronoun': ['pronouns', 'pronoun-agreement'],
    'preposition': ['prepositions', 'prepositional-phrases'],
    'prepositional phrase': ['prepositional-phrases'],
    'parts of speech': ['parts-of-speech'],
    'paragraph': ['paragraph-development', 'topic-sentences'],
    'transition': ['transitions'],
    'capitalization': ['capitalization'],
    'capital': ['capitalization'],
    'quotation': ['quotation-marks'],
    'quote': ['quotation-marks', 'mla-quotes'],
    'parallel structure': ['parallel-structure'],
    'modifier': ['modifiers', 'dangling-modifiers'],
    'dangling modifier': ['dangling-modifiers']
};

// Analyze a user's question
async function analyzeQuestion(questionText) {
    const analysis = {
        keywords: [],
        topics: [],
        grammarIssues: [],
        mainResponse: '',
        externalResources: []
    };

    // Extract keywords from question
    const words = questionText.toLowerCase();

    // Find matching topics based on keywords
    const foundTopicIds = new Set();

    for (const [keyword, topicIds] of Object.entries(keywordMappings)) {
        if (words.includes(keyword)) {
            analysis.keywords.push(keyword);
            topicIds.forEach(id => foundTopicIds.add(id));
        }
    }

    // Also check against topic keywords directly
    if (window.topics) {
        window.topics.forEach(topic => {
            if (topic.keywords) {
                topic.keywords.forEach(kw => {
                    if (words.includes(kw.toLowerCase())) {
                        foundTopicIds.add(topic.id);
                        if (!analysis.keywords.includes(kw.toLowerCase())) {
                            analysis.keywords.push(kw.toLowerCase());
                        }
                    }
                });
            }
        });
    }

    // Get topic objects
    if (window.topics) {
        analysis.topics = window.topics.filter(t => foundTopicIds.has(t.id));
    }

    // Generate main response
    if (analysis.topics.length > 0) {
        const topicTitles = analysis.topics.map(t => t.title).join(', ');
        analysis.mainResponse = `Based on your question, you might be interested in learning about: ${topicTitles}. Click on any topic below to learn more, or use the "Tutor Me!" button to practice.`;

        // Add external resources from first matched topic
        if (analysis.topics[0].resources) {
            analysis.externalResources = analysis.topics[0].resources;
        }
    }

    // Detect grammar issues in the question itself
    for (const [patternName, patternData] of Object.entries(grammarPatterns)) {
        const matches = questionText.match(patternData.pattern);

        if (matches && matches.length > 0) {
            let shouldFlag = true;

            // Use context checking if available
            if (patternData.contextCheck) {
                shouldFlag = matches.some(match =>
                    patternData.contextCheck(match, questionText)
                );
            }

            if (shouldFlag) {
                // Check if we've already added this issue
                const alreadyAdded = analysis.grammarIssues.some(
                    issue => issue.pattern === patternName
                );

                if (!alreadyAdded) {
                    analysis.grammarIssues.push({
                        pattern: patternName,
                        note: patternData.note,
                        resources: patternData.resources
                    });
                }
            }
        }
    }

    return analysis;
}

// Make function available globally
window.analyzeQuestion = analyzeQuestion;

export { analyzeQuestion, grammarPatterns, keywordMappings };
