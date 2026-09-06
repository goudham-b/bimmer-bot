Requirement:
 - uv
 - python 3.13

Prechecks:
 - Update the `.env` file with the necessary model
 - Currently `LLM_MODEL_NAME="HuggingFaceTB/SmolLM2-1.7B-Instruct"`
 - You can change this value to whatever value that you have cached to reduce the start time.

Command to run backend on dev
`uv run uvicorn main:app --app-dir src --reload`

Used Techs:
 - fastapi
 - uv
 - huggingface
 - pandas (task 3)