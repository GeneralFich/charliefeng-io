---
title: "The Evolving Landscape of Data Centers: From Terrestrial Transformations to Orbital Aspirations"
date: 2024-10-26
author: Charlie Feng
description: AI workloads are forcing data centers to reinvent cooling, networking, and multi-site training. Space-based data centers remain far off.
---

AI workloads have broken the assumptions data centers were built on. Cooling systems designed for 7-10 kW racks can't handle GPUs demanding 40-100 kW. Training runs spanning multiple facilities hit the speed of light as a real constraint. The industry is adapting fast, but some problems don't have clean solutions yet.

## Cooling Is the First Bottleneck

Nvidia's Blackwell GPUs require direct-to-chip liquid cooling. Not recommend - require. This single hardware decision is reshaping the entire data center supply chain.

Meta learned this the hard way, abandoning partially built facilities that couldn't support high-power AI deployments. Google, which adopted liquid cooling early for its TPU-optimized data centers, hit a PUE of 1.1 in 2023. Microsoft's Arizona facilities, by contrast, still struggle with higher PUE and water usage. The gap between early adopters and everyone else is widening.

## Hyperscalers Are Pulling Away

Google's strategy is instructive. They build large, interconnected campuses in concentrated regions - Council Bluffs, Iowa and Columbus, Ohio - creating gigawatt-scale training clusters. Scale buys them better cooling economics, optimized networking, and high-bandwidth fiber interconnects between facilities.

Smaller players can't replicate this. Even established cloud providers struggle to retrofit existing infrastructure for AI workloads. The advantage compounds: more data centers mean better distributed training, which means better models, which means more revenue, which funds more data centers.

## Multi-Datacenter Training Is Genuinely Hard

Training massive models across geographically dispersed data centers introduces problems without obvious fixes.

The speed of light is a real constraint. Round-trip times between distant facilities create unacceptable synchronization delays in training. A single slow GPU - the "straggler problem" - bottlenecks an entire synchronous training run because all nodes must stay in lockstep.

Hierarchical and asynchronous SGD can help, but introduce their own complexity. Fault tolerance is another layer: with hundreds of thousands of GPUs running together, minor hardware failures cascade. Google built Borg and Pathways to handle this in software, but the engineering effort is enormous.

All of this demands high-bandwidth, low-latency interconnects between sites - driving investment in fiber optics, specialized telecom equipment, and network topologies built for ML training traffic. The InfiniBand vs. Ethernet decision at the backend level carries real performance and cost tradeoffs.

## Space-Based Data Centers Are Still Science Fiction

The pitch sounds great: uninterrupted solar power, radiative cooling in vacuum, global coverage, immunity to earthquakes and floods.

The reality: launch costs are prohibitive, maintenance in orbit is barely possible, latency to Earth is bounded by physics, radiation degrades hardware, and space debris poses collision risks. None of these problems are close to solved.

Space data centers might eventually serve niche use cases like cold storage or disaster recovery. But "eventually" is doing a lot of work in that sentence.
