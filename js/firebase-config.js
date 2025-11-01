// Firebase Configuration and Analytics
// Instructions for setup are in INSTRUCTOR_GUIDE.md

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > Your apps > Firebase SDK snippet
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (will only work once you add your config above)
let analytics = null;
let db = null;

// Check if Firebase config is set up
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

if (isConfigured && typeof firebase !== 'undefined') {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        analytics = firebase.analytics();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
    }
} else {
    console.warn('Firebase not configured. Analytics will not be tracked. See INSTRUCTOR_GUIDE.md for setup instructions.');
}

// Log course selection
window.logCourseSelection = function(course) {
    if (!analytics) {
        console.log('Course selected (not logged - Firebase not configured):', course);
        return;
    }

    try {
        // Log event to Firebase Analytics
        analytics.logEvent('course_selection', {
            course_code: course,
            timestamp: new Date().toISOString()
        });

        // Store in Firestore for detailed tracking
        if (db) {
            db.collection('course_selections').add({
                course: course,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                session_id: getSessionId()
            });
        }

        console.log('Course selection logged:', course);
    } catch (error) {
        console.error('Error logging course selection:', error);
    }
};

// Log topic access
window.logTopicAccess = function(topicId, topicTitle, category) {
    if (!analytics) {
        console.log('Topic accessed (not logged):', topicTitle);
        return;
    }

    try {
        const course = sessionStorage.getItem('userCourse') || 'unknown';

        analytics.logEvent('topic_access', {
            topic_id: topicId,
            topic_title: topicTitle,
            category: category,
            course: course,
            timestamp: new Date().toISOString()
        });

        if (db) {
            db.collection('topic_access').add({
                topic_id: topicId,
                topic_title: topicTitle,
                category: category,
                course: course,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                session_id: getSessionId()
            });
        }

        console.log('Topic access logged:', topicTitle);
    } catch (error) {
        console.error('Error logging topic access:', error);
    }
};

// Log question asked
window.logQuestionAsked = function(keywords, topicsFound) {
    if (!analytics) {
        console.log('Question asked (not logged)');
        return;
    }

    try {
        const course = sessionStorage.getItem('userCourse') || 'unknown';

        // Only log keywords, not full question for privacy
        analytics.logEvent('question_asked', {
            keywords: keywords.join(', '),
            topics_found: topicsFound,
            course: course,
            timestamp: new Date().toISOString()
        });

        if (db) {
            db.collection('questions').add({
                keywords: keywords,
                topics_found: topicsFound,
                course: course,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                session_id: getSessionId()
            });
        }

        console.log('Question logged (keywords only)');
    } catch (error) {
        console.error('Error logging question:', error);
    }
};

// Log quiz completion
window.logQuizCompletion = function(topicId, score, totalQuestions) {
    if (!analytics) {
        console.log('Quiz completed (not logged):', score, '/', totalQuestions);
        return;
    }

    try {
        const course = sessionStorage.getItem('userCourse') || 'unknown';
        const percentage = Math.round((score / totalQuestions) * 100);

        analytics.logEvent('quiz_completion', {
            topic_id: topicId,
            score: score,
            total_questions: totalQuestions,
            percentage: percentage,
            course: course,
            timestamp: new Date().toISOString()
        });

        if (db) {
            db.collection('quiz_completions').add({
                topic_id: topicId,
                score: score,
                total_questions: totalQuestions,
                percentage: percentage,
                course: course,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                session_id: getSessionId()
            });
        }

        console.log('Quiz completion logged:', percentage + '%');
    } catch (error) {
        console.error('Error logging quiz completion:', error);
    }
};

// Generate or retrieve session ID
function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

// Export for use in other modules
export { analytics, db, isConfigured };
