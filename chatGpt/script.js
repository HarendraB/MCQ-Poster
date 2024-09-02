let currentQuestionIndex = 0;
let questions = [];
let selectedQuestions = [];

function populateDropdown(dropdown, options) {
    dropdown.innerHTML = '<option value="">Select an option</option>';
    options.forEach(option => {
        dropdown.innerHTML += `<option value="${option}">${option}</option>`;
    });
}

async function loadCurriculum() {
    try {
        const response = await fetch('curriculum.json');
        const data = await response.json();

        const classSelect = document.getElementById('classSelect');
        populateDropdown(classSelect, Object.keys(data));

        classSelect.addEventListener('change', function () {
            const selectedClass = this.value;
            const topicSelect = document.getElementById('topicSelect');
            const subtopicSelect = document.getElementById('subtopicSelect');
            const underSubtopicSelect = document.getElementById('underSubtopicSelect');

            if (selectedClass) {
                populateDropdown(topicSelect, Object.keys(data[selectedClass]));
                subtopicSelect.innerHTML = '<option value="">Select Sub-topic</option>';
                underSubtopicSelect.innerHTML = '<option value="">Select Specific Topic</option>';
            } else {
                topicSelect.innerHTML = '<option value="">Select Topic</option>';
                subtopicSelect.innerHTML = '<option value="">Select Sub-topic</option>';
                underSubtopicSelect.innerHTML = '<option value="">Select Specific Topic</option>';
            }
        });

        document.getElementById('topicSelect').addEventListener('change', function () {
            const selectedClass = classSelect.value;
            const selectedTopic = this.value;
            const subtopicSelect = document.getElementById('subtopicSelect');
            const underSubtopicSelect = document.getElementById('underSubtopicSelect');

            if (selectedTopic) {
                populateDropdown(subtopicSelect, Object.keys(data[selectedClass][selectedTopic]));
                underSubtopicSelect.innerHTML = '<option value="">Select Specific Topic</option>';
            } else {
                subtopicSelect.innerHTML = '<option value="">Select Sub-topic</option>';
                underSubtopicSelect.innerHTML = '<option value="">Select Specific Topic</option>';
            }
        });

        document.getElementById('subtopicSelect').addEventListener('change', function () {
            const selectedClass = classSelect.value;
            const selectedTopic = document.getElementById('topicSelect').value;
            const selectedSubTopic = this.value;
            const underSubtopicSelect = document.getElementById('underSubtopicSelect');

            if (selectedSubTopic) {
                populateDropdown(underSubtopicSelect, data[selectedClass][selectedTopic][selectedSubTopic]);
            } else {
                underSubtopicSelect.innerHTML = '<option value="">Select Specific Topic</option>';
            }
        });
    } catch (error) {
        console.error('Failed to load curriculum:', error);
    }
}

document.getElementById('fetchQuestions').addEventListener('click', async () => {
    const classNumber = document.getElementById('classSelect').value;
    const topic = document.getElementById('topicSelect').value;
    const subTopic = document.getElementById('subtopicSelect').value;
    const underSubTopic = document.getElementById('underSubtopicSelect').value;

    if (!classNumber || !topic || !subTopic || !underSubTopic) {
        alert('Please select all options to fetch questions.');
        return;
    }

    document.getElementById('loading-bar').style.display = 'block';

    try {
        const response = await fetch('http://127.0.0.1:5001/api/fetch-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ classNumber, topic, subTopic, underSubTopic })
        });

        const data = await response.json();
        if (data.error) {
            alert('Error fetching questions: ' + data.error);
        } else {
            questions = data.questions;
            currentQuestionIndex = 0;
            selectedQuestions = [];
            displayQuestion();
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to fetch questions. Please try again.');
    }

    document.getElementById('loading-bar').style.display = 'none';
});

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        alert('You have completed all questions.');
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById('question-sequence').textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('question-text').textContent = question.question;

    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    question.options.forEach(option => {
        const li = document.createElement('li');
        li.textContent = option;
        li.addEventListener('click', () => {
            document.querySelectorAll('#options-list li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            showExplanation(question.explanation);
        });
        optionsList.appendChild(li);
    });

    // Add checkbox to select the question for posting
    const selectCheckbox = document.getElementById('select-question');
    selectCheckbox.checked = selectedQuestions.includes(question);
    selectCheckbox.onclick = () => {
        if (selectCheckbox.checked) {
            selectedQuestions.push(question);
        } else {
            selectedQuestions = selectedQuestions.filter(q => q !== question);
        }
    };

    document.querySelector('.question-viewer').style.display = 'block';
    document.getElementById('postToTelegram').style.display = 'inline-block';
}

function showExplanation(explanation) {
    const explanationDiv = document.getElementById('explanation');
    explanationDiv.textContent = explanation;
    explanationDiv.style.display = 'block';
}

document.getElementById('nextQuestion').addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

document.getElementById('postToTelegram').addEventListener('click', async () => {
    if (selectedQuestions.length === 0) {
        alert('Please select at least one question to post.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5001/api/post-to-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: selectedQuestions })
        });

        if (response.ok) {
            alert('Selected questions posted to Telegram successfully!');
        } else {
            alert('Failed to post selected questions to Telegram.');
        }
    } catch (error) {
        console.error('Error posting to Telegram:', error);
        alert('Failed to post selected questions to Telegram. Please try again.');
    }
});

loadCurriculum();
