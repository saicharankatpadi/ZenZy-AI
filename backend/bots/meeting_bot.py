import logging
import asyncio
from vision_agents.core import agents
from vision_agents.plugins import getstream, gemini
from vision_agents.core.edge.types import User
from vision_agents.core.events import CallSessionStartedEvent
from vision_agents.core.llm.events import RealtimeUserSpeechTranscriptionEvent

logger = logging.getLogger("meeting_bot")

meeting_data = {
    "transcript": [],
    "last_processed_text": "",
}

async def start_agent(call_id: str):
    agent = agents.Agent(
        edge=getstream.Edge(),
        agent_user=User(id="meeting-bot", name="Meeting Assistant"),
        instructions="You are a helpful meeting assistant. Give concise answers.",
        llm=gemini.Realtime(fps=0),
    )

    agent.edge._audio_enabled = True

    @agent.events.subscribe
    async def handle_session_started(event: CallSessionStartedEvent):
        await asyncio.sleep(4) # Allow WebRTC to settle
        await agent.say("Meeting assistant connected. How was your day?")

    @agent.events.subscribe
    async def handle_transcript(event: RealtimeUserSpeechTranscriptionEvent):
        text = event.text.strip() if event.text else ""
        # Ignore very short snippets or repeated text to save buffer
        if len(text) < 10 or text == meeting_data["last_processed_text"]:
            return
        
        meeting_data["last_processed_text"] = text
        meeting_data["transcript"].append({"text": text})
        
        # Only respond to general questions, let MaltBot handle the rest
        if "?" in text and not any(k in text.lower() for k in ["click", "screen", "open"]):
            response = await agent.llm.ask(f"User asked: {text}. Short reply:")
            await agent.say(response)

    await agent.create_user()
    call = agent.edge.client.video.call("default", call_id)
    async with agent.join(call):
        await agent.finish()