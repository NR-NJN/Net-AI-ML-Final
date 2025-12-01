import random
import numpy as np
from typing import List, Dict, Tuple

class TrafficGenerator:
    def __init__(self, num_containers: int):
        self.num_containers = num_containers
        self.traffic_matrix: Dict[str, Dict[str, float]] = {}
        self.delayed_bursts: List[Tuple[int, str, str, float]] = []
        
         
        self.base_load = 10.0
        self.drift_rate = 0.5  

    def generate_temporal_traffic(self, step: int):
        self.traffic_matrix = self._get_traffic_for_step(step)

    def peek_traffic(self, step: int) -> Dict[str, Dict[str, float]]:
        return self._get_traffic_for_step(step)

    def _get_traffic_for_step(self, step: int) -> Dict[str, Dict[str, float]]:
        traffic = {}
        current_base = self.base_load + (step * self.drift_rate)
        
         
        for i in range(self.num_containers):
            src_id = f"Container_{i}"
            traffic[src_id] = {}
            for j in range(self.num_containers):
                if i == j: continue
                if random.random() < 0.1:
                    dst_id = f"Container_{j}"
                    vol = max(0, random.gauss(current_base, current_base * 0.2))
                    traffic[src_id][dst_id] = vol
         
        if 20 <= step < 30:
            self._add_burst(traffic, "Container_0", "Container_1", 5000.0, volatility=0.2)
            
         
        if 22 <= step < 32:
             
            self._add_burst(traffic, "Container_1", "Container_2", 4000.0, volatility=0.2)

        if 60 <= step < 70:
            self._add_burst(traffic, "Container_2", "Container_3", 5000.0, volatility=0.2)
            
        if 62 <= step < 72:
             self._add_burst(traffic, "Container_3", "Container_0", 4000.0, volatility=0.2)
             
         
         
        if random.random() < 0.3:  
            src = f"Container_{random.randint(0, self.num_containers-1)}"
            dst = f"Container_{random.randint(0, self.num_containers-1)}"
            if src != dst:
                self._add_burst(traffic, src, dst, 2000.0, volatility=0.5)

        return traffic

    def _add_burst(self, traffic, src, dst, mean_vol, volatility=0.0):
        noise = random.gauss(0, mean_vol * volatility)
        vol = max(0, mean_vol + noise)
        
        if src not in traffic: traffic[src] = {}
        traffic[src][dst] = vol
         
        if dst not in traffic: traffic[dst] = {}
        traffic[dst][src] = vol

    def get_traffic(self):
        return self.traffic_matrix
