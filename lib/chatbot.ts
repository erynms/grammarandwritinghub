import { Topic, ContentData } from '@/types/content';

// Calculate Levenshtein distance for typo tolerance
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

// Check if two strings are similar (typo tolerance)
function isSimilar(str1: string, str2: string, threshold: number = 2): boolean {
  if (str1 === str2) return true;
  if (str1.length < 3 || str2.length < 3) return str1 === str2;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);

  // Allow up to 'threshold' errors or 20% of the word length
  return distance <= Math.min(threshold, Math.ceil(maxLength * 0.2));
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Extract meaningful words (remove common stop words)
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'may', 'might', 'can',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'when',
    'where', 'why', 'how', 'who', 'which', 'this', 'that', 'these', 'those',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'her',
    'us', 'them', 'about', 'with', 'from', 'for', 'to', 'in', 'on', 'at',
    'of', 'by', 'as', 'into', 'help', 'need', 'want', 'know', 'tell', 'show',
    'explain'
  ]);

  const words = normalizeText(text).split(' ');
  return words.filter(word => word.length > 2 && !stopWords.has(word));
}

interface MatchScore {
  topic: Topic;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'partial';
}

// Find matching topics based on user query
export function findMatchingTopic(
  query: string,
  topics: Topic[]
): Topic | null {
  if (!query || query.trim().length === 0) return null;

  const queryKeywords = extractKeywords(query);
  if (queryKeywords.length === 0) return null;

  const matches: MatchScore[] = [];

  for (const topic of topics) {
    let score = 0;
    let matchType: 'exact' | 'fuzzy' | 'partial' = 'partial';

    // Check each keyword in the topic
    for (const topicKeyword of topic.keywords) {
      const topicWords = extractKeywords(topicKeyword);

      for (const queryWord of queryKeywords) {
        for (const topicWord of topicWords) {
          // Exact match (highest score)
          if (queryWord === topicWord) {
            score += 10;
            matchType = 'exact';
          }
          // Fuzzy match with typo tolerance
          else if (isSimilar(queryWord, topicWord)) {
            score += 7;
            if (matchType !== 'exact') matchType = 'fuzzy';
          }
          // Partial match (word contains or is contained)
          else if (
            queryWord.includes(topicWord) ||
            topicWord.includes(queryWord)
          ) {
            score += 3;
          }
        }
      }
    }

    // Also check title for matches
    const titleWords = extractKeywords(topic.title);
    for (const queryWord of queryKeywords) {
      for (const titleWord of titleWords) {
        if (queryWord === titleWord) {
          score += 8;
          matchType = 'exact';
        } else if (isSimilar(queryWord, titleWord)) {
          score += 5;
          if (matchType !== 'exact') matchType = 'fuzzy';
        }
      }
    }

    if (score > 0) {
      matches.push({ topic, score, matchType });
    }
  }

  // Sort by score (descending)
  matches.sort((a, b) => b.score - a.score);

  // Return the best match if score is above threshold
  if (matches.length > 0 && matches[0].score >= 5) {
    return matches[0].topic;
  }

  return null;
}

// Get related topics by IDs
export function getRelatedTopics(
  relatedIds: string[],
  allTopics: Topic[]
): Topic[] {
  return relatedIds
    .map(id => allTopics.find(topic => topic.id === id))
    .filter((topic): topic is Topic => topic !== undefined);
}
