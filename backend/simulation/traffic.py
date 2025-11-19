import random
from typing import List, Dict

class TrafficGenerator:
    def __init__(self, num_containers: int):
        """
        Generates traffic patterns between containers.
        
        Args:
            num_containers: Total number of containers in the system.
        """
        self.num_containers = num_containers
        self.traffic_matrix: Dict[str, Dict[str, float]] = {}

    def generate_random_traffic(self, density: float = 0.2, max_throughput: float = 100.0):
        """
        Generates a random sparse traffic matrix.
        
        Args:
            density: Probability of a link existing between two containers.
            max_throughput: Maximum traffic volume on a link.
        """
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
        """
        Generates traffic where containers form tight communication groups.
        This simulates microservices applications.
        """
        self.traffic_matrix = {}
        containers = [f"Container_{i}" for i in range(self.num_containers)]
        random.shuffle(containers)
        
        # Split into clusters
        cluster_size = self.num_containers // num_clusters
        for i in range(num_clusters):
            cluster_members = containers[i*cluster_size : (i+1)*cluster_size]
            
            # Heavy traffic within cluster
            for src in cluster_members:
                if src not in self.traffic_matrix:
                    self.traffic_matrix[src] = {}
                for dst in cluster_members:
                    if src != dst and random.random() < 0.7: # High probability
                        self.traffic_matrix[src][dst] = random.uniform(50, 100)
            
            # Light traffic between clusters
            # (Simulating API calls between services)
            # ... (omitted for simplicity, can be added if needed)

    def get_traffic(self):
        return self.traffic_matrix
