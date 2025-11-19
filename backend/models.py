from pydantic import BaseModel
from typing import List, Dict, Any

class TopologyState(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]
    containers: Dict[str, str]

class OptimizationResult(BaseModel):
    initial_cost: float
    final_cost: float
    steps_taken: int
    final_state: TopologyState
