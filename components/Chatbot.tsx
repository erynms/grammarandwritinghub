'use client';

import { useState } from 'react';
import { Topic } from '@/types/content';
import { findMatchingTopic, getRelatedTopics } from '@/lib/chatbot';
import ReactMarkdown from 'react-markdown';

interface ChatbotProps {
  topics: Topic[];
  fallbackMessage: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  topic?: Topic;
}

export default function Chatbot({ topics, fallbackMessage }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Find matching topic
    setTimeout(() => {
      const matchedTopic = findMatchingTopic(input, topics);

      if (matchedTopic) {
        const botMessage: Message = {
          type: 'bot',
          content: matchedTopic.explanation,
          topic: matchedTopic,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage: Message = {
          type: 'bot',
          content: fallbackMessage,
        };
        setMessages(prev => [...prev, botMessage]);
      }

      setIsTyping(false);
    }, 500);

    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border border-warm-200">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-warm-600 py-8">
            Type a question below to get started!
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-warm-500 text-white'
                  : 'bg-warm-100 text-warm-900'
              }`}
            >
              {message.type === 'user' ? (
                <p>{message.content}</p>
              ) : (
                <div>
                  {message.topic && (
                    <h3 className="font-semibold text-lg mb-2 text-warm-800">
                      {message.topic.title}
                    </h3>
                  )}
                  {message.topic?.culturalNote && (
                    <div className="mb-3 p-3 bg-warm-50 border-l-4 border-warm-400 rounded">
                      <p className="text-sm text-warm-700 italic">
                        {message.topic.culturalNote}
                      </p>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.topic && (
                    <div className="mt-4 pt-4 border-t border-warm-200">
                      <p className="font-semibold text-sm mb-2 text-warm-800">
                        Further Reading:
                      </p>
                      <ul className="space-y-1">
                        {message.topic.resources.map((resource, idx) => (
                          <li key={idx}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-warm-700 hover:text-warm-900 underline"
                            >
                              {resource.title} ({resource.source})
                            </a>
                          </li>
                        ))}
                      </ul>
                      {message.topic.relatedTopics.length > 0 && (
                        <div className="mt-3">
                          <p className="font-semibold text-sm mb-1 text-warm-800">
                            Related Topics:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {getRelatedTopics(
                              message.topic.relatedTopics,
                              topics
                            ).map(relatedTopic => (
                              <button
                                key={relatedTopic.id}
                                onClick={() => {
                                  const msg: Message = {
                                    type: 'bot',
                                    content: relatedTopic.explanation,
                                    topic: relatedTopic,
                                  };
                                  setMessages(prev => [...prev, msg]);
                                }}
                                className="text-xs bg-warm-200 hover:bg-warm-300 text-warm-800 px-2 py-1 rounded"
                              >
                                {relatedTopic.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-warm-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-warm-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-warm-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-warm-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-warm-200 p-4 bg-warm-50"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question about grammar or writing..."
            className="flex-1 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 disabled:bg-warm-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
