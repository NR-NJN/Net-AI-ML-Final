# AI Data Center Optimizer - Usage & Demo Guide

This guide details how to demonstrate the AI driven Data Center Optimization project.



---

## 1. Demo Walkthrough Narrative

This project demonstrates an AI Agent that learns to optimize container placement in real-time. Follow these steps to tell the story.

### Step 1: The Morning State Low Traffic
*   **Action**: Click the  **Reset** button, if you've already run the demo once without shutting down the server.
*   **Observation**:
    *   Most traffic lines are faint/grey.
    *   Metrics show Low Network Load and standard Energy Efficiency.
    *   This is the data center in the morning. Traffic is low, but servers are active.

### Step 2: The Peak Hour Saturation
*   **Action**: Wait for roughly **60 steps** or click **Step +5** repeatedly.
*   **Observation**:
    *   Background traffic intensifies  and lines turn Orange.
    *   As the user base wakes up, the background load increases. This is the 'Day/Night' cycle in action

### Step 3: The Login Spike AI Reaction
*   **Action**: Click the red **Force Spike** button.
*   **Observation**:
    This was mostly for testing purposes and not really relevent to the demo, but random traffic spikes do happen in real life, so I've kept this in the final product.
    *    A massive red burst follows, but because the AI moved the container, the impact is minimized.
    *  The AI saw the login event. It recalled that 'Login' is usually followed by a db fetch. It proactively moved the database to the same switch steps before the heavy traffic hit.

### Step 4: Long-Term Optimization
*   **Action**: Click the white **Play** button.
*   **Observation**:
    *   The AI will continuously tweak positions.
    *   Watch the **Total Network Load** number drop over time.
    *   Watch the **Active Servers** count. In low traffic, it might consolidate containers to allow servers to sleep.
    *   This is just an autoplay feature of the **Step +5** button.

---

## 2. Understanding the Visualization

### The Nodes (Infrastructure)
*   **Violet Node**: The Core Switch. Congestion here is critical.
*   **Orange Nodes**: Aggregation Switches.
*   **Grey Nodes**: Physical Servers 

### The Dots (Containers)
*   The Legend in the top-left explains the colors:
    *   **Cyan**: Web Store
    *   **Blue**: Auth Service
    *   **Emerald**: SQL Database
    *   **Fuchsia**: Analytics Engine
    *   **Yellow**: Background workloads

### The Metrics
1.  **Total Network Load**: A composite score of Volume × Distance. Lower is better.
2.  **Energy Efficiency**: Shows how many physical servers are kept active. 
