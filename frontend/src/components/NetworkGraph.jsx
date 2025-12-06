import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkGraph = ({ data, width = 800, height = 600 }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { nodes, links, containers } = data;

        // Helper function for dragging (Moved INSIDE useEffect to capture simulation)
        const drag = (simulation) => {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        };

        // --- 1. Simulation Setup ---
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(80))
            .force("charge", d3.forceManyBody().strength(-800))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("y", d3.forceY().y(d => {
                if (d.type === 'core') return height * 0.15;
                if (d.type === 'aggregation') return height * 0.4;
                if (d.type === 'server') return height * 0.75;
                return height / 2;
            }).strength(1.5));

        // --- 2. Draw Links ---
        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", d => {
                if (d.load > 1000) return "#ef4444";
                if (d.load > 100) return "#f59e0b";
                return "#cbd5e1";
            })
            .attr("stroke-opacity", d => d.load > 1000 ? 1 : 0.6)
            .attr("stroke-width", d => {
                if (d.load > 1000) return 5;
                if (d.load > 100) return 3;
                return 1;
            });

        // --- 3. Draw Nodes ---
        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation)); // Drag is now defined

        // Node Circles
        node.append("circle")
            .attr("r", d => d.type === 'core' ? 15 : d.type === 'aggregation' ? 10 : 8)
            .attr("fill", d => {
                if (d.type === 'server') {
                    // Check if server is active (has containers)
                    const isActive = Object.values(containers).includes(d.id);
                    return isActive ? "#3b82f6" : "#e2e8f0";
                }
                return "#64748b";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        // Helper to shorten labels
        const shortenLabel = (id) => {
            if (id.startsWith("Server_")) {
                const parts = id.split("_");
                return `S${parts[1]}-${parts[2]}`; // Server_0_0 -> S0-0
            }
            if (id.startsWith("Agg_Switch_")) {
                return `Agg${id.split("_")[2]}`; // Agg_Switch_0 -> Agg0
            }
            if (id === "Core_Switch") return "Core";
            return id;
        };

        // Node Labels
        node.append("text")
            .text(d => shortenLabel(d.id))
            .attr("x", 12)
            .attr("y", 4)
            .style("font-size", "10px") // Slightly smaller font
            .style("font-weight", "bold")
            .style("fill", "#334155")
            .style("pointer-events", "none");

        // --- 4. Simulation Tick ---
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // --- 5. Flying Particles (Animations) ---
        const prevContainers = svgRef.current._prevContainers || {};
        const moves = [];
        Object.entries(containers).forEach(([cid, sid]) => {
            const prevSid = prevContainers[cid];
            if (prevSid && prevSid !== sid) {
                moves.push({ cid, from: prevSid, to: sid });
            }
        });
        svgRef.current._prevContainers = containers;

        if (moves.length > 0) {
            const particleGroup = svg.append("g").attr("class", "particles");
            moves.forEach(move => {
                const sourceNode = nodes.find(n => n.id === move.from);
                const targetNode = nodes.find(n => n.id === move.to);

                // Fallback if nodes are moved/simulation updated positions
                if (sourceNode && targetNode) {
                    const particle = particleGroup.append("circle")
                        .attr("r", 4)
                        .attr("fill", "#facc15")
                        .attr("stroke", "#000")
                        .attr("cx", sourceNode.x || 0)
                        .attr("cy", sourceNode.y || 0);

                    particle.transition()
                        .duration(1000)
                        .attr("cx", targetNode.x || 0)
                        .attr("cy", targetNode.y || 0)
                        .remove();
                }
            });
        }

        // --- 6. Legend ---
        const legend = svg.append("g")
            .attr("transform", "translate(20, 20)");

        const legendItems = [
            { color: "#ef4444", label: "Heavy Traffic (> 1000)" },
            { color: "#f59e0b", label: "Medium Traffic" },
            { color: "#cbd5e1", label: "Low/Idle" },
            { color: "#3b82f6", label: "Active Server" },
            { color: "#e2e8f0", label: "Sleeping Server (Energy Saving)" }
        ];

        legendItems.forEach((item, i) => {
            const g = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            g.append("line")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", 20).attr("y2", 0)
                .attr("stroke", item.color)
                .attr("stroke-width", 3);

            g.append("text")
                .attr("x", 30)
                .attr("y", 4)
                .text(item.label)
                .style("font-size", "12px")
                .style("fill", "#64748b");
        });

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [data, width, height]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}
        />
    );
};

export default NetworkGraph;
