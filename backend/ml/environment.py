import gymnasium as gym
from gymnasium import spaces
import numpy as np
from simulation.topology import NetworkTopology
from simulation.traffic import TrafficGenerator
from ml.predictor import TrafficPredictor

class DataCenterEnv(gym.Env):
    def __init__(self, num_pods=4, servers_per_pod=4, num_containers=20):
        super(DataCenterEnv, self).__init__()
        
        self.num_pods = num_pods
        self.servers_per_pod = servers_per_pod
        self.num_containers = num_containers     
        self.topology = NetworkTopology(num_pods, servers_per_pod)
        self.traffic_gen = TrafficGenerator(num_containers)
        
         
        self.predictor = TrafficPredictor(num_containers)
        self.predictor.train(self.traffic_gen)
        
        self.servers = self.topology.servers
        self.num_servers = len(self.servers)
        
         
        self.action_space = spaces.MultiDiscrete([num_containers, self.num_servers])
        self.observation_space = spaces.Box(
            low=0, 
            high=np.inf, 
            shape=(3 * num_containers,), 
            dtype=np.float32
        )
        
        self.current_traffic = None
        self.current_step = 0
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.topology.place_containers(self.num_containers)
        self.traffic_gen.reset()
        self.predictor.reset()
        
         
        self.traffic_gen.generate_temporal_traffic(self.current_step)
        self.current_traffic = self.traffic_gen.get_traffic()
        
         
        self.predictor.predict(self.current_traffic)
        
        return self._get_obs(), {"step": self.current_step}

    def get_current_state(self):
        state = self.topology.get_state_with_traffic(self.current_traffic)
        state["step"] = self.current_step
        state["active_chains"] = self.traffic_gen.get_active_chains()
        # Pass the set of active servers for visualization
        state["active_servers"] = list(set(self.topology.containers.values()))
        return state

    def step(self, action):
        self.current_step += 1
        container_idx, server_idx = action
        container_id = f"Container_{container_idx}"
        new_server_id = self.servers[server_idx]
        self.topology.move_container(container_id, new_server_id)
        self.traffic_gen.generate_temporal_traffic(self.current_step)
        self.current_traffic = self.traffic_gen.get_traffic()
        pred_traffic, uncertainty = self.predictor.predict(self.current_traffic)
        network_cost = self._calculate_network_cost()
        risk_penalty = np.sum(uncertainty) * 0.1
        
        # Energy Cost Calculation
        # Count unique servers hosting at least one container
        active_servers = set(self.topology.containers.values())
        num_active_servers = len(active_servers)
        
        # Energy Penalty: Let's say each active server costs 25000 units
        # This creates a trade-off: 
        # - Saving 1 active server (25000 cost) vs. 
        # - Increasing network latency by spreading out
        energy_cost = num_active_servers * 25000.0
        
        # Debug: Print breakdown
        print(f"Step {self.current_step}: Network={network_cost:.1f}, Energy={energy_cost:.1f}, Active={num_active_servers}")
        
        total_cost = network_cost + risk_penalty + energy_cost
        reward = -total_cost
        
        terminated = False
        truncated = False
        
        return self._get_obs(), reward, terminated, truncated, {
            "cost": float(total_cost), 
            "network_cost": float(network_cost),
            "energy_cost": float(energy_cost),
            "active_servers": int(num_active_servers),
            "step": int(self.current_step)
        }

    def _get_obs(self):
         
        placements = np.zeros(self.num_containers, dtype=np.float32)
        for i in range(self.num_containers):
            c_id = f"Container_{i}"
            s_id = self.topology.containers[c_id]
            s_idx = self.servers.index(s_id)
            placements[i] = s_idx
            
         
        pred_traffic, uncertainty = self.predictor.predict(self.current_traffic)
        
        return np.concatenate([placements, pred_traffic, uncertainty])

    def _calculate_network_cost(self):
        total_cost = 0
        for src_id, destinations in self.current_traffic.items():
            src_server = self.topology.containers[src_id]
            for dst_id, volume in destinations.items():
                if dst_id in self.topology.containers:
                    dst_server = self.topology.containers[dst_id]
                    distance = self.topology.get_distance(src_server, dst_server)
                    total_cost += volume * distance
        return total_cost

    def render(self):
        print(f"Current Network Cost: {self._calculate_network_cost()}")
