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

export const triggerBurst = async () => {
    const response = await axios.post(`${API_URL}/burst`);
    return response.data;
};

export const forceChain = async () => {
    const response = await axios.post(`${API_URL}/force_chain`);
    return response.data;
};
