import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from simulation.traffic import TrafficGenerator

class TrafficLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(TrafficLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
         
        out = out[:, -1, :]
        out = self.fc(out)
        return out

class TrafficPredictor:
    def __init__(self, num_containers, history_len=5):
        self.num_containers = num_containers
        self.history_len = history_len
        self.input_size = num_containers  
        self.hidden_size = 32
        self.model = TrafficLSTM(self.input_size, self.hidden_size, self.input_size)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.01)
        self.criterion = nn.MSELoss()
        self.history_buffer = []

    def prepare_data(self, traffic_gen: TrafficGenerator, episodes=50, steps_per_ep=100):
        X, y = [], []
        
        for _ in range(episodes):
            history = np.zeros((self.history_len, self.input_size))
            for step in range(steps_per_ep):  
                traffic_map = traffic_gen.peek_traffic(step)
                
                 
                current_vec = self._map_to_vector(traffic_map)
                
                 
                next_traffic_map = traffic_gen.peek_traffic(step + 1)
                next_vec = self._map_to_vector(next_traffic_map)
                history = np.roll(history, -1, axis=0)
                history[-1] = current_vec
                
                if step >= self.history_len:
                    X.append(history.copy())
                    y.append(next_vec.copy())
                    
        return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

    def train(self, traffic_gen: TrafficGenerator):
        print("Training Traffic Predictor with Conformal Prediction...")
        X, y = self.prepare_data(traffic_gen, episodes=60)  
        
         
        split_idx = int(0.8 * len(X))
        X_train, X_cal = X[:split_idx], X[split_idx:]
        y_train, y_cal = y[:split_idx], y[split_idx:]
        
        X_tensor = torch.from_numpy(X_train)
        y_tensor = torch.from_numpy(y_train)
        
        epochs = 150
        for epoch in range(epochs):
            self.optimizer.zero_grad()
            outputs = self.model(X_tensor)
            loss = self.criterion(outputs, y_tensor)
            loss.backward()
            self.optimizer.step()
            
        print("Model Trained. Calibrating uncertainty") 
        self.model.eval()
        with torch.no_grad():
            cal_outputs = self.model(torch.from_numpy(X_cal))
             
            residuals = torch.abs(torch.from_numpy(y_cal) - cal_outputs).numpy()  
            self.uncertainty_q = np.percentile(residuals, 90, axis=0)
            
        print(f"Calibration Complete. Max Uncertainty: {np.max(self.uncertainty_q):.2f}")
        self.model.train()

    def predict(self, current_traffic_map):
         
        vec = self._map_to_vector(current_traffic_map)
        self.history_buffer.append(vec)
        
        if len(self.history_buffer) > self.history_len:
            self.history_buffer.pop(0)
            
         
        if len(self.history_buffer) < self.history_len:
            return vec, np.ones_like(vec) * 10.0     
        input_tensor = torch.tensor([self.history_buffer], dtype=torch.float32)
        self.model.eval()
        with torch.no_grad():
            pred = self.model(input_tensor).numpy()[0]
        self.model.train()
        
         
        return pred, self.uncertainty_q

    def reset(self):
        self.history_buffer = []
         
        for _ in range(self.history_len):
            self.history_buffer.append(np.zeros(self.num_containers))

    def _map_to_vector(self, traffic_map):
        vec = np.zeros(self.num_containers)
        for src, dests in traffic_map.items():
            for dst, vol in dests.items():
                try:
                    dst_idx = int(dst.split("_")[1])
                    if 0 <= dst_idx < self.num_containers:
                        vec[dst_idx] += vol
                except:
                    pass
        return vec / 1000.0  
