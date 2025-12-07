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
                if (d.type === 'core') return height * 0.15;
                if (d.type === 'aggregation') return height * 0.45;
                if (d.type === 'server') return height * 0.8;
                return height / 2;
            }).strength(2));


        const linkLayer = svg.append("g").attr("class", "links");
        const serverLayer = svg.append("g").attr("class", "servers");
        const particleLayer = svg.append("g").attr("class", "particles");
        const containerLayer = svg.append("g").attr("class", "containers");


        const link = linkLayer.selectAll("line")
            .data(physicalLinks)
            .join("line")
            .attr("stroke", d => {
                if (d.load > 1000) return "#ef4444";
                if (d.load > 100) return "#f59e0b";
                return "#cbd5e1";
            })
            .attr("stroke-width", d => d.load > 1000 ? 3 : 1.5)
            .attr("stroke-opacity", 0.6);


        const serverNode = serverLayer.selectAll("g")
            .data(physicalNodes)
            .join("g");

        serverNode.append("circle")
            .attr("r", d => d.type === 'server' ? 20 : 10)
            .attr("fill", "#e2e8f0")
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2);


        serverNode.append("text")
            .text(d => d.type === 'server' ? `S${d.id.split('_')[2]}` : '')
            .attr("dy", 4)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("pointer-events", "none");




        const getChainColor = (cId) => {
            if (container_chains && container_chains[cId]) {
                return CHAIN_COLORS[container_chains[cId]] || CHAIN_COLORS["Other"];
            }
            if (cId === "Container_0" || cId === "Container_1" || cId === "Container_2") return CHAIN_COLORS["Login Flow"];
            if (cId === "Container_3") return CHAIN_COLORS["Data Pipeline"];
            return CHAIN_COLORS["Other"];
        };

        const containerData = Object.entries(containers).map(([cId, sId]) => ({
            id: cId,
            host: sId,
            color: getChainColor(cId)
        }));

        const containerCircles = containerLayer.selectAll("circle")
            .data(containerData)
            .join("circle")
            .attr("r", 5)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", d => d.color === CHAIN_COLORS["Other"] ? 0 : 1);


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
                .attr("cx", d => {
                    const hostNode = physicalNodes.find(n => n.id === d.host);
                    return hostNode ? hostNode.x + (Math.random() * 24 - 12) : 0;
                })
                .attr("cy", d => {
                    const hostNode = physicalNodes.find(n => n.id === d.host);
                    return hostNode ? hostNode.y + (Math.random() * 24 - 12) : 0;
                });


            const currentLocs = {};
            physicalNodes.forEach(n => currentLocs[n.id] = { x: n.x, y: n.y });
            prevNodesRef.current = currentLocs;
        });




        containerData.forEach(c => {
            const prevHost = prevLocationsRef.current[c.id];
            if (prevHost && prevHost !== c.host) {

                const sourceNode = physicalNodes.find(n => n.id === prevHost);
                const targetNode = physicalNodes.find(n => n.id === c.host);

                if (sourceNode && targetNode) {
                    const particle = particleLayer.append("circle")
                        .attr("r", 6)
                        .attr("fill", "yellow")
                        .attr("stroke", "black")
                        .attr("cx", sourceNode.x)
                        .attr("cy", sourceNode.y);

                    particle.transition()
                        .duration(1000)
                        .attr("cx", targetNode.x || width / 2)
                        .attr("cy", targetNode.y || height / 2)
                        .on("end", () => particle.remove());
                }
            }
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
