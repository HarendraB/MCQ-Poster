from chatGpt.app import app as chatGpt_app
from formMCQs.app import app as formMCQs_app
from fromText.app import app as fromText_app
from waitress import serve
import threading

def run_chatGpt_app():
    serve(chatGpt_app, host='0.0.0.0', port=5001)

def run_formMCQs_app():
    serve(formMCQs_app, host='0.0.0.0', port=5002)

def run_fromText_app():
    serve(fromText_app, host='0.0.0.0', port=5003)

if __name__ == '__main__':
    # Create threads for each app
    chatGpt_thread = threading.Thread(target=run_chatGpt_app)
    formMCQs_thread = threading.Thread(target=run_formMCQs_app)
    fromText_thread = threading.Thread(target=run_fromText_app)

    # Start threads
    chatGpt_thread.start()
    formMCQs_thread.start()
    fromText_thread.start()

    # Wait for threads to complete (which won't happen, as the apps run indefinitely)
    chatGpt_thread.join()
    formMCQs_thread.join()
    fromText_thread.join()
