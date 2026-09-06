import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Body
from services.llm_service import LLMService
from services.parts_service import PartsService


router = APIRouter(prefix="/chat")

llm = LLMService()
parts_service = PartsService(llm_service=llm)



@router.post("/separator")
async def get_separator(request: dict = Body(...)):
    sample = request.get("sample")
    if not sample:
        return {
            "success": False,
            "message": "Invalid sample"
        }
    print(request)
    separator = llm.find_separator(sample)

    if separator:
        return {
            "success": True,
            "separator": separator
        }
    else:
        return {
            "success": False,
            "separator": separator
        }

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
                original_query = request.get("message", "")

                category = llm.classify(
                    original_query
                ).strip().lower()

                print(f"category: {category}")

                if category == "task":

                    # Run task
                    task_result = await asyncio.to_thread(
                        parts_service.analyse
                    )

                    # # Feed task result back to chatbot
                    # chat_request = {
                    #     "message": original_query,
                    #     "history": [
                    #         {
                    #             "role": "user",
                    #             "message": original_query
                    #         },
                    #         {
                    #             "role": "assistant",
                    #             "message": task_result
                    #         }
                    #     ]
                    # }
                    

                    # # Generate final chatbot response
                    # for chunk in llm.stream_generate(chat_request):
                    #     await websocket.send_json({
                    #         "type": "token",
                    #         "content": chunk
                    #     })
                    # await websocket.send_json({
                    #     "type": "done"
                    # })

                    await websocket.send_json({
                        "type": "task_result",
                        "content": task_result
                    })

                    await websocket.send_json({
                        "type": "done"
                    })

                else:
                    for chunk in llm.stream_generate(request):
                        await websocket.send_json({
                            "type": "token",
                            "content": chunk
                        })
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