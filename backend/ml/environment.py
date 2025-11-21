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
        
         
        self.topology = NetworkTopology(num_pods, servers_per_pod)
        self.traffic_gen = TrafficGenerator(num_containers)
        
        self.servers = self.topology.servers
        self.num_servers = len(self.servers)
        
         
        self.action_space = spaces.MultiDiscrete([num_containers, self.num_servers])
        
         
        self.observation_space = spaces.Box(
            low=0, 
            high=self.num_servers - 1, 
            shape=(num_containers,), 
            dtype=np.int32
        )
        
        self.current_traffic = None
        self.current_step = 0
        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        self.current_step = 0
        self.topology.place_containers(self.num_containers)
        
         
        self.traffic_gen.generate_temporal_traffic(self.current_step)
        self.current_traffic = self.traffic_gen.get_traffic()
        
        return self._get_obs(), {"step": self.current_step}

    def get_current_state(self):
        state = self.topology.get_state_with_traffic(self.current_traffic)
        state["step"] = self.current_step
        return state

    def step(self, action):
        self.current_step += 1
        
         
        container_idx, server_idx = action
        container_id = f"Container_{container_idx}"
        new_server_id = self.servers[server_idx]
        self.topology.move_container(container_id, new_server_id)
        
         
        self.traffic_gen.generate_temporal_traffic(self.current_step)
        self.current_traffic = self.traffic_gen.get_traffic()
        
         
        total_cost = self._calculate_network_cost()
        reward = -total_cost
        
        terminated = False
        truncated = False
        
        return self._get_obs(), reward, terminated, truncated, {"cost": total_cost, "step": self.current_step}

    def _get_obs(self):
        obs = np.zeros(self.num_containers, dtype=np.int32)
        for i in range(self.num_containers):
            c_id = f"Container_{i}"
            s_id = self.topology.containers[c_id]
            s_idx = self.servers.index(s_id)
            obs[i] = s_idx
        return obs

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

    def trigger_burst(self):
        c1 = "Container_0"
        c2 = "Container_1"
        
         
        self.traffic_gen.generate_burst_traffic(c1, c2, volume=5000.0)
        self.current_traffic = self.traffic_gen.get_traffic()
        
        return self._calculate_network_cost()
