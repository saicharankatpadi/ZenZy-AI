export const speak = async (text) => {
  const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
  
  if (elevenLabsKey) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          }),
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.log("ElevenLabs failed, using free fallback");
    }
  }
  
  // Free browser speech fallback
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => resolve(null);
    window.speechSynthesis.speak(utterance);
    resolve(null);
  });
};