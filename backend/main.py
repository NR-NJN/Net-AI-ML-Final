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
         
         
        agent.train(total_timesteps=20000)
        env.reset()
    
     
    env.traffic_gen.steps_per_epoch = steps
    
    obs = env._get_obs()
    last_info = {}
    
     
     
    for _ in range(steps):
        action = agent.predict(obs)
        obs, reward, terminated, truncated, last_info = env.step(action)
        
    final_cost = env._calculate_network_cost()
    
     
    if "active_servers" not in last_info:
        active_servers = list(set(env.topology.containers.values()))
        last_info["active_servers"] = active_servers
        last_info["energy_cost"] = len(active_servers) * 100.0  

     
    metrics = {
        "step": env.current_step,
        "reward": float(last_info.get("reward", 0)),  
        "network_cost": float(last_info.get("network_cost", 0)),
        "energy_cost": float(last_info.get("energy_cost", 0)),
        "active_servers": last_info.get("active_servers", 0),
        "active_chains": last_info.get("active_chains", [])
    }
    
    return {
        "initial_cost": initial_cost,
        "final_cost": final_cost,
        "steps_taken": steps,
        "final_state": env.get_current_state(),
        "metrics": metrics  
    }

@app.post("/api/burst")
def trigger_burst():
    new_cost = env.trigger_burst()
    return {
        "message": "Traffic burst triggered!",
        "new_cost": new_cost,
        "state": env.get_current_state()
    }

@app.post("/api/force_chain")
def force_chain():
     
     
    env.traffic_gen.chains[0].start()
    
     
    obs = env._get_obs()
    action = agent.predict(obs)
    env.step(action)
    
    return {"message": "Login Flow FORCE STARTED", "state": env.get_current_state()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
