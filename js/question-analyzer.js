// Question Analyzer - Keyword matching and grammar pattern detection
import { topics } from './app.js';

// Fuzzy string matching - calculates similarity between two strings
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[len1][len2];
}

// Check if two words are similar enough (handles typos)
function isSimilar(word1, word2, threshold = 2) {
    word1 = word1.toLowerCase();
    word2 = word2.toLowerCase();

    // Exact match
    if (word1 === word2) return true;

    // One word contains the other
    if (word1.includes(word2) || word2.includes(word1)) return true;

    // Fuzzy match for typos
    const distance = levenshteinDistance(word1, word2);
    const maxLen = Math.max(word1.length, word2.length);

    // Allow up to 2 character differences, or 25% of the word length for longer words
    return distance <= Math.min(threshold, Math.ceil(maxLen * 0.25));
}

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

// Expanded keyword mappings for topic matching (with variations, typos, common phrasings)
const keywordMappings = {
    // Active/Passive Voice
    'active voice': ['active-voice'],
    'passive voice': ['passive-voice', 'active-voice'],
    'voice': ['active-voice', 'passive-voice'],
    'activ': ['active-voice'],
    'passiv': ['passive-voice'],
    'active': ['active-voice'],
    'passive': ['passive-voice'],

    // Thesis Statements
    'thesis': ['thesis-statement'],
    'thesis statement': ['thesis-statement'],
    'theses': ['thesis-statement'],
    'main argument': ['thesis-statement'],
    'main idea': ['thesis-statement', 'topic-sentences'],
    'central claim': ['thesis-statement'],
    'argument': ['thesis-statement'],

    // Topic Sentences
    'topic sentence': ['topic-sentences'],
    'topic sentance': ['topic-sentences'],
    'opening sentence': ['topic-sentences'],
    'first sentence': ['topic-sentences'],
    'paragraph start': ['topic-sentences', 'paragraph-development'],

    // Commas
    'comma': ['commas', 'comma-splices'],
    'commas': ['commas', 'comma-splices'],
    'comma splice': ['comma-splices'],
    'comma error': ['commas', 'comma-splices'],
    'comma usage': ['commas'],
    'comma rule': ['commas'],
    'comma placement': ['commas'],
    'where do commas go': ['commas'],
    'when to use comma': ['commas'],
    'joining sentences': ['comma-splices', 'run-on-sentences'],

    // Semicolons
    'semicolon': ['semicolons'],
    'semi colon': ['semicolons'],
    'semi-colon': ['semicolons'],
    'semicolen': ['semicolons'],
    ';': ['semicolons'],

    // Colons
    'colon': ['colons'],
    'colen': ['colons'],
    ':': ['colons'],
    'list': ['colons'],

    // Apostrophes
    'apostrophe': ['apostrophes'],
    'apostrophy': ['apostrophes'],
    'apostraphes': ['apostrophes'],
    'possessive': ['apostrophes', 'its-vs-its'],
    'ownership': ['apostrophes'],
    'contraction': ['apostrophes', 'its-vs-its'],

    // Citations
    'citation': ['mla-in-text', 'mla-works-cited'],
    'cite': ['mla-in-text', 'mla-works-cited'],
    'citing': ['mla-in-text', 'mla-works-cited'],
    'source': ['mla-in-text', 'mla-works-cited'],
    'mla': ['mla-in-text', 'mla-works-cited'],
    'works cited': ['mla-works-cited'],
    'work cited': ['mla-works-cited'],
    'bibliography': ['mla-works-cited'],
    'reference': ['mla-works-cited'],
    'references': ['mla-works-cited'],
    'in-text': ['mla-in-text'],
    'in text': ['mla-in-text'],
    'parenthetical': ['mla-in-text'],
    'page number': ['mla-in-text'],
    'citation format': ['mla-in-text', 'mla-works-cited'],

    // Fragments
    'fragment': ['sentence-fragments'],
    'incomplete sentence': ['sentence-fragments'],
    'sentence fragment': ['sentence-fragments'],
    'fragmant': ['sentence-fragments'],
    'missing subject': ['sentence-fragments'],
    'missing verb': ['sentence-fragments'],
    'not a complete sentence': ['sentence-fragments'],

    // Run-ons
    'run-on': ['run-on-sentences'],
    'run on': ['run-on-sentences'],
    'runon': ['run-on-sentences'],
    'fused sentence': ['run-on-sentences'],
    'long sentence': ['run-on-sentences', 'wordiness'],
    'sentence too long': ['run-on-sentences', 'wordiness'],
    'connecting sentences': ['run-on-sentences', 'comma-splices'],

    // Subject-Verb Agreement
    'subject verb agreement': ['subject-verb-agreement'],
    'subject-verb': ['subject-verb-agreement'],
    'agreement': ['subject-verb-agreement', 'pronoun-agreement'],
    'verb agreement': ['subject-verb-agreement'],
    'singular plural': ['subject-verb-agreement'],
    'verb match': ['subject-verb-agreement'],

    // Paragraphs
    'paragraph': ['paragraph-development', 'topic-sentences'],
    'paragraphing': ['paragraph-development'],
    'paragraph structure': ['paragraph-development'],
    'paragraph development': ['paragraph-development'],
    'body paragraph': ['paragraph-development', 'topic-sentences'],
    'support': ['paragraph-development'],
    'evidence': ['paragraph-development'],

    // Transitions
    'transition': ['transitions'],
    'transitions': ['transitions'],
    'connecting words': ['transitions'],
    'linking': ['transitions'],
    'flow': ['transitions'],
    'however': ['transitions'],
    'therefore': ['transitions'],
    'moreover': ['transitions'],

    // Capitalization
    'capitalization': ['capitalization'],
    'capitalize': ['capitalization'],
    'capital': ['capitalization'],
    'capital letter': ['capitalization'],
    'uppercase': ['capitalization'],
    'when to capitalize': ['capitalization'],

    // Quotation Marks
    'quotation': ['quotation-marks'],
    'quotations': ['quotation-marks'],
    'quote': ['quotation-marks'],
    'quotes': ['quotation-marks'],
    'quotation mark': ['quotation-marks'],
    'quoting': ['quotation-marks'],
    'direct quote': ['quotation-marks'],

    // Parallel Structure
    'parallel': ['parallel-structure'],
    'parallel structure': ['parallel-structure'],
    'parallelism': ['parallel-structure'],
    'parallel form': ['parallel-structure'],
    'list structure': ['parallel-structure'],

    // Modifiers
    'modifier': ['dangling-modifiers'],
    'modifiers': ['dangling-modifiers'],
    'dangling': ['dangling-modifiers'],
    'misplaced': ['dangling-modifiers'],
    'dangling modifier': ['dangling-modifiers'],
    'misplaced modifier': ['dangling-modifiers'],

    // Its vs It's
    'its': ['its-vs-its'],
    "it's": ['its-vs-its'],
    'its vs its': ['its-vs-its'],
    "it's vs its": ['its-vs-its'],

    // Their/There/They're
    'their': ['their-there-theyre'],
    'there': ['their-there-theyre'],
    "they're": ['their-there-theyre'],
    'theyre': ['their-there-theyre'],
    'their there': ['their-there-theyre'],
    'there vs their': ['their-there-theyre'],

    // Affect/Effect
    'affect': ['affect-vs-effect'],
    'effect': ['affect-vs-effect'],
    'affect vs effect': ['affect-vs-effect'],
    'effect vs affect': ['affect-vs-effect'],

    // Pronouns
    'pronoun': ['pronoun-agreement'],
    'pronouns': ['pronoun-agreement'],
    'pronoun agreement': ['pronoun-agreement'],
    'he she': ['pronoun-agreement'],
    'they them': ['pronoun-agreement'],

    // Prepositional Phrases
    'preposition': ['prepositional-phrases'],
    'prepositional': ['prepositional-phrases'],
    'prepositional phrase': ['prepositional-phrases'],
    'prep phrase': ['prepositional-phrases'],

    // Wordiness
    'wordy': ['wordiness'],
    'wordiness': ['wordiness'],
    'too wordy': ['wordiness'],
    'concise': ['wordiness'],
    'brevity': ['wordiness'],
    'cut words': ['wordiness'],
    'shorten': ['wordiness'],

    // Tone
    'formal': ['formal-tone'],
    'tone': ['formal-tone'],
    'academic tone': ['formal-tone'],
    'professional': ['formal-tone'],
    'informal': ['formal-tone'],

    // Second Person
    'you': ['second-person'],
    'second person': ['second-person'],
    'avoid you': ['second-person'],
    'using you': ['second-person']
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

    // Normalize and tokenize the question
    const normalizedText = questionText.toLowerCase();
    const questionWords = normalizedText.split(/\s+/).filter(w => w.length > 0);

    // Find matching topics based on keywords (with fuzzy matching)
    const foundTopicIds = new Set();
    const topicScores = new Map(); // Track relevance scores

    // Check multi-word phrases first (they're more specific)
    for (const [keyword, topicIds] of Object.entries(keywordMappings)) {
        let matched = false;

        // Exact phrase match
        if (normalizedText.includes(keyword)) {
            matched = true;
        } else {
            // Check if all words in keyword appear in question (flexible word order)
            const keywordWords = keyword.split(/\s+/);
            if (keywordWords.every(kw =>
                questionWords.some(qw => isSimilar(qw, kw))
            )) {
                matched = true;
            }

            // Fuzzy match for single words or short phrases
            if (!matched && keywordWords.length <= 2) {
                for (const qWord of questionWords) {
                    for (const kWord of keywordWords) {
                        if (isSimilar(qWord, kWord)) {
                            matched = true;
                            break;
                        }
                    }
                    if (matched) break;
                }
            }
        }

        if (matched) {
            if (!analysis.keywords.includes(keyword)) {
                analysis.keywords.push(keyword);
            }
            topicIds.forEach(id => {
                foundTopicIds.add(id);
                // Score based on keyword specificity (longer = more specific)
                const score = (topicScores.get(id) || 0) + keyword.length;
                topicScores.set(id, score);
            });
        }
    }

    // Also check against topic keywords directly with fuzzy matching
    if (window.topics) {
        window.topics.forEach(topic => {
            if (topic.keywords) {
                topic.keywords.forEach(kw => {
                    const kwLower = kw.toLowerCase();
                    let matched = false;

                    // Exact match
                    if (normalizedText.includes(kwLower)) {
                        matched = true;
                    } else {
                        // Fuzzy match each word
                        for (const qWord of questionWords) {
                            if (isSimilar(qWord, kwLower)) {
                                matched = true;
                                break;
                            }
                        }
                    }

                    if (matched) {
                        foundTopicIds.add(topic.id);
                        if (!analysis.keywords.includes(kwLower)) {
                            analysis.keywords.push(kwLower);
                        }
                        // Add to score
                        const score = (topicScores.get(topic.id) || 0) + kwLower.length;
                        topicScores.set(topic.id, score);
                    }
                });
            }
        });
    }

    // Get topic objects and sort by relevance score
    if (window.topics) {
        analysis.topics = window.topics
            .filter(t => foundTopicIds.has(t.id))
            .sort((a, b) => (topicScores.get(b.id) || 0) - (topicScores.get(a.id) || 0));
    }

    // Generate main response
    if (analysis.topics.length > 0) {
        const topicTitles = analysis.topics.slice(0, 3).map(t => t.title).join(', ');
        if (analysis.topics.length > 3) {
            analysis.mainResponse = `Based on your question, you might be interested in learning about: ${topicTitles}, and ${analysis.topics.length - 3} more topic${analysis.topics.length - 3 > 1 ? 's' : ''}. Click on any topic below to learn more, or use the "Quiz Me!" button to practice.`;
        } else {
            analysis.mainResponse = `Based on your question, you might be interested in learning about: ${topicTitles}. Click on any topic below to learn more, or use the "Quiz Me!" button to practice.`;
        }

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
