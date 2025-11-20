import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MetricsPanel = ({ history }) => {
    if (!history || history.length === 0) {
        return <div className="p-4 text-gray-500">No metrics available yet. Run optimization to see data.</div>;
    }

    return (
        <div className="w-full h-64 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Network Cost Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" label={{ value: 'Steps', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Cost', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MetricsPanel;
