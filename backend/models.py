from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TopologyState(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]
    containers: Dict[str, str]
    container_chains: Dict[str, str] = {}
    active_servers: List[str] = []
    active_chains: List[str] = []
    step: int = 0

class OptimizationResult(BaseModel):
    initial_cost: float
    final_cost: float
    steps_taken: int
    final_state: TopologyState
    metrics: Optional[Dict[str, Any]] = None
