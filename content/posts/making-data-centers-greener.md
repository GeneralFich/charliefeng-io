---
title: Making Data Centers Greener with Machine Learning
date: 2023-05-03
author: Charlie Feng
description: Machine learning can cut data center energy use by 15-27%. Three research results show how.
---

Data centers burn roughly 1% of the world's electricity - about 200 TWh in 2018.[^4] Machine learning can cut that by 15-27%. Three research results show how.

The biggest win comes from reinforcement learning applied to VM consolidation. Farahnakian et al. trained an RL agent to reorganize virtual machines across physical servers, minimizing energy without breaking SLAs.[^1] The agent tries different consolidation strategies, measures energy savings, and iterates. Result: 27% reduction over existing methods.

Two other approaches attack the scheduling layer. Berral et al. built a predictive model that forecasts energy requirements for incoming tasks, then schedules them to minimize total draw - a 20% reduction while maintaining performance.[^2] A follow-up from Berral, Gavalda, and Torres added real-time adaptivity: the scheduler adjusts on the fly as conditions change, cutting energy by 15%.[^3]

## What This Means for Operators

A 20% energy savings across all data centers would free up 40 TWh per year - roughly the annual electricity consumption of Denmark.[^4][^5] That's the macro picture.

The micro picture matters more to individual operators. Energy-efficient data centers cost less to run, last longer (optimized power allocation reduces component wear), and experience less downtime. In a cloud market where customers can switch providers in a week, those margins are competitive advantages.

There's also a regulatory angle. Governments worldwide are tightening energy and emissions rules for data centers. ML-based optimization gets operators ahead of compliance requirements rather than scrambling to meet them.

And the market is moving: customers increasingly choose providers with credible sustainability practices. Energy efficiency isn't just a cost play - it's a positioning play.

[^1]: Farahnakian, F., Liljeberg, P., & Plosila, J. (2015). Energy-Efficient Virtual Machines Consolidation in Cloud Data Centers Using Reinforcement Learning.

[^2]: Berral, J. L., Goiri, I., Nou, R., Julià, F., Guitart, J., Gavaldà, R., & Torres, J. (2014). Towards energy-aware scheduling in data centers using machine learning.

[^3]: Berral, J. L., Gavalda, R., & Torres, J. (2012). Adaptive Scheduling on Power-Aware Managed Data-Centers Using Machine Learning.

[^4]: "Recalibrating global data center energy-use estimates": https://www.science.org/doi/10.1126/science.aba3758#:~:text=In%202018%2C%20we%20estimated%20that,over%20the%20same%20time%20period.

[^5]: "Energy consumption in Denmark": https://www.worlddata.info/europe/denmark/energy-consumption.php
