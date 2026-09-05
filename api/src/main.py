from fastapi import FastAPI
from controllers.llm_controller import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the controller with its specific prefix
app.include_router(chat_router)

@app.get("/health")
async def health():
    return {"status": "ok"}