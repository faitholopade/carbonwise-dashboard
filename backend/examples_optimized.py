from tracker import track
import time, math

def cpu_burn(seconds: float):
    t_end = time.perf_counter() + seconds
    x = 0.0
    while time.perf_counter() < t_end:
        x = (x + 1.234567) * 1.000001
        x = math.sin(x) * math.cos(x)

@track(run_name="optimized", requests=30,
       meta={"precision":"int4","spec_decode":True,"quant":"int4","region":"europe-west9"},
       country_iso="IE", measure_secs=0.5)
def batch_inference():
    for _ in range(30):
        cpu_burn(0.6)   # ~40% less compute per request

if __name__ == "__main__":
    batch_inference()
