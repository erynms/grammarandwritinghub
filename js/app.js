// Main Application Logic
import { analytics, isConfigured } from './firebase-config.js';

let topics = [];
let currentTopic = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user selected a course
    const userCourse = sessionStorage.getItem('userCourse');
    if (!userCourse) {
        window.location.href = 'index.html';
        return;
    }

    // Display user's course
    document.getElementById('userCourse').textContent = userCourse;

    // Load topics data
    await loadTopics();

    // Set up navigation
    setupNavigation();

    // Set up topic browsing
    setupTopicBrowsing();

    // Set up question asking
    setupQuestionAsking();

    // Set up topic detail view
    setupTopicDetail();

    // Set up email professor buttons
    setupEmailButtons();
});

// Load topics from JSON file
async function loadTopics() {
    try {
        const response = await fetch('data/topics.json');
        topics = await response.json();
        window.topics = topics; // Make topics available globally for question analyzer
        displayTopics(topics);
        console.log('Topics loaded:', topics.length);
    } catch (error) {
        console.error('Error loading topics:', error);
        document.getElementById('topicsList').innerHTML =
            '<p>Error loading topics. Please refresh the page.</p>';
    }
}

// Display topics in grid
function displayTopics(topicsToDisplay) {
    const topicsList = document.getElementById('topicsList');

    if (topicsToDisplay.length === 0) {
        topicsList.innerHTML = '<p>No topics found matching your search.</p>';
        return;
    }

    topicsList.innerHTML = topicsToDisplay.map(topic => `
        <div class="topic-card" data-topic-id="${topic.id}">
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
            <span class="topic-category">${formatCategory(topic.category)}</span>
        </div>
    `).join('');

    // Add click handlers to topic cards
    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', function() {
            const topicId = this.dataset.topicId;
            showTopicDetail(topicId);
        });
    });
}

// Set up navigation between views
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding view
            const viewName = this.dataset.view;
            showView(viewName + 'View');
        });
    });
}

// Show specific view
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');

    // Hide nav for topic detail and quiz views
    const nav = document.querySelector('.main-nav');
    if (viewId === 'topicDetailView' || viewId === 'quizView') {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }
}

// Set up topic browsing features
function setupTopicBrowsing() {
    // Search functionality
    document.getElementById('topicSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

        let filtered = topics;

        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(topic => topic.category === activeCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(topic =>
                topic.title.toLowerCase().includes(searchTerm) ||
                topic.description.toLowerCase().includes(searchTerm) ||
                topic.keywords.some(kw => kw.toLowerCase().includes(searchTerm))
            );
        }

        displayTopics(filtered);
    });

    // Category filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter topics
            const category = this.dataset.category;
            const searchTerm = document.getElementById('topicSearch').value.toLowerCase();

            let filtered = topics;

            if (category !== 'all') {
                filtered = filtered.filter(topic => topic.category === category);
            }

            if (searchTerm) {
                filtered = filtered.filter(topic =>
                    topic.title.toLowerCase().includes(searchTerm) ||
                    topic.description.toLowerCase().includes(searchTerm) ||
                    topic.keywords.some(kw => kw.toLowerCase().includes(searchTerm))
                );
            }

            displayTopics(filtered);
        });
    });
}

// Set up question asking functionality
function setupQuestionAsking() {
    document.getElementById('submitQuestion').addEventListener('click', async function() {
        const question = document.getElementById('questionInput').value.trim();

        if (!question) {
            alert('Please enter a question.');
            return;
        }

        // Analyze question (implemented in question-analyzer.js)
        const analysis = await analyzeQuestion(question);

        // Display response
        displayQuestionResponse(analysis);

        // Log to Firebase
        if (window.logQuestionAsked) {
            window.logQuestionAsked(analysis.keywords, analysis.topics.length);
        }
    });
}

// Display question response
function displayQuestionResponse(analysis) {
    const responseSection = document.getElementById('questionResponse');
    responseSection.classList.remove('hidden');

    let html = '<div class="response-content">';

    // Main answer
    if (analysis.topics.length > 0) {
        html += '<h3>Here\'s what I found:</h3>';
        html += `<p>${analysis.mainResponse}</p>`;

        // Related topics
        html += '<h4>Related Topics:</h4>';
        html += '<div class="resource-links">';
        analysis.topics.forEach(topic => {
            html += `<a href="#" class="resource-link topic-link" data-topic-id="${topic.id}">${topic.title}</a>`;
        });
        html += '</div>';
    } else {
        html += '<h3>Help Finding Resources</h3>';
        html += '<p>I didn\'t find a specific match for your question, but you can browse our topic index or try rephrasing your question with different keywords.</p>';
    }

    // Grammar notes if any errors detected
    if (analysis.grammarIssues.length > 0) {
        html += '<div class="grammar-note">';
        html += '<h4>Quick Note on Your Question:</h4>';
        html += '<p>I noticed a few things in your question that might be helpful to review:</p>';
        html += '<ul>';
        analysis.grammarIssues.forEach(issue => {
            html += `<li>${issue.note}</li>`;
        });
        html += '</ul>';
        html += '<p>Here are some resources that might help:</p>';
        html += '<div class="resource-links">';
        analysis.grammarIssues.forEach(issue => {
            issue.resources.forEach(resource => {
                html += `<a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>`;
            });
        });
        html += '</div>';
        html += '</div>';
    }

    // External resources for the main topic
    if (analysis.externalResources && analysis.externalResources.length > 0) {
        html += '<h4>Additional Resources:</h4>';
        html += '<div class="resource-links">';
        analysis.externalResources.forEach(resource => {
            html += `<a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>`;
        });
        html += '</div>';
    }

    html += '</div>';
    responseSection.innerHTML = html;

    // Add click handlers to topic links
    document.querySelectorAll('.topic-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const topicId = this.dataset.topicId;
            showTopicDetail(topicId);
        });
    });

    // Scroll to response
    responseSection.scrollIntoView({ behavior: 'smooth' });
}

// Show topic detail
function showTopicDetail(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    currentTopic = topic;

    // Build topic detail HTML
    const topicContent = document.getElementById('topicContent');
    let html = `
        <div class="topic-header">
            <h2>${topic.title}</h2>
            <span class="topic-category">${formatCategory(topic.category)}</span>
        </div>

        <div class="topic-explanation">
            ${topic.content}
        </div>
    `;

    // Add examples if available
    if (topic.examples && topic.examples.length > 0) {
        html += '<div class="topic-examples"><h3>Examples:</h3>';
        topic.examples.forEach(example => {
            html += `
                <div class="example">
                    <div class="example-label">${example.label}:</div>
                    <div>${example.text}</div>
                </div>
            `;
        });
        html += '</div>';
    }

    // Add external resources
    if (topic.resources && topic.resources.length > 0) {
        html += '<h3>Learn More:</h3><div class="resource-links">';
        topic.resources.forEach(resource => {
            html += `<a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>`;
        });
        html += '</div>';
    }

    topicContent.innerHTML = html;

    // Show topic detail view
    showView('topicDetailView');

    // Log topic access
    if (window.logTopicAccess) {
        window.logTopicAccess(topic.id, topic.title, topic.category);
    }
}

// Set up topic detail navigation
function setupTopicDetail() {
    document.getElementById('backToTopics').addEventListener('click', function() {
        showView('topicsView');
        // Reset nav to topics
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="topics"]').classList.add('active');
    });

    document.getElementById('tutorMeBtn').addEventListener('click', function() {
        if (currentTopic) {
            startQuiz(currentTopic);
        }
    });

    document.getElementById('backToTopic').addEventListener('click', function() {
        if (currentTopic) {
            showView('topicDetailView');
        }
    });
}

// Format category name for display
function formatCategory(category) {
    const categoryNames = {
        'sentence-basics': 'Sentence Basics',
        'punctuation': 'Punctuation & Mechanics',
        'academic-writing': 'Academic Writing',
        'mla-style': 'MLA Style',
        'common-errors': 'Common Errors'
    };
    return categoryNames[category] || category;
}

// Start quiz (will be implemented in quiz-generator.js)
function startQuiz(topic) {
    showView('quizView');
    if (window.initializeQuiz) {
        window.initializeQuiz(topic);
    }
}

// Set up email professor buttons
function setupEmailButtons() {
    // Browse topics email button
    const emailBtnBrowse = document.getElementById('emailProfessorBrowse');
    const emailDisplayBrowse = document.getElementById('professorEmailBrowse');

    if (emailBtnBrowse) {
        emailBtnBrowse.addEventListener('click', function() {
            emailDisplayBrowse.classList.toggle('hidden');
            emailBtnBrowse.textContent = emailDisplayBrowse.classList.contains('hidden')
                ? 'Email Your Professor'
                : 'Hide Email';
        });
    }

    // Ask question email button
    const emailBtnAsk = document.getElementById('emailProfessorAsk');
    const emailDisplayAsk = document.getElementById('professorEmailAsk');

    if (emailBtnAsk) {
        emailBtnAsk.addEventListener('click', function() {
            emailDisplayAsk.classList.toggle('hidden');
            emailBtnAsk.textContent = emailDisplayAsk.classList.contains('hidden')
                ? 'Email Your Professor'
                : 'Hide Email';
        });
    }
}

// Make analyzeQuestion available globally (imported from question-analyzer.js)
window.analyzeQuestion = null;

// Export for use in other modules
export { topics, currentTopic, showView, displayQuestionResponse };
