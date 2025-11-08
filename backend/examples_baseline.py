from tracker import track
import time, math, os

def cpu_burn(seconds: float):
    # simple CPU loop so CodeCarbon sees real power draw
    t_end = time.perf_counter() + seconds
    x = 0.0
    while time.perf_counter() < t_end:
        # a few math ops per loop
        x = (x + 1.234567) * 1.000001
        x = math.sin(x) * math.cos(x)

@track(run_name="baseline", requests=30,  # we’ll do 10 inferences in one run
       meta={"precision":"fp16","spec_decode":False,"quant":None,"region":"eu-west-1"},
       country_iso="IE", measure_secs=0.5)
def batch_inference():
    for _ in range(30):
        cpu_burn(1.0)   # ~1.0s of CPU work per request

if __name__ == "__main__":
    # start fresh log for clarity
    if os.path.exists("run_log.jsonl"):
        os.remove("run_log.jsonl")
    batch_inference()
