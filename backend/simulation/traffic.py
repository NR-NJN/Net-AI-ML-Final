import random
import numpy as np
from typing import List, Dict, Tuple, Optional

class ServiceChain:
    def __init__(self, name: str, nodes: List[str], delays: List[int], volumes: List[float]):
        self.name = name
        self.nodes = nodes  
        self.delays = delays  
        self.volumes = volumes  
        self.active = False
        self.current_step_idx = -1
        self.steps_since_last_trigger = 0

    def start(self):
        if not self.active:
            self.active = True
            self.current_step_idx = 0
            self.steps_since_last_trigger = 0

    def reset(self):
        self.active = False
        self.current_step_idx = -1
        self.steps_since_last_trigger = 0

    def tick(self) -> Optional[Tuple[str, str, float]]:
        if not self.active:
            return None
        result = None

        if self.current_step_idx < len(self.nodes) - 1:
             
            target_delay = 0 if self.current_step_idx == 0 else self.delays[self.current_step_idx - 1]
            
            if self.steps_since_last_trigger >= target_delay:
                 
                src = self.nodes[self.current_step_idx]
                dst = self.nodes[self.current_step_idx + 1]
                vol = self.volumes[self.current_step_idx]
                result = (src, dst, vol)
                
                 
                self.current_step_idx += 1
                self.steps_since_last_trigger = 0
            else:
                self.steps_since_last_trigger += 1
        else:
             
            self.active = False
            
        return result

class TrafficGenerator:
    def __init__(self, num_containers: int):
        self.num_containers = num_containers
        self.traffic_matrix: Dict[str, Dict[str, float]] = {}
        
        self.base_load = 10.0
        self.drift_rate = 0.5
        
         
        self.chains = [
             
             
            ServiceChain("Login Flow", ["Container_0", "Container_1", "Container_2"], [2, 2], [5000.0, 4000.0]),
    
            ServiceChain("Data Pipeline", ["Container_2", "Container_3", "Container_0"], [2, 2], [5000.0, 4000.0])
        ]

    def reset(self):
        for chain in self.chains:
            chain.reset()
        self.traffic_matrix = {}

    def generate_temporal_traffic(self, step: int):
        self.traffic_matrix = {}
        cycle_pos = (np.sin(step / 60.0) + 1.0) / 2.0  
        current_base = self.base_load + (cycle_pos * 40.0) 
        
         
        for i in range(self.num_containers):
            src_id = f"Container_{i}"
            self.traffic_matrix[src_id] = {}
            for j in range(self.num_containers):
                if i == j: continue
                if random.random() < 0.1:
                    dst_id = f"Container_{j}"
                    vol = max(0, random.gauss(current_base, current_base * 0.2))
                    self.traffic_matrix[src_id][dst_id] = vol

        if not self.chains[0].active and random.random() < 0.02:
            self.chains[0].start()
            
        if not self.chains[1].active and random.random() < 0.02:
            self.chains[1].start()

        
        for chain in self.chains:
            burst = chain.tick()
            if burst:
                src, dst, vol = burst
                self._add_burst(self.traffic_matrix, src, dst, vol, volatility=0.2)
        if random.random() < 0.05:
            src = f"Container_{random.randint(0, self.num_containers-1)}"
            dst = f"Container_{random.randint(0, self.num_containers-1)}"
            if src != dst:
                self._add_burst(self.traffic_matrix, src, dst, 2000.0, volatility=0.5)

    def _add_burst(self, traffic, src, dst, mean_vol, volatility=0.0):
        noise = random.gauss(0, mean_vol * volatility)
        vol = max(0, mean_vol + noise)
        if src not in traffic: traffic[src] = {}
        traffic[src][dst] = vol
        if dst not in traffic: traffic[dst] = {}
        traffic[dst][src] = vol

    def get_traffic(self):
        return self.traffic_matrix
        
    def peek_traffic(self, step: int):
        self.generate_temporal_traffic(step)
        return self.traffic_matrix

    def get_active_chains(self):
        return [c.name for c in self.chains if c.active]
