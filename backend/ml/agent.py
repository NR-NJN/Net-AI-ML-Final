from stable_baselines3 import PPO
from ml.environment import DataCenterEnv
import os

class RLAgent:
    def __init__(self, env: DataCenterEnv):
        self.env = env
        self.model = None
        self.model_path = "ppo_datacenter_agent"

    def train(self, total_timesteps=10000):
        self.model = PPO("MlpPolicy", self.env, verbose=1)
        self.model.learn(total_timesteps=total_timesteps)
        self.model.save(self.model_path)

    def load(self):
        if os.path.exists(f"{self.model_path}.zip"):
            self.model = PPO.load(self.model_path, env=self.env)
            return True
        return False

    def predict(self, obs):
        if self.model:
             
             
            action, _ = self.model.predict(obs, deterministic=False)
            return action
        return self.env.action_space.sample() 
