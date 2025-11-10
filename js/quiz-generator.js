// Quiz Generator - Dynamic interactive exercises
import { showView } from './app.js';

let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let answers = [];

// Initialize quiz for a topic
window.initializeQuiz = function(topic) {
    console.log('initializeQuiz called with topic:', topic.title);
    console.log('Topic has quiz?', !!topic.quiz);
    console.log('Quiz has questions?', topic.quiz?.questions);

    if (!topic.quiz || !topic.quiz.questions || topic.quiz.questions.length === 0) {
        console.error('No quiz available for topic:', topic.title);
        alert('No quiz available for this topic yet.');
        return;
    }

    currentQuiz = topic;
    currentQuestionIndex = 0;
    score = 0;
    answers = [];

    console.log('Initializing quiz with', topic.quiz.questions.length, 'questions');

    // Shuffle questions for variety
    const questions = [...topic.quiz.questions];
    shuffleArray(questions);
    currentQuiz.quiz.shuffledQuestions = questions;

    console.log('About to call displayQuestion()');
    displayQuestion();
    console.log('displayQuestion() completed');
};

// Display current question
function displayQuestion() {
    console.log('displayQuestion called');
    const quizContent = document.getElementById('quizContent');
    console.log('quizContent element:', quizContent);

    const questions = currentQuiz.quiz.shuffledQuestions;
    console.log('Shuffled questions:', questions);

    const question = questions[currentQuestionIndex];
    console.log('Current question:', question);

    const totalQuestions = questions.length;
    const questionNumber = currentQuestionIndex + 1;
    const progress = (questionNumber / totalQuestions) * 100;
    console.log('Progress:', progress + '%');

    let html = `
        <div class="quiz-header">
            <h2>Practice: ${currentQuiz.title}</h2>
            <p>Question ${questionNumber} of ${totalQuestions}</p>
            <div class="quiz-progress">
                <div class="quiz-progress-bar" style="width: ${progress}%"></div>
            </div>
        </div>

        <div class="question-container">
            <div class="question-text">${question.question}</div>
    `;

    // Render based on question type
    if (question.type === 'multiple-choice') {
        html += renderMultipleChoice(question, questionNumber);
    } else if (question.type === 'true-false') {
        html += renderTrueFalse(question, questionNumber);
    } else if (question.type === 'identify-error') {
        html += renderIdentifyError(question, questionNumber);
    } else if (question.type === 'matching') {
        html += renderMatching(question, questionNumber);
    }

    html += '</div>';

    // Add feedback area (hidden initially)
    html += '<div id="questionFeedback"></div>';

    // Navigation buttons
    html += '<div class="quiz-navigation">';

    if (currentQuestionIndex > 0) {
        html += '<button id="prevQuestion" class="btn-secondary">Previous</button>';
    } else {
        html += '<span></span>'; // Spacer
    }

    html += '<button id="submitAnswer" class="btn-primary">Submit Answer</button>';
    html += '</div>';

    console.log('Setting quizContent innerHTML, HTML length:', html.length);
    quizContent.innerHTML = html;
    console.log('HTML set successfully');

    // Add event listeners
    setupQuestionListeners(question);
    console.log('Event listeners set up');
}

// Render multiple choice question
function renderMultipleChoice(question, questionNumber) {
    const shuffledOptions = [...question.options];
    shuffleArray(shuffledOptions);

    let html = '<div class="answer-options">';
    shuffledOptions.forEach((option, index) => {
        const optionId = `q${questionNumber}_option${index}`;
        html += `
            <label class="answer-option" data-option="${option}">
                <input type="radio" name="q${questionNumber}" value="${option}" id="${optionId}">
                ${option}
            </label>
        `;
    });
    html += '</div>';

    return html;
}

// Render true/false question
function renderTrueFalse(question, questionNumber) {
    let html = '<div class="answer-options">';
    ['True', 'False'].forEach((option, index) => {
        const optionId = `q${questionNumber}_option${index}`;
        html += `
            <label class="answer-option" data-option="${option}">
                <input type="radio" name="q${questionNumber}" value="${option}" id="${optionId}">
                ${option}
            </label>
        `;
    });
    html += '</div>';

    return html;
}

// Render identify error question
function renderIdentifyError(question, questionNumber) {
    let html = '<div class="answer-options">';
    question.sentences.forEach((sentence, index) => {
        const optionId = `q${questionNumber}_option${index}`;
        html += `
            <label class="answer-option" data-option="${index}">
                <input type="radio" name="q${questionNumber}" value="${index}" id="${optionId}">
                ${sentence}
            </label>
        `;
    });
    html += '</div>';

    return html;
}

// Render matching question
function renderMatching(question, questionNumber) {
    let html = '<p class="matching-instructions">Match each item on the left with the correct answer on the right:</p>';
    html += '<div class="matching-container">';

    question.pairs.forEach((pair, index) => {
        html += `
            <div class="matching-row">
                <div class="matching-term">${pair.term}</div>
                <select name="match${index}" class="matching-select" data-index="${index}">
                    <option value="">-- Select --</option>
        `;

        // Shuffle definitions for each row
        const shuffledDefs = [...question.pairs.map(p => p.definition)];
        shuffleArray(shuffledDefs);

        shuffledDefs.forEach(def => {
            html += `<option value="${def}">${def}</option>`;
        });

        html += `
                </select>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Set up event listeners for current question
function setupQuestionListeners(question) {
    // Answer option selection (for radio buttons)
    document.querySelectorAll('.answer-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.answer-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Add selected class to clicked option
            this.classList.add('selected');

            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // Submit answer button
    document.getElementById('submitAnswer').addEventListener('click', function() {
        checkAnswer(question);
    });

    // Previous button (if exists)
    const prevBtn = document.getElementById('prevQuestion');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayQuestion();
            }
        });
    }
}

// Check answer and provide feedback
function checkAnswer(question) {
    let userAnswer = null;
    let isCorrect = false;

    // Get user's answer based on question type
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const selected = document.querySelector(`input[name="q${currentQuestionIndex + 1}"]:checked`);
        if (!selected) {
            alert('Please select an answer.');
            return;
        }
        userAnswer = selected.value;
        isCorrect = userAnswer === question.answer;

    } else if (question.type === 'identify-error') {
        const selected = document.querySelector(`input[name="q${currentQuestionIndex + 1}"]:checked`);
        if (!selected) {
            alert('Please select an answer.');
            return;
        }
        userAnswer = parseInt(selected.value);
        isCorrect = userAnswer === question.correctIndex;

    } else if (question.type === 'matching') {
        const selects = document.querySelectorAll('.matching-select');
        userAnswer = [];
        let allAnswered = true;

        selects.forEach((select, index) => {
            const value = select.value;
            if (!value) {
                allAnswered = false;
            }
            userAnswer.push({
                term: question.pairs[index].term,
                selectedDef: value,
                correctDef: question.pairs[index].definition
            });
        });

        if (!allAnswered) {
            alert('Please complete all matches.');
            return;
        }

        isCorrect = userAnswer.every(answer => answer.selectedDef === answer.correctDef);
    }

    // Record answer
    answers.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.answer || question.correctIndex || question.pairs,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        score++;
    }

    // Show feedback
    displayFeedback(question, isCorrect);

    // Disable answer selection
    document.querySelectorAll('input, select').forEach(input => {
        input.disabled = true;
    });

    // Change submit button to next button
    const submitBtn = document.getElementById('submitAnswer');
    submitBtn.textContent = currentQuestionIndex < currentQuiz.quiz.shuffledQuestions.length - 1 ? 'Next Question' : 'See Results';
    submitBtn.onclick = function() {
        if (currentQuestionIndex < currentQuiz.quiz.shuffledQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        } else {
            showResults();
        }
    };

    // Highlight correct/incorrect answers visually
    if (question.type === 'multiple-choice' || question.type === 'true-false' || question.type === 'identify-error') {
        document.querySelectorAll('.answer-option').forEach(option => {
            const input = option.querySelector('input');
            if (input && input.checked) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
    }
}

// Display feedback for answer
function displayFeedback(question, isCorrect) {
    const feedbackDiv = document.getElementById('questionFeedback');

    let html = `<div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">`;

    if (isCorrect) {
        html += '<h4>✓ Correct!</h4>';
    } else {
        html += '<h4>✗ Not quite</h4>';
    }

    if (question.explanation) {
        html += `<p>${question.explanation}</p>`;
    }

    if (!isCorrect && question.correctAnswer) {
        html += `<p><strong>The correct answer is:</strong> ${question.correctAnswer}</p>`;
    }

    html += '</div>';

    feedbackDiv.innerHTML = html;
}

// Show quiz results
function showResults() {
    const quizContent = document.getElementById('quizContent');
    const totalQuestions = currentQuiz.quiz.shuffledQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    let performanceMessage = '';
    if (percentage >= 90) {
        performanceMessage = 'Excellent work! You\'ve mastered this topic!';
    } else if (percentage >= 70) {
        performanceMessage = 'Good job! You have a solid understanding.';
    } else if (percentage >= 50) {
        performanceMessage = 'You\'re making progress. Review the topic and try again!';
    } else {
        performanceMessage = 'Keep practicing! Review the topic materials and try the quiz again.';
    }

    let html = `
        <div class="quiz-results">
            <h3>Quiz Complete!</h3>
            <div class="quiz-score">${score} / ${totalQuestions}</div>
            <p class="percentage">${percentage}%</p>
            <p class="performance-message">${performanceMessage}</p>

            <div class="quiz-navigation">
                <button id="reviewTopic" class="btn-secondary">Review Topic</button>
                <button id="retakeQuiz" class="btn-primary">Retake Quiz</button>
            </div>
        </div>
    `;

    quizContent.innerHTML = html;

    // Log completion to Firebase
    if (window.logQuizCompletion) {
        window.logQuizCompletion(currentQuiz.id, score, totalQuestions);
    }

    // Add event listeners
    document.getElementById('reviewTopic').addEventListener('click', function() {
        showView('topicDetailView');
    });

    document.getElementById('retakeQuiz').addEventListener('click', function() {
        window.initializeQuiz(currentQuiz);
    });
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export { initializeQuiz };
