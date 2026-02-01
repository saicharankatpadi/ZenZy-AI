import logging
import asyncio
import os
from uuid import uuid4
from dotenv import load_dotenv

# ================= LOGGING =================
logging.getLogger("aiortc").setLevel(logging.ERROR)
logging.getLogger("vision_agents").setLevel(logging.WARNING)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================= ENV =================
load_dotenv()

# ================= IMPORTS =================
from vision_agents.core import agents
from vision_agents.plugins import getstream, gemini
from vision_agents.core.edge.types import User

from vision_agents.core.events import (
    CallSessionStartedEvent,
    CallSessionEndedEvent,
    CallSessionParticipantJoinedEvent,
    CallSessionParticipantLeftEvent,
)

from vision_agents.core.llm.events import (
    RealtimeUserSpeechTranscriptionEvent,
)

# ================= GLOBAL STATE =================
meeting_data = {
    "transcript": [],
    "response_task": None,
}

jarvis_awake = False  # 🔥 WAKE WORD STATE


# ================= SUMMARY =================
def generate_summary():
    if not meeting_data["transcript"]:
        return "No discussion points recorded yet."

    summary = "Here is the meeting summary so far:\n"
    for entry in meeting_data["transcript"]:
        summary += f"- [{entry['speaker']}]: {entry['text']}\n"
    return summary


# ================= MAIN =================
async def start_agent(call_id: str):
    global jarvis_awake

    logger.info("🤖 Booting Meeting Assistant + Jarvis")
    logger.info(f"📞 Call ID: {call_id}")

    # ✅ STABLE GEMINI REALTIME
    llm = gemini.Realtime(fps=1)

    edge = getstream.Edge(
        enable_audio=True,
        enable_video=True
    )

    agent = agents.Agent(
        edge=edge,
        agent_user=User(
            id="meeting-assistant-bot",
            name="Jarvis Assistant"
        ),
        instructions="""
You are Jarvis, a meeting assistant.

Rules:
- Stay silent unless the user says "Hey Jarvis".
- After waking, answer once, then go silent again.
- If asked to summarize, summarize the meeting.
- Keep responses short and clear.
""",
        llm=llm,
    )

    # 🔥 DO NOT LISTEN TO YOURSELF
    agent.edge.ignore_agent_audio = True

    # ================= EVENTS =================

    @agent.events.subscribe
    async def on_call_started(event: CallSessionStartedEvent):
        logger.info("🎙️ Call connected")
        await asyncio.sleep(3.5)
        await agent.say(
            "At your service. Say 'Hey Jarvis' when you need me."
        )

    @agent.events.subscribe
    async def on_participant_joined(event: CallSessionParticipantJoinedEvent):
        if event.participant.user.id != agent.agent_user.id:
            logger.info(f"👤 Joined: {event.participant.user.name}")

    @agent.events.subscribe
    async def on_participant_left(event: CallSessionParticipantLeftEvent):
        if event.participant.user.id != agent.agent_user.id:
            logger.info(f"👋 Left: {event.participant.user.name}")

    @agent.events.subscribe
    async def on_transcript(event: RealtimeUserSpeechTranscriptionEvent):
        global jarvis_awake

        if not event.text or not event.text.strip():
            return

        text = event.text.strip()
        text_lower = text.lower()
        speaker = getattr(event, "participant_id", "User")

        meeting_data["transcript"].append({
            "speaker": speaker,
            "text": text,
        })

        logger.info(f"[{speaker}]: {text}")

        # 🔥 WAKE WORD
        if "hey jarvis" in text_lower:
            jarvis_awake = True
            await agent.say("Yes, I am listening.")
            return

        # ❌ Ignore unless awake
        if not jarvis_awake:
            return

        jarvis_awake = False  # sleep again

        # Cancel any pending response
        if meeting_data["response_task"] and not meeting_data["response_task"].done():
            meeting_data["response_task"].cancel()

        async def respond():
            await asyncio.sleep(1.2)

            if "summarize" in text_lower:
                await agent.say(generate_summary())
            else:
                prompt = f"User said: '{text}'. Respond helpfully."
                reply = await agent.llm.ask(prompt)
                await agent.say(reply)

        meeting_data["response_task"] = asyncio.create_task(respond())

    @agent.events.subscribe
    async def on_call_ended(event: CallSessionEndedEvent):
        logger.info("🛑 Call ended")

    # ================= JOIN CALL =================
    await agent.create_user()
    call = agent.edge.client.video.call("default", call_id)

    async with agent.join(call):
        logger.info("🚀 JARVIS ACTIVE")
        await asyncio.Event().wait()  # 🔥 KEEP ALIVE SAFELY


# ================= ENTRY =================
if __name__ == "__main__":
    call_id = os.getenv("CALL_ID", f"meeting-{uuid4().hex[:8]}")
    try:
        asyncio.run(start_agent(call_id))
    except KeyboardInterrupt:
        logger.info("🛑 Stopped by user")
