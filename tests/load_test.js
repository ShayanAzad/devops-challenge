import http from "k6/http";
import { check, sleep } from "k6";

// ── Load profile ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "30s", target: 20 },   // ramp up to 20 VUs
    { duration: "1m",  target: 20 },   // hold at 20 VUs
    { duration: "10s", target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95th percentile under 500 ms
    http_req_failed:   ["rate<0.01"],  // error rate under 1 %
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:8000";

export default function () {
  // Write a key
  const writeRes = http.post(`${BASE}/write/perf_key?value=hello`);
  check(writeRes, { "write 200": (r) => r.status === 200 });

  // Read root
  const readRes = http.get(`${BASE}/`);
  check(readRes, { "read 2xx": (r) => r.status >= 200 && r.status < 300 });

  sleep(1);
}
