from fastapi import FastAPI, HTTPException
import redis

app = FastAPI()
redis_client = redis.Redis(host='redis', port=6379, db=0)

@app.get("/")
def read_root():
    value = redis_client.get("example_key")
    if value is None:
        raise HTTPException(status_code=404, detail="Key not found")
    return {"message": value.decode()}

@app.post("/write/{key}")
def write_to_redis(key: str, value: str):
    redis_client.set(key, value)
    return {"message": f"Key '{key}' set to '{value}'"}