'use client';

import { useState, useRef, useEffect } from 'react';
import Chatbot from '@/components/Chatbot';
import FAQIndex from '@/components/FAQIndex';
import { Topic, ContentData } from '@/types/content';
import contentData from '@/data/content.json';

export default function Home() {
  const data = contentData as ContentData;
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleTopicClick = (topic: Topic) => {
    setShowChat(true);
    // Scroll to chat after a brief delay to ensure it's rendered
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-warm-50">
      {/* Header */}
      <header className="bg-warm-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Grammar & Writing Support</h1>
          <p className="text-warm-200">
            Help with Standard Academic English for your college writing
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome message */}
        <div className="bg-white rounded-lg shadow-lg border border-warm-200 p-6 mb-8">
          <p className="text-lg text-warm-900">{data.welcomeMessage}</p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a
            href="mailto:shorthille@easternflorida.edu"
            className="flex items-center justify-center px-6 py-4 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors shadow-md"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email Professor Hille
          </a>
          <a
            href="https://websitesearch.moderncampus.net/texis/search/redir.html?query=writing+center&pr=easternflorida-web24&prox=page&rorder=500&rprox=750&rdfreq=500&rwfreq=750&rlead=750&rdepth=31&sufs=1&order=r&rankBias=news_release_bias&uq=&u=https%3A//www.easternflorida.edu/academics/academic-support/writing-centers/index.php&redirKey=533e53a9c4d25557ed64dc16502b93aad1afdeaa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-4 bg-warm-500 text-white rounded-lg hover:bg-warm-600 transition-colors shadow-md"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Schedule Writing Center Appointment
          </a>
        </div>

        {/* FAQ Index */}
        <div className="mb-8">
          <FAQIndex topics={data.topics} onTopicClick={handleTopicClick} />
        </div>

        {/* Chat Interface */}
        <div ref={chatRef} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-warm-900">
            Ask a Question
          </h2>
          <Chatbot topics={data.topics} fallbackMessage={data.fallbackMessage} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-warm-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-warm-200">
            Eastern Florida State College Writing Support
          </p>
          <p className="text-sm text-warm-300 mt-2">
            For personalized help, contact{' '}
            <a
              href="mailto:shorthille@easternflorida.edu"
              className="underline hover:text-white"
            >
              shorthille@easternflorida.edu
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
