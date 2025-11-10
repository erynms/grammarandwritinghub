export interface Resource {
  title: string;
  url: string;
  source: 'EFSC LibGuides' | 'Grammar Guide' | 'Purdue OWL' | 'UNC Writing Center';
  description?: string;
}

export interface Topic {
  id: string;
  title: string;
  keywords: string[];
  summary: string;
  explanation: string;
  culturalNote?: string;
  relatedTopics: string[];
  resources: Resource[];
}

export interface ContentData {
  welcomeMessage: string;
  topics: Topic[];
  fallbackMessage: string;
}
