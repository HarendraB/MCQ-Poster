@echo off
title NEET MCQ App Server
echo Starting NEET MCQ App...

REM Navigate to the project directory
cd C:\Users\haren\Desktop\MCQ Poster

REM Activate the Python virtual environment
call venv\Scripts\activate

REM Start the backend server
start cmd /k "cd C:\Users\haren\Desktop\MCQ Poster && python run.py"

REM Start the frontend server on port 8000
start cmd /k "cd C:\Users\haren\Desktop\MCQ Poster && python -m http.server 8000"

echo Servers are up and running.
