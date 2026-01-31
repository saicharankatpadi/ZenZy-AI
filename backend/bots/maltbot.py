import logging
import asyncio
from vision_agents.core import agents
from vision_agents.plugins import getstream, gemini
from vision_agents.core.edge.types import User
from vision_agents.core.events import CallSessionStartedEvent
from vision_agents.core.llm.events import RealtimeUserSpeechTranscriptionEvent

logger = logging.getLogger("maltbot")

async def start_maltbot(call_id: str):
    agent = agents.Agent(
        edge=getstream.Edge(),
        agent_user=User(id="maltbot", name="MaltBot"),
        instructions="You provide technical screen steps. Max 2 steps per reply.",
        llm=gemini.Realtime(fps=0),
    )

    agent.edge._audio_enabled = True

    @agent.events.subscribe
    async def on_start(event: CallSessionStartedEvent):
        await asyncio.sleep(10) # Long delay to let Meeting Bot finish greeting
        await agent.say("MaltBot ready for screen guidance.")

    @agent.events.subscribe
    async def on_transcript(event: RealtimeUserSpeechTranscriptionEvent):
        text = event.text.lower() if event.text else ""
        keywords = ["click", "see", "screen", "button", "where", "how do i"]
        
        if any(k in text for k in keywords):
            # Small artificial delay to prevent overlapping audio
            await asyncio.sleep(1) 
            answer = await agent.llm.ask(f"User needs help on screen: {text}")
            await agent.say(answer)

    await agent.create_user()
    call = agent.edge.client.video.call("default", call_id)
    async with agent.join(call):
        await agent.finish()