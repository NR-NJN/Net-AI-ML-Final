import urllib.request
import json

BASE_URL = "http://localhost:8000/api"

def get_json(url):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

def test_chains():
    print("Fetching initial state...")
    try:
        data = get_json(f"{BASE_URL}/state")
        
         
        chains = data.get('container_chains', {})
        print(f"Container Chains Found: {len(chains)}")
        
         
        counts = {}
        for _, chain in chains.items():
            counts[chain] = counts.get(chain, 0) + 1
            
        print("Chain Distribution:", counts)
        
        if len(chains) > 0 and "Login Flow" in counts:
            print("SUCCESS: Chain data is present.")
        else:
            print("FAILURE: Chain data missing or empty.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chains()
