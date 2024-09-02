document.addEventListener('DOMContentLoaded', function() {
    const postToFirebaseButton = document.getElementById('postToFirebase');
    postToFirebaseButton.addEventListener('click', pushToFirebase);
});

// Firebase configuration should be imported from config.js located in the root directory
import { firebaseConfig } from '../config.js';  // Adjust path to correctly locate the config.js file

function pushToFirebase() {
    // Extract the question data from the HTML elements
    var subject = document.getElementById('classSelect').value.trim();
    var topic = document.getElementById('topicSelect').value.trim();
    var quizId = document.getElementById('subtopicSelect').value.trim();

    // Extracting the question and options from the DOM
    var question = document.getElementById('question-text').innerText.trim();
    var optionsList = document.getElementById('options-list').children;
    var option1Text = optionsList[0] ? optionsList[0].innerText.trim() : '';
    var option2Text = optionsList[1] ? optionsList[1].innerText.trim() : '';
    var option3Text = optionsList[2] ? optionsList[2].innerText.trim() : '';
    var option4Text = optionsList[3] ? optionsList[3].innerText.trim() : '';
    
    var option1Image = ""; // Define how to retrieve the image URL if applicable
    var option2Image = ""; // Define how to retrieve the image URL if applicable
    var option3Image = ""; // Define how to retrieve the image URL if applicable
    var option4Image = ""; // Define how to retrieve the image URL if applicable

    var correctOption = ""; // Define how to identify the correct option
    var explanation = document.getElementById('explanation').innerText.trim();
    var imageUrl = ""; // Define how to retrieve the image URL if applicable
    var levelOfQuestion = ""; // Define how to retrieve the level of the question if applicable

    // Initialize Firebase app if it hasn't been initialized yet
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Reference to the Firebase Realtime Database
    var database = firebase.database();
    var questionsRef = database.ref('questions');

    // Creating a new question reference under the selected subject, topic, and quiz ID
    var newQuestionRef = questionsRef.child(subject).child(topic).child(quizId).push();

    // Structuring the question data to be stored in Firebase
    var questionData = {
        "Question": question,
        "Options": {
            "Option1": {
                "text": option1Text,
                "imageURL": option1Image
            },
            "Option2": {
                "text": option2Text,
                "imageURL": option2Image
            },
            "Option3": {
                "text": option3Text,
                "imageURL": option3Image
            },
            "Option4": {
                "text": option4Text,
                "imageURL": option4Image
            }
        },
        "CorrectAnswer": correctOption,
        "Explanation": explanation,
        "ImageUrl": imageUrl,
        "LevelOfQuestion": levelOfQuestion // Include level of question in question data
    };

    // Storing the structured question data in Firebase
    newQuestionRef.set(questionData).then(function() {
        alert('MCQ pushed to Firebase successfully!');
    }).catch(function(error) {
        console.error('Error pushing MCQ to Firebase: ', error);
        alert('Failed to push MCQ to Firebase. Please try again.');
    });
}
