# Generate a spoken summary of the CarbonWise report using ElevenLabs.
import os, certifi
os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
import os, time
from tracker import track
from elevenlabs import ElevenLabs, save, play
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("ELEVEN_API_KEY")
VOICE_ID = os.getenv("ELEVEN_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")

# Prepare client
client = ElevenLabs(api_key=API_KEY)

# Prepare text (replace with live summary later)
SUMMARY = (
    "CarbonWise AI Summary. "
    "Baseline energy was roughly zero point three nine kilowatt hours, "
    "optimized energy zero point two four kilowatt hours. "
    "That’s about thirty eight percent less carbon emissions. "
    "Region Advisor suggests Paris as a seventy percent cleaner option. "
    "Thank you for making AI more sustainable."
)

@track(
    run_name="elevenlabs_tts",
    requests=1,
    meta={"source":"elevenlabs","region":"eu-west-1","notes":"voice summary generation"},
    measure_secs=0.5
)
def generate_voice():
    print("Generating voice summary...")
    t0 = time.time()
    audio = client.text_to_speech.convert(
        voice_id=VOICE_ID,
        model_id="eleven_turbo_v2",  # fastest/lowest latency model
        text=SUMMARY,
        output_format="mp3_44100_128"
    )
    elapsed = (time.time() - t0) * 1000
    print(f"Voice generated in {elapsed:.1f} ms")

    out_file = "carbonwise_summary.mp3"
    save(audio, out_file)
    print(f"Saved to {out_file}")
    os.startfile(out_file)  # plays back locally (optional for demo)

if __name__ == "__main__":
    if not API_KEY:
        raise SystemExit("Set ELEVEN_API_KEY in .env")
    generate_voice()
