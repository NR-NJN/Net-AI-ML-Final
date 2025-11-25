# Data Center Container Placement Optimization 

A visual demonstration of an RL agent optimizing container placement in a data center network to minimize traffic costs and handle proactive bursts.

## Prerequisites

*   **Python 3.8+**
*   **Node.js 16+** & **npm**

## Project Structure

*   `backend/`: Python FastAPI application with the RL agent (Stable Baselines3) and network simulation.
*   `frontend/`: React application with D3.js visualization.

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:

Install dependencies preferably in a vm:
```bash
pip install -r requirements.txt
```

Run the Backend Server:
```bash
python main.py
```
The backend will start at `http://localhost:8000`.

### 2. Frontend Setup

In a new terminal and navigate to the frontend directory:


Install dependencies:
```bash
npm install
```

Run the Frontend Development Server:
```bash
npm run dev
```
The frontend will start at `http://localhost:5173` (or similar).

## How to Use

1.  Go to the frontend URL 
2.   You will see a tree graph of the data center.
    *   **Red/Orange Lines**: High traffic links.
    *   **Cyan Dots**: Servers hosting the Burst Pair 1 
    *   **Magenta Dots**: Servers hosting the Burst Pair 2 
3.  Click the **Optimize** button.
    *   The AI will start moving containers to reduce cost.
    *   Watch the **Step Counter**.
    *   **Proactive Behavior**: Around Step 15-19, watch the Cyan dots move closer together before the traffic burst at Step 20.
4.  Click **Reset** to start a new simulation.


