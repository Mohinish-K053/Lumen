from fastapi import WebSocket
from services.ai_service import predict_from_bytes
import base64
import json


async def handle_websocket_session(websocket: WebSocket, session_id: int, db):
    """
    Receives base64 frames from frontend over WebSocket.
    Runs prediction and sends back cognitive load result.
    Also saves each prediction to cognitive_logs.
    """
    from models.session_model import CognitiveLog
    from sqlalchemy import insert

    await websocket.accept()

    try:
        while True:
            # Frontend sends JSON: { "frame": "<base64 image>" }
            data = await websocket.receive_text()
            payload = json.loads(data)

            frame_b64 = payload.get("frame")
            if not frame_b64:
                await websocket.send_text(json.dumps({"error": "No frame received"}))
                continue

            image_bytes = base64.b64decode(frame_b64)

            # Call SageMaker
            result = predict_from_bytes(image_bytes)

            # Save to DB
            log = CognitiveLog(
                session_id     = session_id,
                emotion        = result["emotion"],
                cognitive_load = result["cognitive_load"],
                confidence     = result["confidence"]
            )
            db.add(log)
            await db.commit()

            # Send result back to frontend
            await websocket.send_text(json.dumps(result))

    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
    finally:
        await websocket.close()