import gymnasium as gym
from gymnasium import spaces
import numpy as np
from simulation.topology import NetworkTopology
from simulation.traffic import TrafficGenerator

class DataCenterEnv(gym.Env):
    def __init__(self, num_pods=4, servers_per_pod=4, num_containers=20):
        super(DataCenterEnv, self).__init__()
        
        self.num_pods = num_pods
        self.servers_per_pod = servers_per_pod
        self.num_containers = num_containers
        
        # Initialize Simulation Components
        self.topology = NetworkTopology(num_pods, servers_per_pod)
        self.traffic_gen = TrafficGenerator(num_containers)
        
        self.servers = self.topology.servers
        self.num_servers = len(self.servers)
        
        # Action Space: [Container_ID, Server_ID]
        self.action_space = spaces.MultiDiscrete([num_containers, self.num_servers])
        
        # Observation Space: 
        # [0..N-1]: Server Index for each container
        # [N..2N-1]: Predicted Incoming Traffic for next step (scaled / 1000)
        self.observation_space = spaces.Box(
            low=0, 
            high=np.inf, # Traffic can be high
            shape=(2 * num_containers,), 
            dtype=np.float32 # Changed to float for traffic
        )
        
        self.current_traffic = None
        self.current_step = 0
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        self.current_step = 0
        self.topology.place_containers(self.num_containers)
        
        # Initial traffic (Step 0)
        self.traffic_gen.generate_temporal_traffic(self.current_step)
        self.current_traffic = self.traffic_gen.get_traffic()
        
        return self._get_obs(), {"step": self.current_step}

    def get_current_state(self):
        state = self.topology.get_state_with_traffic(self.current_traffic)
        state["step"] = self.current_step
        return state

    def step(self, action):
        self.current_step += 1
        
        # 1. Apply Action (Move Container)
        container_idx, server_idx = action
        container_id = f"Container_{container_idx}"
        new_server_id = self.servers[server_idx]
        self.topology.move_container(container_id, new_server_id)
        
        # 2. Update Environment (New Traffic for this step)
        self.traffic_gen.generate_temporal_traffic(self.current_step)
        self.current_traffic = self.traffic_gen.get_traffic()
        
        # 3. Calculate Reward
        total_cost = self._calculate_network_cost()
        reward = -total_cost
        
        terminated = False
        truncated = False
        
        return self._get_obs(), reward, terminated, truncated, {"cost": total_cost, "step": self.current_step}

    def _get_obs(self):
        # Part 1: Container Placements
        placements = np.zeros(self.num_containers, dtype=np.float32)
        for i in range(self.num_containers):
            c_id = f"Container_{i}"
            s_id = self.topology.containers[c_id]
            s_idx = self.servers.index(s_id)
            placements[i] = s_idx
            
        # Part 2: Predicted Future Traffic (Oracle)
        # Peek at next step's traffic
        next_traffic = self.traffic_gen.peek_traffic(self.current_step + 1)
        
        incoming_traffic = np.zeros(self.num_containers, dtype=np.float32)
        for src, destinations in next_traffic.items():
            for dst, vol in destinations.items():
                # Extract index from "Container_X"
                try:
                    dst_idx = int(dst.split("_")[1])
                    if 0 <= dst_idx < self.num_containers:
                        incoming_traffic[dst_idx] += vol
                except:
                    pass
        
        # Scale traffic to be somewhat comparable to server indices (0-16)
        # 5000 traffic -> 5.0
        scaled_traffic = incoming_traffic / 1000.0
        
        return np.concatenate([placements, scaled_traffic])

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
