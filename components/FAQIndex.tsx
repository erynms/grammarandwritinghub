'use client';

import { Topic } from '@/types/content';

interface FAQIndexProps {
  topics: Topic[];
  onTopicClick: (topic: Topic) => void;
}

export default function FAQIndex({ topics, onTopicClick }: FAQIndexProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-warm-200 p-6">
      <h2 className="text-2xl font-bold mb-4 text-warm-900">
        Common Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic)}
            className="text-left p-4 bg-warm-50 hover:bg-warm-100 border border-warm-200 hover:border-warm-400 rounded-lg transition-all group"
          >
            <h3 className="font-semibold text-warm-900 group-hover:text-warm-700 mb-1">
              {topic.title}
            </h3>
            <p className="text-sm text-warm-600 line-clamp-2">
              {topic.summary}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
