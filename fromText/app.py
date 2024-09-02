# fromText/app.py
from flask import Flask, request, jsonify
import requests
import json
from flask_cors import CORS
from config import OPENAI_API_KEY, TELEGRAM_API_KEY, CHAT_ID

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    data = request.json
    input_text = data.get('inputText')

    if not input_text:
        return jsonify({"error": "No input text provided"}), 400

    prompt = (f"Using the provided content, Extract MCQs in JSON format, do not write anything else into the response else it will cause problem in parsing the json "
              f"with correct answers and explanations within 15 words. "
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
                {'role': 'user', 'content': f'{prompt}\n\nContent: {input_text}'}
            ],
            'max_tokens': 4000,
            'temperature': 0.5,
        }
    )

    try:
        response_data = response.json()
        choices = response_data.get('choices', [{}])
        content = choices[0].get('message', {}).get('content', '').strip()

        questions_json = json.loads(content)

        return jsonify({"questions": questions_json})
    except Exception as e:
        print("Error parsing response:", e)
        return jsonify({"error": "Failed to generate questions"}), 500

@app.route('/api/post-to-telegram', methods=['POST'])
def post_to_telegram():
    data = request.json
    questions = data.get('questions')

    if not questions:
        return jsonify({"error": "No questions provided"}), 400

    for question in questions:
        poll_question = question['question']
        poll_options = question['options']

        if len(poll_options) < 2:
            return jsonify({"error": "Each poll must have at least 2 options"}), 400

        response = requests.post(
            f'https://api.telegram.org/bot{TELEGRAM_API_KEY}/sendPoll',
            data={
                'chat_id': CHAT_ID,
                'question': poll_question,
                'options': json.dumps(poll_options),
                'is_anonymous': True,
                'type': 'quiz',
                'correct_option_id': poll_options.index(question['answer'])
            }
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to post poll to Telegram"}), 500

    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
