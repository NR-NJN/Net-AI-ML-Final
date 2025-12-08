import urllib.request
import json
import time

BASE_URL = "http://localhost:8000/api"

def get_json(url):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

def post_json(url, params=None):
    if params:
         
        url += "?" + urllib.parse.urlencode(params)
    
    req = urllib.request.Request(url, method="POST")
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def test_optimize():
    print("Fetching initial state...")
    try:
        initial_state = get_json(f"{BASE_URL}/state")
         
        
        print("\nTriggering Optimize (5 steps)...")
        result = post_json(f"{BASE_URL}/optimize", params={"steps": 5})
        final_state = result['final_state']
        
         
        
         
        moves = 0
        for cid, sid in initial_state['containers'].items():
            if final_state['containers'][cid] != sid:
                print(f"Moved: {cid} from {sid} to {final_state['containers'][cid]}")
                moves += 1
        
        print(f"\nTotal Moves: {moves}")
        
        if moves == 0:
            print("FAILURE: No containers moved.")
        else:
            print("SUCCESS: Containers moved.")

         
        initial_active = set(initial_state['containers'].values())
        final_active = set(final_state['containers'].values())
        print(f"Active Servers: Initial={len(initial_active)}, Final={len(final_active)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_optimize()
