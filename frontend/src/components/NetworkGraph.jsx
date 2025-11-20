import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkGraph = ({ data, width = 800, height = 600 }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.nodes || !data.links) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { nodes, links, containers } = data;


        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(50))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("y", d3.forceY().y(d => {

                if (d.type === 'core') return height * 0.1;
                if (d.type === 'aggregation') return height * 0.3;
                if (d.type === 'server') return height * 0.6;
                return height / 2;
            }).strength(1));


        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.weight || 1));


        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation));

        node.each(function (d) {
            const el = d3.select(this);
            if (d.type === 'core') {
                el.append("circle").attr("r", 15).attr("fill", "#ff4444");
            } else if (d.type === 'aggregation') {
                el.append("rect").attr("width", 20).attr("height", 20).attr("x", -10).attr("y", -10).attr("fill", "#4444ff");
            } else {
                el.append("rect").attr("width", 30).attr("height", 15).attr("x", -15).attr("y", -7.5).attr("fill", "#44ff44");
            }
        });


        node.append("text")
            .text(d => d.id)
            .attr("x", 12)
            .attr("y", 3)
            .style("font-size", "10px")
            .style("pointer-events", "none");

        node.each(function (d) {
            if (d.type === 'server') {
                const myContainers = Object.entries(containers)
                    .filter(([cid, sid]) => sid === d.id)
                    .map(([cid]) => cid);

                if (myContainers.length > 0) {
                    d3.select(this).append("text")
                        .text(`(${myContainers.length})`)
                        .attr("y", 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "8px");
                }
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
