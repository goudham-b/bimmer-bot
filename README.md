Requirement:
 - Node: v22.15.0
 - uv
 - python 3.13

Used Techs:
 - vite + react.js
 - sockets
 - fastapi
 - uv
 - huggingface
 - pandas (task 3)

Commands to run:
 - Backend: `uv run uvicorn main:app --app-dir src --reload`
 - Frontend:
    1. `npm install`
    2. `npm run dev`

Commands to run directly on Docker environment:
 - `docker build -t bimmer-bot .`
 - `docker run --rm -p 8000:8000 -p 5173:5173 -v ${home}/.cache/huggingface:/root/.cache/huggingface bimmer-bot`
 - Note: I mounted my hf cache path to reduce the start time. You can update the `.env` with your cached model and mount your volume to quickly start the app.

 Frontend URL: http://localhost:5173
 Backend URL: http://localhost:8000

Refer screenshots folder:
![BimmerBot chat interface](screenshots/chat_res.png)

![Backend processing logs](screenshots/backend_log.png)


KNOWN ISSUES & IMPROVEMENTS:
 - Running on docker giving response as full string instead of streaming word by word.
 - Socket connection can be handled in a better way.
 - TASK 3 reponse can be fed to chat bot to give its opinion.
 - Chat history is not implemented fully.
