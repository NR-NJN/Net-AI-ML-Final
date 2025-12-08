import React from 'react';

const MetricsPanel = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="w-full bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No optimization data yet.</p>
                <p className="text-sm text-gray-400 mt-2">Click Optimize AI to start reducing network traffic.</p>
            </div>
        );
    }

    const currentCost = history[history.length - 1].cost;

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div className="w-full bg-white p-6 border border-black flex flex-col gap-6 font-mono">
            {/* Summary Card */}
            <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border border-black">
                    <p className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Total Network Load</p>
                    <p className="text-3xl font-bold">{formatNumber(currentCost)}</p>
                </div>

                {/* Energy Score Card */}
                <div className="p-4 border border-black">
                    <p className="text-sm font-bold uppercase border-b border-black mb-2 pb-1">Energy Efficiency</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-bold">
                                {history[history.length - 1].active_servers || 0} <span className="text-lg font-normal text-gray-500">/ 16</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricsPanel;
