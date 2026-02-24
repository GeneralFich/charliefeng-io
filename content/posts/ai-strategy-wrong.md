---
title: "Your AI Strategy Is Already Wrong"
date: 2026-02-23
author: Charlie Feng
description: "Most AI strategy writing fails the people who actually have to implement it. Here's what the consulting frameworks miss - and what actually compounds."
---

Most AI strategy writing fails the people who actually have to implement it. Almost nobody producing this content seems to notice.

I work on AI infrastructure at Google - document management systems, knowledge agents, program management tooling. I watch organizations adopt AI strategies written by McKinsey and Gartner, lock into platforms, then spend the next twelve months working around the tools they just deployed. The strategy documents collecting dust on SharePoint are artifacts of a world that moved on while the ink was drying.

In January 2025, two models - Claude Sonnet and GPT-4o - held 91.5% of enterprise AI queries. By December, no single model held more than 23%. The entire competitive landscape restructured in a calendar year. Meanwhile, 78% of employees were using AI tools their employer hadn't sanctioned - not because they're rebels, but because the sanctioned tools weren't keeping up.

McKinsey finds only 6% of organizations qualify as AI high performers. BCG says 5% are "future-built." MIT's NANDA puts it starkly: 95% of enterprise AI pilots deliver zero measurable P&L impact. Everyone agrees the patient is sick. But the prescription - maturity models, readiness assessments, phased roadmaps - is part of the disease.

## The frameworks prescribe certainty in a system that punishes it

Pick up any major AI strategy document from the last year. You'll find a maturity model with five levels. A prioritization matrix. A recommendation to establish C-suite governance. What you won't find is an honest reckoning with the fact that the technology it describes will be substantially different by the time the strategy gets implemented.

GPT-4's input token cost was $30 per million in March 2023. By mid-2025, equivalent capability cost under $2 - a 93% decline in roughly two years. Context windows expanded from 4,000 tokens to 2 million in the same period. These aren't incremental improvements. They're phase changes. When Epoch AI tracks inference costs declining at a median of 50x per year, your 18-month AI roadmap is planning for a world that won't exist by the time you execute quarter two.

Klarna replaced 700 customer service agents with an OpenAI chatbot in 2023. It handled 2.3 million conversations a month. By early 2025, customer satisfaction had dropped 22%, and the company was rehiring humans. McDonald's spent three years building AI drive-thru ordering with IBM, then killed the partnership after the system kept adding bacon to ice cream sundaes. S&P Global found that 42% of companies abandoned most of their AI initiatives in 2025 - up from 17% the year before. These aren't execution failures. They're failures of strategy that assumed the current tool was the right tool.

## The real advantage is switching cost, not tool choice

If your AI tooling will be wrong in 12 months - and the data overwhelmingly says it will - then the strategic question isn't "which AI tool should we adopt?" It's "how cheaply can we switch when the better option arrives?"

This is an infrastructure problem, not a vision problem. It means building abstraction layers between your workflows and your models. It means favoring prompt-based approaches over fine-tuning, because fine-tuned models create lock-in that prompt-engineered workflows don't. It means treating vendor contracts like short-term leases, not long-term mortgages.

92% of Fortune 500 companies now use multi-model platforms, with top accounts running 30 different AI models on average. The a16z enterprise survey confirms the posture shift - innovation budgets dropped from 25% of LLM spend to just 7% in a single year, not because companies stopped innovating, but because they stopped treating AI as an experiment and started treating it as fungible infrastructure. The winning posture is architectural flexibility, not tool loyalty.

## Context integration is the durable advantage

Institutional knowledge doesn't depreciate when you switch models. That's the whole point.

Ethan Mollick - the most practitioner-cited voice in AI strategy - puts it directly: "If you built a 'talk-to-our-documents' chatbot when I was warning you not to do that a year and a half ago, you now have a mediocre chatbot easily beaten by an off-the-shelf model." The chatbot was the wrong investment. The knowledge infrastructure underneath it was the right one.

42% of institutional knowledge resides solely with individual employees. When they leave, nearly half of what the organization knows walks out the door. AI makes this acute - because a system with access to well-structured institutional context dramatically outperforms one running on generic training data, regardless of which model powers it. The context layer is model-agnostic. It compounds over time. And it's the one piece of your AI stack that gets more valuable as models get cheaper and more capable.

The practical work isn't glamorous. It's unifying scattered data assets into searchable, machine-readable formats. It's capturing decision rationale from Slack threads and meeting transcripts. It's building knowledge graphs that preserve relationships between projects, people, and outcomes. This is what I spend my days doing - and it's the investment that survives every model transition.

## Shadow AI is your best strategy signal

When 78% of your employees use AI tools you didn't approve, that isn't a governance crisis. It's a market signal. Your workforce is telling you, directly, that your sanctioned tools aren't solving their actual problems.

MIT NANDA found that workers at over 90% of surveyed organizations use personal AI tools regularly, even though only 40% of those companies give them an official LLM subscription. One corporate lawyer in the study worked at a firm that invested $50,000 in a specialized contract analysis tool - and she consistently used ChatGPT instead. Not out of defiance. Out of pragmatism.

The useful response isn't to ban shadow AI or double down on the enterprise tool employees are already routing around. It's to study the shadow. What tools are people choosing? For which tasks? What does that reveal about where your official tooling fails? Mollick calls these users "secret cyborgs" - people who've figured out how AI fits their workflow through daily experimentation. They're your best strategists. Build a path for their insights to reach the people setting direction, and you've created something no consulting framework can sell you: a feedback loop between the work and the strategy that runs in real time.

---

## Research appendix: key data sources

### AI strategy framework landscape

- **McKinsey "State of AI" (Nov 2025, 1,993 respondents):** 88% of orgs use AI in ≥1 function; only ~6% are "AI high performers" (5%+ EBIT impact)
- **BCG "Build for the Future" (2025, 1,250 executives):** Only 5% of companies are "future-built"; their DRI (Deploy-Reshape-Invent) framework and 10/20/70 rule (70% on people/process)
- **Gartner AI Maturity Model:** Only 1 in 5 AI initiatives achieve ROI; 1 in 50 deliver transformation; calls for "dynamic" strategy with disruption-triggered reviews
- **HBR:** Multiple frameworks (Gen AI Playbook, 3 Strategic Archetypes); W. Chan Kim critique: "When companies lead with AI or treat it as the answer, they put the cart before the horse"
- **a16z Enterprise CIO Survey (100 CIOs, 2025):** Multi-model world is reality; 37% use 5+ models; innovation budgets dropped from 25% to 7% of LLM spend
- **Deloitte State of AI 2026 (3,235 leaders, 24 countries):** Only 34% using AI for deep transformation; 42% believe strategy is prepared but only 20% feel prepared on talent

### Shadow AI data

- 78% of employees use unapproved AI tools (WalkMe/SAP 2025 survey, 1,000 U.S. workers)
- 80% of American office workers use AI, only 22% exclusively use employer-provided tools (IBM 2025, 3,000 workers)
- 90%+ of workers at MIT-surveyed orgs use personal AI tools; only 40% of companies buy enterprise subscriptions (MIT NANDA)
- OpenAI accounts for 53% of all shadow AI usage (Reco.ai 2025 State of Shadow AI Report)
- Shadow AI-associated breaches cost organizations ~$670K more on average (IBM Cost of a Data Breach 2025)

### Token cost and context window trends

- GPT-4 input: $30/M tokens (Mar 2023) → $2.50/M (Aug 2024) → ~$2/M (2025) = 93% decline
- Epoch AI: LLM inference costs declining ~10x annually; median 50x/year; post-Jan 2024 accelerated to 200x/year
- Context windows: 4K tokens (early 2023) → 32K → 128K → 200K → 1M → 2M tokens (late 2025)
- GPT-4 equivalent performance: $20/M tokens (late 2022) → $0.40/M tokens (Dec 2025) = 50x decline

### Enterprise AI failure and lock-in data

- 95% of enterprise AI pilots deliver zero measurable P&L impact (MIT NANDA, July 2025)
- 42% of companies abandoned most AI initiatives in 2025, up from 17% in 2024 (S&P Global)
- 80%+ of AI projects fail — 2x the failure rate of non-AI IT projects (RAND Corporation, 2024)
- Only 25% of AI projects deliver on promised ROI; only 16% scale enterprise-wide (IBM survey of 2,000 CEOs)
- Enterprise model market share: 91.5% duopoly (Jan 2025) → four-model distribution by Dec 2025
- Klarna: replaced ~700 agents, satisfaction dropped 22%, now rehiring
- McDonald's/IBM AOT partnership: ended July 2024 after 3 years of AI drive-thru testing
- 42% of institutional knowledge resides solely with individual employees (Enterprise Knowledge)

### Practitioner voices

- **Ethan Mollick "One Useful Thing" (100K+ subscribers):** "Nobody has a playbook"; Leadership/Lab/Crowd framework; "secret cyborgs"
- **Simon Willison:** Practitioner-first, shows real workflows and costs, honest about AI limitations
- **Ishaan Agarwal (Senior PM, Square):** "Companies are treating AI like Victorian-era physicians treated leeches"
- **Continue.dev/Ty Dunn on context engineering:** "Most organizations are sitting on vast amounts of valuable context... but this information exists in a form largely inaccessible to both humans and AI"
