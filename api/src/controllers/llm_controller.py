from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.llm_service import LLMService

router = APIRouter(prefix="/chat")

llm = LLMService()

@router.websocket("/message")
async def chat(websocket: WebSocket):
    await websocket.accept()

    print("WebSocket client connected")

    try:
        # HANDSHAKE
        handshake = await websocket.receive_json()

        print("Handshake received:", handshake)

        if handshake.get("type") != "handshake":
            await websocket.send_json({
                "type": "error",
                "message": "Invalid handshake"
            })

            await websocket.close()
            return

        hardware_info = llm.get_hardware_info()
        await websocket.send_json({
            "type": "connected",
            "hardware": hardware_info
        })

        print("WebSocket handshake successful")

        # CHAT LOOP
        while True:

            request = await websocket.receive_json()

            print("Received:", request)

            # Only process messages
            if request.get("type") != "message":
                continue


            # Validate message
            message = request.get("message", "").strip()

            if not message:
                await websocket.send_json({
                    "type": "error",
                    "message": "Message cannot be empty"
                })
                continue

            # Stream LLM response
            try:

                for chunk in llm.stream_generate(request):

                    await websocket.send_json({
                        "type": "token",
                        "content": chunk
                    })

                # Tell frontend response is complete
                await websocket.send_json({
                    "type": "done"
                })

            except Exception as e:

                print("LLM error:", e)

                await websocket.send_json({
                    "type": "error",
                    "message": "Failed to generate response"
                })

    except WebSocketDisconnect:
        print("WebSocket client disconnected")

    except Exception as e:
        print("WebSocket error:", e)