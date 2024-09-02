from flask import Flask, request, jsonify
import requests
import json
from flask_cors import CORS
import sys
import os

# Update the Python path to include the root directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import configurations from config.py in the root directory
from config import OPENAI_API_KEY, TELEGRAM_API_KEY, CHAT_ID

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/fetch-questions', methods=['POST'])
def fetch_questions():
    data = request.json
    class_number = data.get('classNumber')
    topic = data.get('topic')
    sub_topic = data.get('subTopic')
    under_sub_topic = data.get('underSubTopic')

    # Validate inputs
    if not class_number or not topic or not sub_topic or not under_sub_topic:
        return jsonify({"error": "Missing required parameters"}), 400

    # Construct the prompt for OpenAI API
    prompt = (f"Create 10 NEET level MCQs from the NCERT book class {class_number}, topic {topic}, "
              f"sub topic {sub_topic}, under subtopic {under_sub_topic}, level tough in JSON format, "
              f"with correct answer and explanation strictly within 15 words. "
              f"Format: [{{\"question\": \"<question>\", \"options\": [\"<option1>\", "
              f"\"<option2>\", \"<option3>\", \"<option4>\"], \"answer\": \"<correct_answer>\", "
              f"\"explanation\": \"<short_explanation>\"}}]")

    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-3.5-turbo',
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': 1500,
            'temperature': 0.5,
        }
    )

    try:
        # Log response data for debugging
        print("Response from OpenAI:", response.text)
        response_data = response.json()
        choices = response_data.get('choices', [{}])
        content = choices[0].get('message', {}).get('content', '').strip()

        # Convert the response string to JSON
        questions_json = json.loads(content)

        # Log parsed JSON for debugging
        print("Parsed questions JSON:", questions_json)

        # Return the questions as JSON response
        return jsonify({"questions": questions_json})
    except Exception as e:
        print("Error parsing response:", e)
        return jsonify({"error": "Failed to fetch questions"}), 500

@app.route('/api/post-to-telegram', methods=['POST'])
def post_to_telegram():
    data = request.json
    selected_questions = data.get('questions')

    if not selected_questions:
        return jsonify({"error": "No questions provided"}), 400

    for question in selected_questions:
        # Prepare the poll question and options
        poll_question = question['question']
        poll_options = question['options']
        
        # Ensure there are at least 2 options
        if len(poll_options) < 2:
            return jsonify({"error": "Each poll must have at least 2 options"}), 400

        # Send the poll to the Telegram channel
        response = requests.post(
            f'https://api.telegram.org/bot{TELEGRAM_API_KEY}/sendPoll',
            data={
                'chat_id': CHAT_ID,
                'question': poll_question,
                'options': json.dumps(poll_options),  # Convert list to JSON string
                'is_anonymous': True,  # Poll is anonymous
                'type': 'quiz',  # Use 'quiz' type for questions with correct answers
                'correct_option_id': poll_options.index(question['answer'])  # Index of the correct answer
            }
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to post poll to Telegram"}), 500

    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
