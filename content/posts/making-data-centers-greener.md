---
title: Making Data Centers Greener with Machine Learning
date: 2023-05-03
author: Charlie Feng
description: In the field of information technology, particularly in data centers, energy consumption is a pressing concern. Machine learning offers a compelling part of the solution for energy efficiency.
---

In the field of information technology, particularly in data centers, energy consumption is a pressing concern. Imagine a data center as a bustling city that never sleeps. Much like a city requires power to keep its infrastructure running, data centers need energy to manage a massive and constant stream of compute, storage, networking, and cooling. However, if the city is not planned and managed effectively, it can result in energy wastage, leading to unnecessary costs and environmental issues. In this context, machine learning offers a compelling part of the solution for energy efficiency in data centers.

An approach to optimizing energy consumption in cloud data centers is through the use of reinforcement learning, a branch of machine learning where an agent learns to make decisions by interacting with its environment. Think of virtual machines as the inhabitants in the bustling city that never sleeps. These inhabitants need to be organized effectively to reduce congestion, much like city planning. The reinforcement learning model is the city planner for this digital metropolis. It learns the best ways to organize virtual machines through a system of trial and error, with the goal of reducing energy consumption.

Machine learning can also be applied to adaptive scheduling and power-aware management of data centers. This approach is akin to an intelligent traffic management system that adjusts the flow of vehicles based on real-time traffic conditions to reduce congestion and, therefore, fuel consumption. Similarly, machine learning-enabled systems adaptively schedule tasks and manage power in data centers based on real-time conditions, leading to energy savings.

## Data Points from Research

Farahnakian et al.'s reinforcement learning approach reduces data center energy consumption by up to 27% compared to existing methods, without compromising on service level agreements.[^1] Here, reinforcement learning is used to consolidate virtual machines in a way that minimizes energy consumption. The algorithm keeps trying different consolidation methods and gauges their success by how much energy is saved. Over time, the algorithm becomes smarter and improves its consolidation strategy, much like how a city planner learns from past plans to create a more efficient city layout.

Berral et al.'s machine learning model for energy-aware scheduling achieves an energy reduction rate of 20% while maintaining performance metrics.[^2] In this model, the researchers use machine learning to predict the energy required for different tasks. The algorithm learns from past data on task energy consumption to predict future requirements, leading to more efficient task scheduling and reducing overall energy usage.

Berral, Gavalda, and Torres report that their machine learning-based adaptive scheduling technique results in a 15% decrease in energy usage while ensuring optimal performance.[^3] Here, the researchers propose a flexible scheduling system that can adapt to changing conditions in real-time. This adaptive scheduling approach enables the data center to respond quickly to changes, ensuring optimal performance and adherence to service-level agreements with minimal energy use.

## Business Implications

The energy optimization strategies from machine learning can significantly transform the business landscape of data center operations. While the immediate benefit is a reduction in energy costs, the impact can be broad in terms of improving competitiveness, user satisfaction, and corporate responsibility.

Machine learning enabled optimizations can lead to an estimated 15-27% reduction in energy costs compared to traditional methods, as demonstrated by previous research papers on the subject. This can translate into substantial savings for data center operators. Given that the global data center electricity consumption was estimated at ~200 TWh in 2018—around 1% of global electricity use[^4]—a 20% energy saving could result in annual savings of 40 TWh. To put this into perspective, this is equivalent to the annual electricity consumption of countries like Denmark or Switzerland[^5].

Enhanced energy efficiency can significantly boost a company's profitability and competitiveness. With the rise of cloud services, customers have a multitude of options to choose from. Energy-efficient data centers not only offer cost-effectiveness but also help deliver a reliable and smooth service, as an optimized allocation of power and workloads across data center components can lead to greater longevity and reduced downtime.

With the increasing awareness and demand for green technologies, data centers that adopt these energy optimization strategies are better positioned as environmentally responsible businesses. This can enhance brand value and appeal to a growing segment of customers who prefer to engage with eco-friendly businesses.

As the industry matures and power use grows, governments around the world are implementing stricter regulations regarding energy consumption and greenhouse gas emissions. Adopting machine learning-based energy optimization can help data centers comply with these regulations, avoid penalties, and even benefit from incentives for green technology adoption.

[^1]: Farahnakian, F., Liljeberg, P., & Plosila, J. (2015). Energy-Efficient Virtual Machines Consolidation in Cloud Data Centers Using Reinforcement Learning.

[^2]: Berral, J. L., Goiri, I., Nou, R., Julià, F., Guitart, J., Gavaldà, R., & Torres, J. (2014). Towards energy-aware scheduling in data centers using machine learning.

[^3]: Berral, J. L., Gavalda, R., & Torres, J. (2012). Adaptive Scheduling on Power-Aware Managed Data-Centers Using Machine Learning.

[^4]: “Recalibrating global data center energy-use estimates”: https://www.science.org/doi/10.1126/science.aba3758#:~:text=In%202018%2C%20we%20estimated%20that,over%20the%20same%20time%20period.

[^5]: “Energy consumption in Denmark”: https://www.worlddata.info/europe/denmark/energy-consumption.php
