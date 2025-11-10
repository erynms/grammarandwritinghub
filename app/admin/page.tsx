'use client';

import { useState, useEffect } from 'react';
import { Topic, Resource, ContentData } from '@/types/content';
import contentData from '@/data/content.json';

export default function AdminPage() {
  const [data, setData] = useState<ContentData>(contentData as ContentData);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingWelcome, setEditingWelcome] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    // Download the updated content as a JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content.json';
    link.click();
    URL.revokeObjectURL(url);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: 'New Topic',
      keywords: [],
      summary: '',
      explanation: '',
      relatedTopics: [],
      resources: [],
    };
    setData({ ...data, topics: [...data.topics, newTopic] });
    setEditingTopic(newTopic);
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      setData({
        ...data,
        topics: data.topics.filter(t => t.id !== topicId),
      });
      if (editingTopic?.id === topicId) {
        setEditingTopic(null);
      }
    }
  };

  const handleUpdateTopic = (updatedTopic: Topic) => {
    setData({
      ...data,
      topics: data.topics.map(t => (t.id === updatedTopic.id ? updatedTopic : t)),
    });
    setEditingTopic(updatedTopic);
  };

  const handleAddResource = (topicId: string) => {
    const topic = data.topics.find(t => t.id === topicId);
    if (!topic) return;

    const newResource: Resource = {
      title: '',
      url: '',
      source: 'EFSC LibGuides',
      description: '',
    };

    const updatedTopic = {
      ...topic,
      resources: [...topic.resources, newResource],
    };

    handleUpdateTopic(updatedTopic);
  };

  const handleDeleteResource = (topicId: string, resourceIndex: number) => {
    const topic = data.topics.find(t => t.id === topicId);
    if (!topic) return;

    const updatedTopic = {
      ...topic,
      resources: topic.resources.filter((_, idx) => idx !== resourceIndex),
    };

    handleUpdateTopic(updatedTopic);
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-warm-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-warm-200">Edit FAQ topics and welcome message</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Changes downloaded! Replace /data/content.json with the downloaded file.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-warm-200 p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-warm-900">Topics</h2>
                <button
                  onClick={handleAddTopic}
                  className="px-3 py-1 bg-warm-600 text-white text-sm rounded hover:bg-warm-700"
                >
                  + Add
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingWelcome(true);
                  setEditingTopic(null);
                }}
                className={`w-full text-left p-3 mb-2 rounded ${
                  editingWelcome
                    ? 'bg-warm-200 border-2 border-warm-500'
                    : 'bg-warm-50 hover:bg-warm-100'
                }`}
              >
                <span className="font-semibold text-warm-900">
                  Welcome Message
                </span>
              </button>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {data.topics.map(topic => (
                  <div key={topic.id} className="group relative">
                    <button
                      onClick={() => {
                        setEditingTopic(topic);
                        setEditingWelcome(false);
                      }}
                      className={`w-full text-left p-3 rounded transition-colors ${
                        editingTopic?.id === topic.id
                          ? 'bg-warm-200 border-2 border-warm-500'
                          : 'bg-warm-50 hover:bg-warm-100'
                      }`}
                    >
                      <span className="font-semibold text-warm-900 block truncate">
                        {topic.title}
                      </span>
                      <span className="text-xs text-warm-600">
                        {topic.keywords.length} keywords
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Download Changes
              </button>

              <a
                href="/"
                className="block text-center w-full mt-2 px-4 py-2 bg-warm-100 text-warm-800 rounded-lg hover:bg-warm-200"
              >
                Back to Home
              </a>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {editingWelcome ? (
              <div className="bg-white rounded-lg shadow-lg border border-warm-200 p-6">
                <h2 className="text-2xl font-bold mb-4 text-warm-900">
                  Welcome Message
                </h2>
                <textarea
                  value={data.welcomeMessage}
                  onChange={e =>
                    setData({ ...data, welcomeMessage: e.target.value })
                  }
                  className="w-full h-40 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                  placeholder="Enter welcome message..."
                />

                <h3 className="text-xl font-bold mt-6 mb-4 text-warm-900">
                  Fallback Message
                </h3>
                <textarea
                  value={data.fallbackMessage}
                  onChange={e =>
                    setData({ ...data, fallbackMessage: e.target.value })
                  }
                  className="w-full h-32 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                  placeholder="Enter fallback message..."
                />
              </div>
            ) : editingTopic ? (
              <div className="bg-white rounded-lg shadow-lg border border-warm-200 p-6">
                <h2 className="text-2xl font-bold mb-4 text-warm-900">
                  Edit Topic
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Topic ID
                    </label>
                    <input
                      type="text"
                      value={editingTopic.id}
                      onChange={e =>
                        handleUpdateTopic({ ...editingTopic, id: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingTopic.title}
                      onChange={e =>
                        handleUpdateTopic({ ...editingTopic, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editingTopic.keywords.join(', ')}
                      onChange={e =>
                        handleUpdateTopic({
                          ...editingTopic,
                          keywords: e.target.value
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k),
                        })
                      }
                      className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                      placeholder="comma, commas, punctuation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Summary
                    </label>
                    <textarea
                      value={editingTopic.summary}
                      onChange={e =>
                        handleUpdateTopic({ ...editingTopic, summary: e.target.value })
                      }
                      className="w-full h-24 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                      placeholder="Brief summary..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Explanation (Markdown supported)
                    </label>
                    <textarea
                      value={editingTopic.explanation}
                      onChange={e =>
                        handleUpdateTopic({
                          ...editingTopic,
                          explanation: e.target.value,
                        })
                      }
                      className="w-full h-64 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500 font-mono text-sm"
                      placeholder="Detailed explanation with markdown..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Cultural Note (optional)
                    </label>
                    <textarea
                      value={editingTopic.culturalNote || ''}
                      onChange={e =>
                        handleUpdateTopic({
                          ...editingTopic,
                          culturalNote: e.target.value,
                        })
                      }
                      className="w-full h-20 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                      placeholder="Note about dialect/cultural context..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-warm-800">
                      Related Topic IDs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editingTopic.relatedTopics.join(', ')}
                      onChange={e =>
                        handleUpdateTopic({
                          ...editingTopic,
                          relatedTopics: e.target.value
                            .split(',')
                            .map(id => id.trim())
                            .filter(id => id),
                        })
                      }
                      className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
                      placeholder="topic-1, topic-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-warm-800">
                        Resources
                      </label>
                      <button
                        onClick={() => handleAddResource(editingTopic.id)}
                        className="px-3 py-1 bg-warm-600 text-white text-sm rounded hover:bg-warm-700"
                      >
                        + Add Resource
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editingTopic.resources.map((resource, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-warm-200 rounded-lg relative"
                        >
                          <button
                            onClick={() =>
                              handleDeleteResource(editingTopic.id, idx)
                            }
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Delete
                          </button>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={resource.title}
                              onChange={e => {
                                const updatedResources = [...editingTopic.resources];
                                updatedResources[idx] = {
                                  ...resource,
                                  title: e.target.value,
                                };
                                handleUpdateTopic({
                                  ...editingTopic,
                                  resources: updatedResources,
                                });
                              }}
                              className="w-full px-3 py-2 border border-warm-300 rounded text-sm"
                              placeholder="Resource title"
                            />

                            <input
                              type="url"
                              value={resource.url}
                              onChange={e => {
                                const updatedResources = [...editingTopic.resources];
                                updatedResources[idx] = {
                                  ...resource,
                                  url: e.target.value,
                                };
                                handleUpdateTopic({
                                  ...editingTopic,
                                  resources: updatedResources,
                                });
                              }}
                              className="w-full px-3 py-2 border border-warm-300 rounded text-sm"
                              placeholder="https://..."
                            />

                            <select
                              value={resource.source}
                              onChange={e => {
                                const updatedResources = [...editingTopic.resources];
                                updatedResources[idx] = {
                                  ...resource,
                                  source: e.target.value as Resource['source'],
                                };
                                handleUpdateTopic({
                                  ...editingTopic,
                                  resources: updatedResources,
                                });
                              }}
                              className="w-full px-3 py-2 border border-warm-300 rounded text-sm"
                            >
                              <option value="EFSC LibGuides">EFSC LibGuides</option>
                              <option value="Grammar Guide">Grammar Guide</option>
                              <option value="Purdue OWL">Purdue OWL</option>
                              <option value="UNC Writing Center">
                                UNC Writing Center
                              </option>
                            </select>

                            <input
                              type="text"
                              value={resource.description || ''}
                              onChange={e => {
                                const updatedResources = [...editingTopic.resources];
                                updatedResources[idx] = {
                                  ...resource,
                                  description: e.target.value,
                                };
                                handleUpdateTopic({
                                  ...editingTopic,
                                  resources: updatedResources,
                                });
                              }}
                              className="w-full px-3 py-2 border border-warm-300 rounded text-sm"
                              placeholder="Description (optional)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-warm-200 p-6 text-center text-warm-600">
                Select a topic or the welcome message to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
