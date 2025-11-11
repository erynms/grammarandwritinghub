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

// Filter topics by selected course
function filterTopicsByCourse(allTopics, selectedCourse) {
    return allTopics.filter(topic => {
        // Show if no courses field (available to all)
        if (!topic.courses || topic.courses.length === 0) return true;
        // Show if current course is in the courses array
        return topic.courses.includes(selectedCourse);
    });
}

// Load topics from JSON file
async function loadTopics() {
    try {
        const response = await fetch('data/topics.json');
        const allTopics = await response.json();

        // Filter topics based on selected course
        const userCourse = sessionStorage.getItem('userCourse');
        topics = filterTopicsByCourse(allTopics, userCourse);

        window.topics = topics; // Make topics available globally for question analyzer

        // Update which category buttons are visible based on available topics
        updateCategoryButtonVisibility(topics);

        displayTopics(topics);
        console.log('All topics loaded:', allTopics.length);
        console.log('Topics for', userCourse + ':', topics.length);
    } catch (error) {
        console.error('Error loading topics:', error);
        document.getElementById('topicsList').innerHTML =
            '<p>Error loading topics. Please refresh the page.</p>';
    }
}

// Update visibility of category filter buttons based on available topics
function updateCategoryButtonVisibility(filteredTopics) {
    // Get unique categories from filtered topics
    const availableCategories = new Set(filteredTopics.map(topic => topic.category));

    // Loop through all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const category = btn.dataset.category;

        // Always show "All Topics" button
        if (category === 'all') {
            btn.style.display = 'inline-block';
            return;
        }

        // Show button only if there are topics in that category
        if (availableCategories.has(category)) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    });
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

    // Main answer with content from most relevant topic
    if (analysis.topics.length > 0) {
        const topTopic = analysis.topics[0];

        html += '<h3>Answer:</h3>';
        html += `<h4 style="color: #2c5aa0; margin-bottom: 10px;">${topTopic.title}</h4>`;

        // Show the topic's content (description or first part of content)
        if (topTopic.content) {
            // Extract plain text from HTML content for a brief answer
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = topTopic.content;
            const contentText = tempDiv.textContent || tempDiv.innerText;
            // Show first paragraph or up to 300 characters
            const briefAnswer = contentText.length > 300
                ? contentText.substring(0, 300) + '...'
                : contentText;
            html += `<p>${briefAnswer}</p>`;
        } else if (topTopic.description) {
            html += `<p>${topTopic.description}</p>`;
        }

        // Link to full topic
        html += `<p><a href="#" class="topic-link" data-topic-id="${topTopic.id}" style="font-weight: 600; color: #2c5aa0;">View full explanation and practice with quiz →</a></p>`;

        // Show related topics if there are more (limit to top 5 total)
        if (analysis.topics.length > 1) {
            const relatedTopics = analysis.topics.slice(1, 5); // Show up to 4 more
            html += '<h4 style="margin-top: 25px;">Related Topics You Might Also Find Helpful:</h4>';
            html += '<div class="topic-cards-inline">';
            relatedTopics.forEach(topic => {
                html += `
                    <div class="topic-card-inline">
                        <a href="#" class="topic-link" data-topic-id="${topic.id}">
                            <strong>${topic.title}</strong><br>
                            <span style="font-size: 0.9em; color: #666;">${topic.description}</span>
                        </a>
                    </div>
                `;
            });
            html += '</div>';

            if (analysis.topics.length > 5) {
                html += `<p style="margin-top: 10px; color: #666;"><em>Plus ${analysis.topics.length - 5} more related topics...</em></p>`;
            }
        }

        // External resources for the main topic
        if (topTopic.resources && topTopic.resources.length > 0) {
            html += '<h4 style="margin-top: 25px;">Learn More:</h4>';
            html += '<div class="resource-links">';
            topTopic.resources.forEach(resource => {
                html += `<a href="${resource.url}" target="_blank" class="resource-link">${resource.title}</a>`;
            });
            html += '</div>';
        }

    } else {
        html += '<h3>Help Finding Resources</h3>';
        html += '<p>I didn\'t find a specific match for your question, but you can browse our topic index or try rephrasing your question with different keywords.</p>';
        html += '<p>Try searching for terms like: "comma," "thesis," "citation," "fragment," "run-on," or browse topics above.</p>';
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
        'parts-of-speech': 'Parts of Speech',
        'phrases-clauses': 'Phrases & Clauses',
        'punctuation': 'Punctuation & Mechanics',
        'academic-writing': 'Academic Writing',
        'mla-style': 'MLA Style',
        'apa-style': 'APA Style',
        'literature': 'Literature',
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
