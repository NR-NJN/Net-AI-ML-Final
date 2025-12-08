# AI Data Center Optimizer

An AI driven simulation of a data center that optimizes container placement in real-time to minimize network congestion and energy usage.

## Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**

### 1. Backend Setup (Simulation & AI)
The backend runs the traffic simulation and the Reinforcement Learning agent.

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  (Optional) Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the Server:
    ```bash
    python main.py
    ```
    *Server running at `http://localhost:8000`*

### 2. Frontend Setup (Visualization)
The frontend visualizes the network topology, traffic flows, and metrics.

1.  Open a new terminal and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
    *UI running at `http://localhost:5173`*

## How to Run the Demo
Refer to `implementation.md` for a complete set of steps.

