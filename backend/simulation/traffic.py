import random
import numpy as np
from typing import List, Dict, Tuple, Optional

class ServiceChain:
    def __init__(self, name: str, nodes: List[str], delays: List[int], volumes: List[float]):
        self.name = name
        self.nodes = nodes # [C0, C1, C2]
        self.delays = delays # [2, 2] (Delay after step 0, Delay after step 1)
        self.volumes = volumes # [5000, 4000]
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
        """
        Advances the chain. Returns (src, dst, volume) if a traffic burst happens this step.
        """
        if not self.active:
            return None

        # Check if we are currently executing a transfer
        # Logic: 
        # Idx 0: C0->C1. Immediate start? Or wait? 
        # Let's say start() triggers the first hop immediately.
        
        result = None
        
        # If we are at a valid index
        if self.current_step_idx < len(self.nodes) - 1:
            # Check if delay requirement is met
            target_delay = 0 if self.current_step_idx == 0 else self.delays[self.current_step_idx - 1]
            
            if self.steps_since_last_trigger >= target_delay:
                # Trigger traffic!
                src = self.nodes[self.current_step_idx]
                dst = self.nodes[self.current_step_idx + 1]
                vol = self.volumes[self.current_step_idx]
                result = (src, dst, vol)
                
                # Advance
                self.current_step_idx += 1
                self.steps_since_last_trigger = 0
            else:
                self.steps_since_last_trigger += 1
        else:
            # Chain complete
            self.active = False
            
        return result

class TrafficGenerator:
    def __init__(self, num_containers: int):
        self.num_containers = num_containers
        self.traffic_matrix: Dict[str, Dict[str, float]] = {}
        
        self.base_load = 10.0
        self.drift_rate = 0.5
        
        # Define Organic Service Chains
        self.chains = [
            # Chain 1: User Login Flow (Web -> Auth -> DB)
            # C0 -> C1 (Wait 2) -> C2
            ServiceChain("Login Flow", ["Container_0", "Container_1", "Container_2"], [2, 2], [5000.0, 4000.0]),
            
            # Chain 2: Data Processing Pipeline (Ingest -> Process -> Store)
            # C2 -> C3 (Wait 2) -> C0
            ServiceChain("Data Pipeline", ["Container_2", "Container_3", "Container_0"], [2, 2], [5000.0, 4000.0])
        ]

    def reset(self):
        for chain in self.chains:
            chain.reset()
        self.traffic_matrix = {}

    def generate_temporal_traffic(self, step: int):
        self.traffic_matrix = {}
        current_base = self.base_load + (step * self.drift_rate)
        
        # 1. Background Noise
        for i in range(self.num_containers):
            src_id = f"Container_{i}"
            self.traffic_matrix[src_id] = {}
            for j in range(self.num_containers):
                if i == j: continue
                if random.random() < 0.1:
                    dst_id = f"Container_{j}"
                    vol = max(0, random.gauss(current_base, current_base * 0.2))
                    self.traffic_matrix[src_id][dst_id] = vol

        # 2. Probabilistic Chain Triggers
        # 5% chance to start Login Flow
        if not self.chains[0].active and random.random() < 0.05:
            self.chains[0].start()
            
        # 5% chance to start Data Pipeline
        if not self.chains[1].active and random.random() < 0.05:
            self.chains[1].start()

        # 3. Process Active Chains
        for chain in self.chains:
            burst = chain.tick()
            if burst:
                src, dst, vol = burst
                self._add_burst(self.traffic_matrix, src, dst, vol, volatility=0.2)

        # 4. Micro-Bursts (Noise)
        if random.random() < 0.2:
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
        """
        Generates traffic for the step and returns it.
        WARNING: This advances the state of the generator (chains).
        """
        self.generate_temporal_traffic(step)
        return self.traffic_matrix

    def get_active_chains(self):
        return [c.name for c in self.chains if c.active]
