import networkx as nx
import random
from typing import List, Dict, Tuple

class NetworkTopology:
    def __init__(self, num_pods: int = 4, servers_per_pod: int = 4):
        """
        Initializes a simplified Fat-Tree-like topology.
        
        Structure:
        - Root (Core)
        - Pods (Aggregation)
        - Servers (Leaves)
        
        Args:
            num_pods: Number of aggregation switches (pods).
            servers_per_pod: Number of servers connected to each pod.
        """
        self.graph = nx.Graph()
        self.num_pods = num_pods
        self.servers_per_pod = servers_per_pod
        self.servers: List[str] = []
        self.containers: Dict[str, str] = {} # container_id -> server_id
        
        self._build_topology()

    def _build_topology(self):
        """Constructs the graph nodes and edges."""
        self.root_id = "Core_Switch"
        self.graph.add_node(self.root_id, type="core", layer=0)
        
        for i in range(self.num_pods):
            pod_id = f"Agg_Switch_{i}"
            self.graph.add_node(pod_id, type="aggregation", layer=1)
            self.graph.add_edge(self.root_id, pod_id, weight=10) # Inter-pod link cost
            
            for j in range(self.servers_per_pod):
                server_id = f"Server_{i}_{j}"
                self.graph.add_node(server_id, type="server", layer=2, capacity=10)
                self.graph.add_edge(pod_id, server_id, weight=1) # Intra-pod link cost
                self.servers.append(server_id)

    def place_containers(self, num_containers: int):
        """Randomly places containers on servers."""
        self.containers.clear()
        for i in range(num_containers):
            container_id = f"Container_{i}"
            # Simple random placement with capacity check could be added here
            # For now, just random server
            server_id = random.choice(self.servers)
            self.containers[container_id] = server_id

    def move_container(self, container_id: str, new_server_id: str):
        """Moves a container to a new server."""
        if container_id in self.containers and new_server_id in self.servers:
            self.containers[container_id] = new_server_id
            return True
        return False

    def get_distance(self, server_a: str, server_b: str) -> int:
        """Calculates the hop distance/cost between two servers."""
        if server_a == server_b:
            return 0
        return nx.shortest_path_length(self.graph, source=server_a, target=server_b, weight='weight')

    def get_state(self):
        """Returns the current state for visualization."""
        return {
            "nodes": [{"id": n, **self.graph.nodes[n]} for n in self.graph.nodes],
            "links": [{"source": u, "target": v} for u, v in self.graph.edges],
            "containers": self.containers
        }
