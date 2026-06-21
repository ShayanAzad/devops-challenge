# Project Docs

FastAPI app that talks to Redis. I containerized it, added CI/CD, logging, and a load test.

---

## Running it

```bash
docker compose up -d --build
```

- App → http://localhost:8000
- Grafana → http://localhost:3000 (admin / admin)
- Prometheus → http://localhost:9090

```bash
# seed a key first, then read it
curl -X POST "http://localhost:8000/write/example_key?value=hello"
curl http://localhost:8000/
```

---

## What I did and why

**Dockerfile** — switched to a two-stage build with `python:3.11-slim`. The first stage installs dependencies, the second stage is a clean image that just copies them over. Drops the image from ~1 GB to ~150 MB. Added a non-root user for basic security hygiene.

**CI/CD (GitHub Actions)** — We set up a single automated pipeline that runs every time you push code. It does:
1. **Lint** — checks code style for errors.
2. **Build & Start Infrastructure** — builds the Docker image and completely boots up the platform (FastAPI, Redis, Monitoring) inside the GitHub runner.
3. **Run Performance Test** — automatically runs the `k6` load test against the running infrastructure.
This is simple, fault-tolerant (if the load test fails, the pipeline fails), and requires zero passwords or SSH keys to be configured!

**Logs (Loki + Promtail)** — Promtail watches the Docker socket and ships all container logs to Loki. You can view them in Grafana next to your metrics without running a heavy ELK stack. Loki is much lighter because it only indexes labels, not the full log text.

**Metrics (Prometheus + Grafana)** — Prometheus scrapes every 15 seconds. Grafana has both datasources pre-configured so you don't have to click anything on first boot.

**Load test (k6)** — ramps to 20 virtual users over 30 seconds, holds for a minute, then ramps down. Passes if p95 response time is under 500ms and error rate is under 1%.

```bash
k6 run tests/load_test.js
```


---

## Stop

```bash
docker compose down
```
