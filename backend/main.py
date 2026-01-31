

import logging
import asyncio
import os
from uuid import uuid4
from dotenv import load_dotenv

# Suppress aiortc VP8 decoder warnings
logging.getLogger("aiortc.codecs.vpx").setLevel(logging.ERROR)
logging.getLogger("aiortc").setLevel(logging.WARNING)

# Vision Agents imports
from vision_agents.core import agents
from vision_agents.plugins import getstream, gemini
from vision_agents.core.edge.types import User

# ===== SAFE BYPASS FOR REMOVED EVENT (DO NOT REMOVE) =====
try:
    from vision_agents.core.events import AgentSayErrorEvent as PluginErrorEvent
except ImportError:
    class PluginErrorEvent(Exception):
        error_message = "Unknown plugin error"
        is_fatal = False
# ========================================================

# Core events
from vision_agents.core.events import (
    CallSessionParticipantJoinedEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallSessionEndedEvent,
)

# LLM events
from vision_agents.core.llm.events import (
    RealtimeUserSpeechTranscriptionEvent,
    LLMResponseChunkEvent
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Meeting data storage
meeting_data = {
    "transcript": [],
    "is_active": False,
    "response_task": None,
    "agent": None,
}


async def start_agent(call_id: str):
    logger.info("🤖 Starting Meeting Assistant...")
    logger.info(f"📞 Call ID: {call_id}")

    agent = agents.Agent(
        edge=getstream.Edge(),
        agent_user=User(
            id="meeting-assistant-bot",
            name="Meeting Assistant"
        ),
        instructions="""
        You are a meeting transcription bot and Jarvis-style assistant.
        CRITICAL RULES:
        1. Listen to users continuously.
        2. Provide helpful suggestions, answers, or feedback after a user stops speaking.
        3. Only respond with useful content; do not repeat user speech.
        4. If asked to "summarize", summarize all meeting points so far.
        """,
        llm=gemini.Realtime(fps=0),
    )

    # Enable audio so assistant can speak
    agent.edge._audio_enabled = True

    meeting_data["agent"] = agent
    meeting_data["call_id"] = call_id

    # ===== Event handlers =====
    @agent.events.subscribe
    async def handle_session_started(event: CallSessionStartedEvent):
        meeting_data["is_active"] = True
        logger.info("🎙️ Meeting started")

    @agent.events.subscribe
    async def handle_participant_joined(event: CallSessionParticipantJoinedEvent):
        if event.participant.user.id == "meeting-assistant-bot":
            return
        logger.info(f"👤 Participant joined: {event.participant.user.name}")

    @agent.events.subscribe
    async def handle_participant_left(event: CallSessionParticipantLeftEvent):
        if event.participant.user.id == "meeting-assistant-bot":
            return
        logger.info(f"👋 Participant left: {event.participant.user.name}")

    async def delayed_response(user_text: str):
        """Wait a bit before responding like a real assistant"""
        await asyncio.sleep(1.5)
        try:
            if not agent:
                return

            if "summarize" in user_text.lower():
                summary_text = generate_summary()
                await agent.say(summary_text)  # Speak the summary
            else:
                prompt = f"User said: '{user_text}'. Provide a helpful response."
                response = await agent.llm.ask(prompt)
                await agent.say(response)  # Speak the response

        except Exception as e:
            logger.error(f"❌ Jarvis response error: {e}")

    @agent.events.subscribe
    async def handle_transcript(event: RealtimeUserSpeechTranscriptionEvent):
        if not event.text or not event.text.strip():
            return

        speaker = getattr(event, 'participant_id', 'Unknown')
        meeting_data["transcript"].append({
            "speaker": speaker,
            "text": event.text,
            "timestamp": getattr(event, 'timestamp', None)
        })
        logger.info(f"[{speaker}]: {event.text}")

        # Cancel previous response task
        if meeting_data.get("response_task") and not meeting_data["response_task"].done():
            meeting_data["response_task"].cancel()

        # Start new delayed response
        meeting_data["response_task"] = asyncio.create_task(delayed_response(event.text.strip()))

    @agent.events.subscribe
    async def handle_llm_response(event: LLMResponseChunkEvent):
        if hasattr(event, "delta") and event.delta:
            logger.info(f"🤖 Assistant (partial): {event.delta}")

    @agent.events.subscribe
    async def handle_session_ended(event: CallSessionEndedEvent):
        meeting_data["is_active"] = False
        logger.info("🛑 Meeting ended")

    @agent.events.subscribe
    async def handle_errors(event: PluginErrorEvent):
        logger.error(f"❌ Plugin error: {getattr(event, 'error_message', event)}")

    # ===== Create user and join call safely =====
    await agent.create_user()
    call = agent.edge.client.video.call("default", call_id)

    try:
        async with agent.join(call):
            logger.info("🎙️ MEETING ASSISTANT ACTIVE")
            try:
                await agent.finish()
            except Exception as e:
                if "InvalidStateError" in str(e):
                    logger.warning(f"⚠️ Ignored WebRTC state error: {e}")
                else:
                    raise
    except Exception as e:
        logger.error(f"❌ Could not join call safely: {e}")


def generate_summary():
    """Generate a simple text summary of all transcript messages"""
    if not meeting_data["transcript"]:
        return "No meeting points recorded yet."
    summary = "Here is the meeting summary so far:\n"
    for entry in meeting_data["transcript"]:
        speaker = entry.get("speaker", "Unknown")
        text = entry.get("text", "")
        summary += f"- [{speaker}]: {text}\n"
    return summary


def print_meeting_summary():
    print("\n📋 MEETING SUMMARY")
    for entry in meeting_data["transcript"]:
        print(f"[{entry['speaker']}]: {entry['text']}")


if __name__ == "__main__":
    call_id = os.getenv("CALL_ID", f"meeting-{uuid4().hex[:8]}")
    try:
        asyncio.run(start_agent(call_id))
    except KeyboardInterrupt:
        print("Stopped")
    finally:
        if meeting_data["transcript"]:
            print_meeting_summary()