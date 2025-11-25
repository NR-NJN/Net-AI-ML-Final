from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from simulation.topology import NetworkTopology
from simulation.traffic import TrafficGenerator
from ml.environment import DataCenterEnv
from ml.agent import RLAgent
from models import TopologyState, OptimizationResult
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

env = DataCenterEnv()
agent = RLAgent(env)

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

@app.get("/api/state", response_model=TopologyState)
def get_state():
    return env.get_current_state()

@app.post("/api/reset")
def reset_simulation():
    env.reset()
    return {"message": "Simulation reset", "state": env.get_current_state()}

@app.post("/api/optimize")
def optimize_network(steps: int = 10):
    initial_cost = env._calculate_network_cost()
    if not agent.model:
        agent.train(total_timesteps=2000)
        env.reset()
    
    obs = env._get_obs()
    for _ in range(steps):
        action = agent.predict(obs)
        obs, _, _, _, _ = env.step(action)
        
    final_cost = env._calculate_network_cost()
    
    return {
        "initial_cost": initial_cost,
        "final_cost": final_cost,
        "steps_taken": steps,
        "final_state": env.get_current_state()
    }

@app.post("/api/burst")
def trigger_burst():
    new_cost = env.trigger_burst()
    return {
        "message": "Traffic burst triggered!",
        "new_cost": new_cost,
        "state": env.get_current_state()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
