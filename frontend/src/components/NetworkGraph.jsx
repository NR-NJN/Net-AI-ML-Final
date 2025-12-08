import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CHAIN_COLORS = {
    "Login Flow": "#3b82f6",     // Blue
    "Data Pipeline": "#10b981",  // Green
    "Other": "#eab308"           // Yellow
};

const NetworkGraph = ({ data, width = 800, height = 600 }) => {
    const svgRef = useRef();
    // We use a ref to keep track of previous container locations for animation
    const prevLocationsRef = useRef({});
    // We use a ref to keep track of previous PHYSICAL node locations to prevent "flying from 0,0"
    const prevNodesRef = useRef({});

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clean canvas

        // --- 1. Data Preparation ---
        const { nodes, links, containers, container_chains } = data;

        // Separate Physical Nodes (Switches/Servers) from Logical (Containers)
        // In this design, we only simulate Physical Nodes for structure.
        // Containers will just "orbit" their host server.
        // FIX: Initialize with previous positions if available
        const physicalNodes = nodes.map(d => {
            const prev = prevNodesRef.current[d.id];
            return prev ? { ...d, x: prev.x, y: prev.y } : { ...d };
        });
        const physicalLinks = links.map(d => ({ ...d })); // Clone

        // --- 2. Force Simulation (Physical Layout) ---
        const simulation = d3.forceSimulation(physicalNodes)
            .force("link", d3.forceLink(physicalLinks).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            // Force strict hierarchy: Core(Top) -> Agg(Mid) -> Server(Bot)
            .force("y", d3.forceY().y(d => {
                if (d.type === 'core') return height * 0.20; // Moved down from 0.15 to avoid clipping
                if (d.type === 'aggregation') return height * 0.45;
                if (d.type === 'server') return height * 0.8;
                return height / 2;
            }).strength(2));

        // --- 3. Drawing Layers ---
        const linkLayer = svg.append("g").attr("class", "links");
        const serverLayer = svg.append("g").attr("class", "servers");
        const particleLayer = svg.append("g").attr("class", "particles"); // Flying dots
        const containerLayer = svg.append("g").attr("class", "containers"); // Sitting dots

        // Draw Physical Links (Cables)
        const link = linkLayer.selectAll("line")
            .data(physicalLinks, d => d.id) // Keyed join
            .join("line")
            .attr("stroke", d => {
                if (d.load > 1000) return "#ef4444"; // Red if congested
                if (d.load > 100) return "#f59e0b";  // Orange if busy
                return "#cbd5e1"; // Grey if idle
            })
            .attr("stroke-width", d => d.load > 1000 ? 3 : 1.5)
            .attr("stroke-opacity", 0.6);

        // Draw Physical Nodes (Servers/Switches)
        const serverNode = serverLayer.selectAll("g")
            .data(physicalNodes, d => d.id) // Keyed join
            .join("g");

        serverNode.append("circle")
            .attr("r", d => d.type === 'server' ? 20 : (d.type === 'core' ? 25 : 15))
            .attr("fill", d => {
                if (d.type === 'core') return "#8b5cf6"; // Violet for Core
                if (d.type === 'aggregation') return "#f97316"; // Orange for Agg
                return "#e2e8f0"; // Slate for Server
            })
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2);

        // Labels for Servers & Switches (MOVED OUTSIDE)
        serverNode.append("text")
            .text(d => {
                if (d.type === 'server') return `S${d.id.split('_')[2]}`;
                if (d.type === 'core') return 'CORE';
                if (d.type === 'aggregation') return `Agg ${d.id.split('_')[2]}`;
                return '';
            })
            .attr("dy", d => d.type === 'server' ? 32 : (d.type === 'core' ? 38 : 28)) // Move text below the circle
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("fill", "#1e293b") // Dark slate text color for all
            .style("pointer-events", "none");

        // --- 4. Container Logic ---

        // Helper to get chain color
        const getChainColor = (cId) => {
            if (container_chains && container_chains[cId]) {
                return CHAIN_COLORS[container_chains[cId]] || CHAIN_COLORS["Other"];
            }
            if (cId === "Container_0" || cId === "Container_1" || cId === "Container_2") return CHAIN_COLORS["Login Flow"];
            if (cId === "Container_3") return CHAIN_COLORS["Data Pipeline"];
            return CHAIN_COLORS["Other"];
        };

        const getContainerName = (cId) => {
            if (cId === "Container_0") return "Web/Store";
            if (cId === "Container_1") return "Auth Service";
            if (cId === "Container_2") return "Database";
            if (cId === "Container_3") return "Analytics";
            return cId;
        };

        const containerData = Object.entries(containers).map(([cId, sId]) => ({
            id: cId,
            host: sId,
            color: getChainColor(cId),
            name: getContainerName(cId)
        }));

        const containerCircles = containerLayer.selectAll("g") // Change to Group to hold circle + title
            .data(containerData, d => d.id)
            .join("g");

        containerCircles.append("circle")
            .attr("r", 5)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", d => {
                // HACK: Show specific "Other" containers to create density without clutter
                if (d.color === CHAIN_COLORS["Other"]) {
                    const idNum = parseInt(d.id.split('_')[1]);
                    // Show valid static workloads (e.g. Containers 4-8)
                    return (idNum >= 4 && idNum <= 8) ? 0.7 : 0;
                }
                return 1;
            });

        // Add simple tooltip
        containerCircles.append("title")
            .text(d => `${d.name} (${d.id})`);

        // Warm up simulation to ensure nodes have positions
        simulation.tick(1);

        // --- 5. Animation Loop ---
        simulation.on("tick", () => {
            // Bound nodes to canvas
            physicalNodes.forEach(d => {
                d.x = Math.max(20, Math.min(width - 20, d.x));
                d.y = Math.max(20, Math.min(height - 20, d.y));
            });

            // Update Link Positions
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            // Update Server Positions
            serverNode.attr("transform", d => `translate(${d.x},${d.y})`);

            // Update Container Positions (Magnetize to Host)
            containerCircles
                .attr("transform", d => {
                    const hostNode = physicalNodes.find(n => n.id === d.host);
                    const x = hostNode ? hostNode.x + (Math.random() * 24 - 12) : 0;
                    const y = hostNode ? hostNode.y + (Math.random() * 24 - 12) : 0;
                    return `translate(${x},${y})`;
                });

            // SAVE POSITIONS for next render
            const currentLocs = {};
            physicalNodes.forEach(n => currentLocs[n.id] = { x: n.x, y: n.y });
            prevNodesRef.current = currentLocs;
        });

        // REMOVED Flying Particle Animation per user request

        // Update refs for next turn
        const newLocs = {};
        containerData.forEach(c => newLocs[c.id] = c.host);
        prevLocationsRef.current = newLocs;

        return () => simulation.stop();
    }, [data, width, height]);

    return (
        <svg ref={svgRef} width={width} height={height} className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm" />
    );
};

export default NetworkGraph;
