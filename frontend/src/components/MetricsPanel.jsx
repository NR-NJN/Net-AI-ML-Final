import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MetricsPanel = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="w-full bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No optimization data yet.</p>
                <p className="text-sm text-gray-400 mt-2">Click Optimize AI to start reducing network traffic.</p>
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
        <div className="w-full bg-white p-6 border border-black flex flex-col gap-6 font-mono">
            {/* Summary Card */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-black">
                    <p className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Total Network Load</p>
                    <p className="text-3xl font-bold">{formatNumber(currentCost)}</p>
                    <p className="text-xs mt-1">
                        (Traffic Volume × Hops)<br />
                        Lower is better.
                    </p>
                </div>

                {isReduction ? (
                    <div className="p-4 border border-black">
                        <p className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Optimization Success</p>
                        <p className="text-3xl font-bold">-{formattedChange}</p>
                        <p className="text-xs mt-1">
                            Efficiency gained.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 border border-black">
                        <p className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Traffic Surge</p>
                        <p className="text-3xl font-bold">+{formattedChange}</p>
                        <p className="text-xs mt-1">
                            High traffic detected.
                        </p>
                    </div>
                )}

                {/* Energy Score Card */}
                <div className="p-4 border border-black col-span-2">
                    <p className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Energy Efficiency</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-bold">
                                {history[history.length - 1].active_servers || 0} <span className="text-lg font-normal text-gray-500">/ 16</span>
                            </p>
                            <p className="text-xs mt-1">Active Servers</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">
                                {history[history.length - 1].energy_cost ? formatNumber(history[history.length - 1].energy_cost) : 0}
                            </p>
                            <p className="text-xs mt-1">Energy Penalty</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Service Chains */}
            <div className="retro-card p-4 border border-black">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Active Service Chains</h3>
                <div className="space-y-2">
                    {history[history.length - 1].active_chains && history[history.length - 1].active_chains.length > 0 ? (
                        history[history.length - 1].active_chains.map((chain, i) => (
                            <div key={i} className="flex items-center text-xs font-mono text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                {chain} [RUNNING]
                            </div>
                        ))
                    ) : (
                        <div className="text-xs font-mono text-gray-400">No active chains.</div>
                    )}
                </div>
            </div>

            {/* Chart Section */}
            <div className="h-64 border border-black p-2">
                <h3 className="text-lg font-bold mb-2 border-b border-black inline-block">Optimization Progress</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis
                            dataKey="step"
                            label={{ value: 'Steps', position: 'insideBottomRight', offset: -5, fill: '#000' }}
                            tick={{ fill: '#000' }}
                            stroke="#000"
                        />
                        <YAxis
                            label={{ value: 'Cost', angle: -90, position: 'insideLeft', fill: '#000' }}
                            tick={{ fill: '#000' }}
                            stroke="#000"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', borderRadius: '0', boxShadow: 'none' }}
                        />
                        <Legend />
                        <Line
                            type="step"
                            dataKey="cost"
                            name="Network Cost"
                            stroke="#000"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#000' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsPanel;
