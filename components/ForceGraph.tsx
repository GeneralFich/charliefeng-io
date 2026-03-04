import React, { useRef, useEffect, useCallback } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import { select } from 'd3-selection';
import { zoom as d3Zoom } from 'd3-zoom';
import { drag as d3Drag } from 'd3-drag';
import { GraphNode, GraphEdge, NODE_COLOR_MAP } from '../lib/graph-data';
import { useTheme } from '../lib/ThemeContext';

interface SimNode extends SimulationNodeDatum, GraphNode {
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  strength?: number;
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onHoverNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);
  const selectedNodeIdRef = useRef<string | null>(null);
  const applyHighlightRef = useRef<((focusId: string | null) => void) | null>(null);
  const { resolved: theme } = useTheme();

  const getNodeColor = useCallback(
    (type: string) => {
      const colors = NODE_COLOR_MAP[type as keyof typeof NODE_COLOR_MAP];
      return colors ? (theme === 'dark' ? colors.dark : colors.light) : '#64748b';
    },
    [theme]
  );

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Build simulation data (deep copies)
    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));
    const simLinks: SimLink[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
      strength: e.strength,
    }));

    const svgSel = select(svg);
    svgSel.selectAll('*').remove();
    svgSel.attr('width', width).attr('height', height);

    // Zoom group
    const g = svgSel.append('g').attr('class', 'zoom-group');

    // Zoom behavior
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svgSel.call(zoomBehavior);

    // Edges
    const edgeGroup = g.append('g').attr('class', 'edges');
    const linkElements = edgeGroup
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('class', 'graph-edge')
      .attr('stroke', theme === 'dark' ? '#334155' : '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4);

    // Nodes group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes, (d) => d.id)
      .join('g')
      .attr('class', 'graph-node')
      .style('cursor', 'pointer');

    // Circles
    nodeElements
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', theme === 'dark' ? '#1e293b' : '#ffffff')
      .attr('stroke-width', 2);

    // Labels
    nodeElements
      .append('text')
      .attr('class', 'graph-label')
      .attr('dy', (d) => d.radius + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', theme === 'dark' ? '#94a3b8' : '#64748b')
      .attr('font-size', (d) => (d.type === 'hub' ? 12 : 10))
      .attr('font-weight', (d) => (d.type === 'hub' ? '600' : '400'))
      .text((d) => (d.label.length > 18 ? d.label.slice(0, 16) + '…' : d.label));

    // Highlight helper: dims non-connected nodes & edges for a focus node
    function applyHighlight(focusId: string | null) {
      if (focusId) {
        linkElements
          .attr('stroke-opacity', (l) => {
            const src = typeof l.source === 'object' ? l.source.id : l.source;
            const tgt = typeof l.target === 'object' ? l.target.id : l.target;
            return src === focusId || tgt === focusId ? 0.8 : 0.1;
          })
          .attr('stroke-width', (l) => {
            const src = typeof l.source === 'object' ? l.source.id : l.source;
            const tgt = typeof l.target === 'object' ? l.target.id : l.target;
            return src === focusId || tgt === focusId ? 2 : 1;
          });
        nodeElements.style('opacity', (n) => {
          if (n.id === focusId) return 1;
          const isConnected = simLinks.some((l) => {
            const src = typeof l.source === 'object' ? l.source.id : l.source;
            const tgt = typeof l.target === 'object' ? l.target.id : l.target;
            return (src === focusId && tgt === n.id) || (tgt === focusId && src === n.id);
          });
          return isConnected ? 1 : 0.25;
        });
      } else {
        linkElements.attr('stroke-opacity', 0.4).attr('stroke-width', 1);
        nodeElements.style('opacity', 1);
      }
    }
    applyHighlightRef.current = applyHighlight;

    // Interactions
    nodeElements
      .on('mouseenter', function (_event, d) {
        applyHighlight(d.id);
        onHoverNode?.(d.id);
      })
      .on('mouseleave', function () {
        applyHighlight(selectedNodeIdRef.current);
        onHoverNode?.(null);
      })
      .on('click', (_event, d) => {
        onSelectNode(selectedNodeId === d.id ? null : d.id);
      });

    // Drag behavior
    const dragBehavior = d3Drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(dragBehavior);

    // Simulation
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const simulation = forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(80)
          .strength((l) => (l as SimLink).strength ?? 0.3)
      )
      .force('charge', forceManyBody<SimNode>().strength(-200).distanceMax(300))
      .force('center', forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        'collide',
        forceCollide<SimNode>()
          .radius((d) => d.radius + 8)
          .strength(0.7)
      )
      .force('x', forceX<SimNode>(width / 2).strength(0.03))
      .force('y', forceY<SimNode>(height / 2).strength(0.03))
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    if (reducedMotion) {
      // Run simulation to completion immediately
      simulation.stop();
      for (let i = 0; i < 300; i++) simulation.tick();
      updatePositions();
    } else {
      simulation.on('tick', updatePositions);
    }

    function updatePositions() {
      linkElements
        .attr('x1', (d) => (d.source as SimNode).x)
        .attr('y1', (d) => (d.source as SimNode).y)
        .attr('x2', (d) => (d.target as SimNode).x)
        .attr('y2', (d) => (d.target as SimNode).y);

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`);
    }

    simulationRef.current = simulation;

    // Resize observer
    const ro = new ResizeObserver((entries) => {
      const { width: newW, height: newH } = entries[0].contentRect;
      svgSel.attr('width', newW).attr('height', newH);
      simulation
        .force('center', forceCenter(newW / 2, newH / 2).strength(0.05))
        .force('x', forceX<SimNode>(newW / 2).strength(0.03))
        .force('y', forceY<SimNode>(newH / 2).strength(0.03))
        .alpha(0.3)
        .restart();
    });
    ro.observe(container);

    return () => {
      simulation.stop();
      ro.disconnect();
    };
    // We intentionally only re-create the simulation when the data changes, not on every theme/selection change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Update colors when theme changes (without recreating simulation)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgSel = select(svg);

    svgSel
      .selectAll<SVGCircleElement, SimNode>('.graph-node circle')
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', theme === 'dark' ? '#1e293b' : '#ffffff');

    svgSel
      .selectAll<SVGTextElement, SimNode>('.graph-label')
      .attr('fill', theme === 'dark' ? '#94a3b8' : '#64748b');

    svgSel
      .selectAll<SVGLineElement, SimLink>('.graph-edge')
      .attr('stroke', theme === 'dark' ? '#334155' : '#cbd5e1');
  }, [theme, getNodeColor]);

  // Highlight selected node and dim non-connected nodes
  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    const svg = svgRef.current;
    if (!svg) return;
    const svgSel = select(svg);

    svgSel.selectAll<SVGGElement, SimNode>('.graph-node').each(function (d) {
      const el = select(this).select('circle');
      if (selectedNodeId === d.id) {
        el.attr('stroke', theme === 'dark' ? '#60a5fa' : '#2563eb')
          .attr('stroke-width', 3);
      } else {
        el.attr('stroke', theme === 'dark' ? '#1e293b' : '#ffffff')
          .attr('stroke-width', 2);
      }
    });

    applyHighlightRef.current?.(selectedNodeId);
  }, [selectedNodeId, theme]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
