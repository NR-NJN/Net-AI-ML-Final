import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CHAIN_COLORS = {
    "Login Flow": "#3b82f6",
    "Data Pipeline": "#10b981",
    "Other": "#eab308"
};

const NetworkGraph = ({ data, width = 800, height = 600 }) => {
    const svgRef = useRef();

    const prevLocationsRef = useRef({});

    const prevNodesRef = useRef({});

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();


        const { nodes, links, containers, container_chains } = data;





        const physicalNodes = nodes.map(d => {
            const prev = prevNodesRef.current[d.id];
            return prev ? { ...d, x: prev.x, y: prev.y } : { ...d };
        });
        const physicalLinks = links.map(d => ({ ...d }));


        const simulation = d3.forceSimulation(physicalNodes)
            .force("link", d3.forceLink(physicalLinks).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))

            .force("y", d3.forceY().y(d => {
                if (d.type === 'core') return height * 0.20;
                if (d.type === 'aggregation') return height * 0.45;
                if (d.type === 'server') return height * 0.8;
                return height / 2;
            }).strength(2));


        const linkLayer = svg.append("g").attr("class", "links");
        const serverLayer = svg.append("g").attr("class", "servers");
        const particleLayer = svg.append("g").attr("class", "particles");
        const containerLayer = svg.append("g").attr("class", "containers");


        const link = linkLayer.selectAll("line")
            .data(physicalLinks, d => d.id)
            .join("line")
            .attr("stroke", d => {
                if (d.load > 1000) return "#ef4444";
                if (d.load > 100) return "#f59e0b";
                return "#cbd5e1";
            })
            .attr("stroke-width", d => d.load > 1000 ? 3 : 1.5)
            .attr("stroke-opacity", 0.6);


        const serverNode = serverLayer.selectAll("g")
            .data(physicalNodes, d => d.id)
            .join("g");

        serverNode.append("circle")
            .attr("r", d => d.type === 'server' ? 20 : (d.type === 'core' ? 25 : 15))
            .attr("fill", d => {
                if (d.type === 'core') return "#8b5cf6";
                if (d.type === 'aggregation') return "#f97316";
                return "#e2e8f0";
            })
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2);


        serverNode.append("text")
            .text(d => {
                if (d.type === 'server') return `S${d.id.split('_')[2]}`;
                if (d.type === 'core') return 'CORE';
                if (d.type === 'aggregation') return `Agg ${d.id.split('_')[2]}`;
                return '';
            })
            .attr("dy", d => d.type === 'server' ? 32 : (d.type === 'core' ? 38 : 28))
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("fill", "#1e293b")
            .style("pointer-events", "none");






        const getContainerColor = (cId, chainName) => {

            if (cId === "Container_0") return "#06b6d4";
            if (cId === "Container_1") return "#3b82f6";
            if (cId === "Container_2") return "#10b981";
            if (cId === "Container_3") return "#d946ef";


            return "#eab308";
        };

        const getContainerName = (cId) => {
            if (cId === "Container_0") return "Web Store";
            if (cId === "Container_1") return "Auth";
            if (cId === "Container_2") return "Database";
            if (cId === "Container_3") return "Analytics";
            return cId;
        };

        const containerData = Object.entries(containers).map(([cId, sId]) => ({
            id: cId,
            host: sId,
            color: getContainerColor(cId, container_chains[cId]),
            name: getContainerName(cId)
        }));

        const containerCircles = containerLayer.selectAll("g")
            .data(containerData, d => d.id)
            .join("g");

        containerCircles.append("circle")
            .attr("r", 6)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("opacity", d => {

                if (d.color === "#eab308") {
                    const idNum = parseInt(d.id.split('_')[1]);

                    return (idNum >= 4 && idNum <= 8) ? 0.7 : 0;
                }
                return 1;
            });


        containerCircles.append("title")
            .text(d => `${d.name} (${d.id})`);


        const legendData = [
            { label: "Auth Service", color: "#3b82f6" },
            { label: "Web Store", color: "#06b6d4" },
            { label: "Database", color: "#10b981" },
            { label: "Analytics", color: "#d946ef" },
            { label: "Background", color: "#eab308" }
        ];

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20, 20)");


        legend.append("rect")
            .attr("width", 140)
            .attr("height", legendData.length * 20 + 10)
            .attr("fill", "white")
            .attr("stroke", "#cbd5e1")
            .attr("rx", 5);


        legendData.forEach((item, i) => {
            const g = legend.append("g")
                .attr("transform", `translate(10, ${i * 20 + 15})`);

            g.append("circle")
                .attr("r", 5)
                .attr("fill", item.color);

            g.append("text")
                .attr("x", 15)
                .attr("y", 4)
                .text(item.label)
                .style("font-size", "11px")
                .style("font-family", "monospace")
                .style("fill", "#475569");
        });


        simulation.tick(1);


        simulation.on("tick", () => {

            physicalNodes.forEach(d => {
                d.x = Math.max(20, Math.min(width - 20, d.x));
                d.y = Math.max(20, Math.min(height - 20, d.y));
            });


            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);


            serverNode.attr("transform", d => `translate(${d.x},${d.y})`);


            containerCircles
                .attr("transform", d => {
                    const hostNode = physicalNodes.find(n => n.id === d.host);
                    const x = hostNode ? hostNode.x + (Math.random() * 24 - 12) : 0;
                    const y = hostNode ? hostNode.y + (Math.random() * 24 - 12) : 0;
                    return `translate(${x},${y})`;
                });


            const currentLocs = {};
            physicalNodes.forEach(n => currentLocs[n.id] = { x: n.x, y: n.y });
            prevNodesRef.current = currentLocs;
        });




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
