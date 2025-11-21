import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MetricsPanel = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="w-full bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No optimization data yet.</p>
                <p className="text-sm text-gray-400 mt-2">Click "Optimize (AI)" to start reducing network traffic.</p>
            </div>
        );
    }

    const initialCost = history[0].cost;
    const currentCost = history[history.length - 1].cost;
    const rawChange = ((currentCost - initialCost) / initialCost * 100);
    const isReduction = rawChange <= 0;
    const formattedChange = Math.abs(rawChange).toFixed(1) + '%';

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div className="w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
            {/* Summary Card */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600 font-semibold uppercase">Total Network Load</p>
                    <p className="text-3xl font-bold text-blue-900">{formatNumber(currentCost)}</p>
                    <p className="text-xs text-blue-400 mt-1">
                        (Traffic Volume × Hops)<br />
                        Lower is better.
                    </p>
                </div>

                {isReduction ? (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm text-green-600 font-semibold uppercase">Optimization Success</p>
                        <p className="text-3xl font-bold text-green-900">-{formattedChange}</p>
                        <p className="text-xs text-green-400 mt-1">
                            Efficiency gained by moving containers closer.
                        </p>
                    </div>
                ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600 font-semibold uppercase">Traffic Surge</p>
                        <p className="text-3xl font-bold text-red-900">+{formattedChange}</p>
                        <p className="text-xs text-red-400 mt-1">
                            High traffic detected between distant servers.
                        </p>
                    </div>
                )}
            </div>

            {/* Chart Section */}
            <div className="h-64">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Optimization Progress</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="step"
                            label={{ value: 'Optimization Steps', position: 'insideBottomRight', offset: -5, fill: '#64748b' }}
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            label={{ value: 'Network Cost', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                            tick={{ fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="cost"
                            name="Total Network Cost"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsPanel;
