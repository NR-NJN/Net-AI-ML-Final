import networkx as nx
import random
from typing import List, Dict, Tuple

class NetworkTopology:
    def __init__(self, num_pods: int = 4, servers_per_pod: int = 4):
        self.graph = nx.Graph()
        self.num_pods = num_pods
        self.servers_per_pod = servers_per_pod
        self.servers: List[str] = []
        self.containers: Dict[str, str] = {}  
        
        self._build_topology()

    def _build_topology(self):  
        self.root_id = "Core_Switch"
        self.graph.add_node(self.root_id, type="core", layer=0)
        
        for i in range(self.num_pods):
            pod_id = f"Agg_Switch_{i}"
            self.graph.add_node(pod_id, type="aggregation", layer=1)
            self.graph.add_edge(self.root_id, pod_id, weight=10)  
            
            for j in range(self.servers_per_pod):
                server_id = f"Server_{i}_{j}"
                self.graph.add_node(server_id, type="server", layer=2, capacity=10)
                self.graph.add_edge(pod_id, server_id, weight=1)  
                self.servers.append(server_id)

    def place_containers(self, num_containers: int):
        self.containers.clear()
        
         
        def get_server_in_pod(pod_index):
             
             
            srv_idx = random.randint(0, self.servers_per_pod - 1)
            return f"Server_{pod_index}_{srv_idx}"

        for i in range(num_containers):
            container_id = f"Container_{i}"
            
             
            if i == 0:
                 
                server_id = get_server_in_pod(0)
            elif i == 1:
                 
                server_id = get_server_in_pod(2)
            elif i == 2:
                 
                server_id = get_server_in_pod(1)
            elif i == 3:
                 
                server_id = get_server_in_pod(3)
            else:
                 
                server_id = random.choice(self.servers)
                
            self.containers[container_id] = server_id

    def move_container(self, container_id: str, new_server_id: str):
        
        if container_id in self.containers and new_server_id in self.servers:
            self.containers[container_id] = new_server_id
            return True
        return False

    def get_distance(self, server_a: str, server_b: str) -> int:
        
        if server_a == server_b:
            return 0
        return nx.shortest_path_length(self.graph, source=server_a, target=server_b, weight='weight')

    def get_state(self):
        
        return {
            "nodes": [{"id": n, **self.graph.nodes[n]} for n in self.graph.nodes],
            "links": [{"source": u, "target": v} for u, v in self.graph.edges],
            "containers": self.containers
        }

    def get_state_with_traffic(self, traffic_matrix: Dict[str, Dict[str, float]]):
       
         
        link_loads = {(u, v): 0.0 for u, v in self.graph.edges}
         
        for u, v in list(link_loads.keys()):
            link_loads[(v, u)] = 0.0

         
        if traffic_matrix:
            for src_c, destinations in traffic_matrix.items():
                if src_c not in self.containers: continue
                src_s = self.containers[src_c]
                
                for dst_c, volume in destinations.items():
                    if dst_c not in self.containers: continue
                    dst_s = self.containers[dst_c]
                    
                    if src_s == dst_s: continue  
                    
                     
                    path = nx.shortest_path(self.graph, src_s, dst_s)
                    
                     
                    for i in range(len(path) - 1):
                        u, v = path[i], path[i+1]
                        if (u, v) in link_loads:
                            link_loads[(u, v)] += volume
                        elif (v, u) in link_loads:
                            link_loads[(v, u)] += volume
  
        
        links_data = []
        for u, v in self.graph.edges:
            load = link_loads.get((u, v), 0) + link_loads.get((v, u), 0)
            links_data.append({
                "source": u, 
                "target": v, 
                "load": load
            })

        return {
            "nodes": [{"id": n, **self.graph.nodes[n]} for n in self.graph.nodes],
            "links": links_data,
            "containers": self.containers
        }
