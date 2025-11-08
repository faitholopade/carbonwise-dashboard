import os, time, uuid, json, requests
from typing import List, Dict, Any
from dotenv import load_dotenv
from tracker import track

load_dotenv()  # loads HATHORA_URL, HATHORA_TOKEN, HATHORA_REGION_HINT

HATHORA_URL = os.environ.get("HATHORA_URL", "").strip()
HATHORA_TOKEN = os.environ.get("HATHORA_TOKEN", "").strip()
REGION_HINT = os.environ.get("HATHORA_REGION_HINT", "eu-west-1")

PROMPTS: List[str] = [
    "In one sentence, explain why reducing AI energy use matters for climate.",
    "Give a concise tip for speeding up LLM inference without hurting quality.",
    "Name two ways to make inference more carbon-efficient."
]

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {HATHORA_TOKEN}",
}

def _chat(payload: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.post(HATHORA_URL, headers=HEADERS, json=payload, timeout=30)
    r.raise_for_status()
    return r.json()

@track(
    run_name="hathora",
    requests=len(PROMPTS),
    meta={"source":"hathora","region":REGION_HINT,"notes":"remote LLM via Hathora"},
    country_iso=None,
    measure_secs=0.5
)
def batch_hathora():
    for prompt in PROMPTS:
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 128,
            "temperature": 0.7,
        }
        t0 = time.time()
        try:
            resp = _chat(payload)
            elapsed = (time.time() - t0) * 1000.0
            # Optional: print a short preview (keep it quiet for demos)
            content = resp.get("choices", [{}])[0].get("message", {}).get("content", "")[:80].replace("\n", " ")
            print(f"[hathora] {elapsed:.0f}ms  :: {content}")
        except Exception as e:
            print(f"[hathora] request failed: {e}")

if __name__ == "__main__":
    if not HATHORA_URL or not HATHORA_TOKEN:
        raise SystemExit("Set HATHORA_URL and HATHORA_TOKEN in backend/.env")
    batch_hathora()
    print("Hathora batch complete. Logged to run_log.jsonl.")
