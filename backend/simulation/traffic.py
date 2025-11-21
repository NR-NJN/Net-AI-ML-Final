import random
from typing import List, Dict

class TrafficGenerator:
    def __init__(self, num_containers: int):
        self.num_containers = num_containers
        self.traffic_matrix: Dict[str, Dict[str, float]] = {}

    def generate_random_traffic(self, density: float = 0.2, max_throughput: float = 100.0):
        self.traffic_matrix = {}
        for i in range(self.num_containers):
            src_id = f"Container_{i}"
            self.traffic_matrix[src_id] = {}
            for j in range(self.num_containers):
                if i == j:
                    continue
                
                if random.random() < density:
                    dst_id = f"Container_{j}"
import random
from typing import List, Dict
import numpy as np

class TrafficGenerator:
    def __init__(self, num_containers: int):
        self.num_containers = num_containers
        self.traffic_matrix: Dict[str, Dict[str, float]] = {}

    def generate_random_traffic(self, density: float = 0.2, max_throughput: float = 100.0):
        self.traffic_matrix = {}
        for i in range(self.num_containers):
            src_id = f"Container_{i}"
            self.traffic_matrix[src_id] = {}
            for j in range(self.num_containers):
                if i == j:
                    continue
                
                if random.random() < density:
                    dst_id = f"Container_{j}"
                    volume = random.uniform(1.0, max_throughput)
                    self.traffic_matrix[src_id][dst_id] = volume

    def generate_clustered_traffic(self, num_clusters: int = 3):
        self.traffic_matrix = {}
        containers = [f"Container_{i}" for i in range(self.num_containers)]
        
         
        clusters = np.array_split(containers, num_clusters)
        
        for cluster in clusters:
            for src in cluster:
                if src not in self.traffic_matrix:
                    self.traffic_matrix[src] = {}
                
                 
                for dst in cluster:
                    if src != dst:
                        self.traffic_matrix[src][dst] = np.random.uniform(50, 100)
                
                 
                for other_cluster in clusters:
                    if other_cluster is not cluster:
                        for dst in other_cluster:
                            if np.random.random() < 0.1:  
                                self.traffic_matrix[src][dst] = np.random.uniform(1, 10)

    def generate_burst_traffic(self, src_id: str, dst_id: str, volume: float = 10000.0):
        if src_id not in self.traffic_matrix:
            self.traffic_matrix[src_id] = {}
        self.traffic_matrix[src_id][dst_id] = volume
         
        if dst_id not in self.traffic_matrix:
            self.traffic_matrix[dst_id] = {}
        self.traffic_matrix[dst_id][src_id] = volume

    def get_traffic(self):
        return self.traffic_matrix
