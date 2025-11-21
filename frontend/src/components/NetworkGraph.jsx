import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkGraph = ({ data, width = 800, height = 600 }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { nodes, links, containers } = data;


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

                if (sourceNode && targetNode) {
                    const particle = particleGroup.append("circle")
                        .attr("r", 4)
                        .attr("fill", "#facc15")
                        .attr("stroke", "#000")
                        .attr("cx", sourceNode.x)
                        .attr("cy", sourceNode.y);

                    particle.transition()
                        .duration(1000)
                        .attr("cx", targetNode.x)
                        .attr("cy", targetNode.y)
                        .remove();
                }
            });
        }


        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(55))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("y", d3.forceY().y(d => {
                if (d.type === 'core') return height * 0.15;
                if (d.type === 'aggregation') return height * 0.4;
                if (d.type === 'server') return height * 0.75;
                return height / 2;
            }).strength(2));


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

                return Math.min(Math.sqrt(d.load / 100) + 1, 5);
            });


        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation));


        node.each(function (d) {
            const el = d3.select(this);
            if (d.type === 'core') {
                el.append("circle").attr("r", 18).attr("fill", "#ef4444").attr("stroke", "#fff").attr("stroke-width", 2);
            } else if (d.type === 'aggregation') {
                el.append("rect").attr("width", 24).attr("height", 24).attr("x", -12).attr("y", -12).attr("fill", "#3b82f6").attr("rx", 4).attr("stroke", "#fff").attr("stroke-width", 2);
            } else {
                el.append("rect").attr("width", 36).attr("height", 20).attr("x", -18).attr("y", -10).attr("fill", "#22c55e").attr("rx", 4).attr("stroke", "#fff").attr("stroke-width", 2);
            }


            el.append("title").text(`${d.id} (${d.type})`);
        });


        node.each(function (d) {
            if (d.type !== 'server') {
                d3.select(this).append("text")
                    .text(d.id)
                    .attr("x", 15)
                    .attr("y", 5)
                    .style("font-size", "12px")
                    .style("font-weight", "bold")
                    .style("fill", "#334155")
                    .style("pointer-events", "none");
            }
        });


        node.each(function (d) {
            if (d.type === 'server') {
                const myContainers = Object.entries(containers)
                    .filter(([cid, sid]) => sid === d.id)
                    .map(([cid]) => cid);

                const badge = d3.select(this).append("g").attr("transform", "translate(0, 18)");

                badge.append("text")
                    .text(`${myContainers.length} Cs`)
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .style("fill", "#475569")
                    .style("font-weight", "500");
            }
        });

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });


        const legend = svg.append("g")
            .attr("transform", "translate(20, 20)");

        const legendItems = [
            { color: "#ef4444", label: "Heavy Traffic (> 1000)" },
            { color: "#f59e0b", label: "Medium Traffic" },
            { color: "#cbd5e1", label: "Low/Idle" }
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


        return () => {
            simulation.stop();
        };
    }, [data, width, height]);


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
    }

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: '#f9f9f9' }}></svg>
        </div>
    );
};

export default NetworkGraph;
