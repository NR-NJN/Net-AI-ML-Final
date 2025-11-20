import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getNetworkState = async () => {
    const response = await axios.get(`${API_URL}/state`);
    return response.data;
};

export const resetSimulation = async () => {
    const response = await axios.post(`${API_URL}/reset`);
    return response.data;
};

export const optimizeNetwork = async (steps = 10) => {
    const response = await axios.post(`${API_URL}/optimize`, null, {
        params: { steps }
    });
    return response.data;
};
