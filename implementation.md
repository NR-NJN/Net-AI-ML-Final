# AI Data Center Optimizer - Usage & Demo Guide

This guide details how to demonstrate the AI driven Data Center Optimization project.



---

## 1. Demo Walkthrough Narrative

This project demonstrates an AI Agent that learns to optimize container placement in real-time. Follow these steps to tell the story.

### Step 1: The "Morning" State (Low Traffic)
*   **Action**: Click the white **Reset** button.
*   **Observation**:
    *   Traffic lines are faint/grey.
    *   Metrics show Low Network Load and standard Energy Efficiency.
    *   **Narrative**: *"This is the data center in the morning. Traffic is low, but servers are active."*

### Step 2: The "Peak Hour" (Saturation)
*   **Action**: Wait for roughly **60 steps** (seconds) or click **Step +5** repeatedly.
*   **Observation**:
    *   Background traffic intensifies (lines turn Yellow/Orange).
    *   **Narrative**: *"As the user base wakes up, the background load increases. This is the 'Day/Night' cycle in action."*

### Step 3: The "Login Spike" (AI Reaction)
*   **Action**: Click the red **Force Spike** button.
*   **Observation**:
    *   **Initial Trigger**: A blue line flashes (User logs in).
    *   **AI Move**: Watch the **Emerald Dot** (Database). The AI will likely move it closer to the **Blue Dot** (Auth) or **Cyan Dot** (Web).
    *   **The Surge**: A massive red burst follows, but because the AI moved the container, the impact is minimized.
    *   **Narrative**: *"The AI saw the login event. It recalled that 'Login' is usually followed by a 'DB Fetch'. It proactively moved the database to the same switch steps before the heavy traffic hit."*

### Step 4: Long-Term Optimization
*   **Action**: Click the white **Play** button.
*   **Observation**:
    *   The AI will continuously tweak positions.
    *   Watch the **Total Network Load** number drop over time.
    *   Watch the **Active Servers** count. In low traffic, it might consolidate containers to allow servers to sleep.
    *   **Narrative**: *"The AI isn't just fighting fires; it's constantly rebalancing to find the most efficient state for both speed and energy."*

---

## 2. Understanding the Visualization

### The Nodes (Infrastructure)
*   **Violet Node (Top)**: The Core Switch. Congestion here is critical.
*   **Orange Nodes (Middle)**: Aggregation Switches.
*   **Grey Nodes (Bottom)**: Physical Servers (S0-S15).

### The Dots (Containers)
*   The Legend in the top-left explains the colors:
    *   **Cyan**: Web Store
    *   **Blue**: Auth Service
    *   **Emerald**: SQL Database
    *   **Fuchsia**: Analytics Engine
    *   **Yellow**: Background workloads

### The Metrics
1.  **Total Network Load**: A composite score of Volume × Distance. Lower is better.
2.  **Energy Efficiency**: Shows how many physical servers are kept active (e.g., `12/16`). Lower is better for power bills.
