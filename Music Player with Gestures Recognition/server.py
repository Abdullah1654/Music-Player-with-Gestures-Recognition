import cv2
import mediapipe as mp
import asyncio
import websockets

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

async def send_gesture(websocket, gesture):
    print(f"Sending gesture: {gesture}")
    await websocket.send(gesture)

async def gesture_server(websocket, path):
    print("Client connected, starting gesture detection...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Webcam opened successfully.")
    with mp_hands.Hands(
        model_complexity=0,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as hands:
        print("MediaPipe Hands initialized.")
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            image.flags.writeable = False
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            gesture_detected = None
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    handIndex = results.multi_hand_landmarks.index(hand_landmarks)
                    handLabel = results.multi_handedness[handIndex].classification[0].label
                    handLandmarks = []

                for landmarks in hand_landmarks.landmark:
                    handLandmarks.append([landmarks.x, landmarks.y])

                thumb_is_extended = handLandmarks[4][0] > handLandmarks[3][0] if handLabel == "Left" else handLandmarks[4][0] < handLandmarks[3][0]
                thumb_is_folded = handLandmarks[4][1] > handLandmarks[3][1] if handLabel == "Left" else handLandmarks[4][1] < handLandmarks[3][1]
                index_is_folded = handLandmarks[8][1] > handLandmarks[6][1]
                middle_is_folded = handLandmarks[12][1] > handLandmarks[10][1]
                index_is_extended = handLandmarks[8][1] < handLandmarks[6][1]
                middle_is_extended = handLandmarks[12][1] < handLandmarks[10][1]
                ring_is_folded = handLandmarks[16][1] > handLandmarks[14][1]
                pinky_is_folded = handLandmarks[20][1] > handLandmarks[18][1]
                ring_is_extended = handLandmarks[20][1] < handLandmarks[18][1]
                pinky_is_extended = handLandmarks[16][1] < handLandmarks[14][1]

                if thumb_is_extended and not index_is_extended and middle_is_folded and ring_is_folded and pinky_is_folded:
                    gesture_detected = "thumbs_up"
                elif not thumb_is_extended and not index_is_extended and not middle_is_extended and ring_is_folded and pinky_is_folded:
                    gesture_detected = "thumbs_down"
                elif not thumb_is_extended and index_is_extended and middle_is_extended and ring_is_folded and pinky_is_folded:
                    gesture_detected = "peace_sign"
                elif thumb_is_extended and index_is_extended and middle_is_extended and ring_is_extended and pinky_is_extended:
                    gesture_detected = "open_palm"
                elif thumb_is_extended and index_is_extended and not middle_is_extended and ring_is_folded and pinky_is_folded:
                    gesture_detected = "finger_gun"
                # elif thumb_is_folded and index_is_extended and not middle_is_extended and not ring_is_extended and pinky_is_folded:
                #     gesture_detected = "horn"
                

                mp_drawing.draw_landmarks(
                    image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            if gesture_detected:
                print(f"Gesture detected: {gesture_detected}")
                await send_gesture(websocket, gesture_detected)
            else:
                print("Unknown gesture detected, ignoring...")


            # Instead of waiting for a key press to break the loop,
            # let's add a small delay to slow down the processing speed
            await asyncio.sleep(0.5)

    cap.release()
    cv2.destroyAllWindows()
    print("Gesture detection stopped.")

async def main():
    print("Starting WebSocket server...")
    async with websockets.serve(gesture_server, "localhost", 8888):
        print("WebSocket server is running.")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())


# run 'python server.py' to start the websocket server
# http://127.0.0.1:5501/songs.html    run this on your web-browser to run the application