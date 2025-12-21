# UX Patterns & Learnings

## Dev Mode / Glass Box
- **Pattern**: `DevModeToggle` and `DebugContext`
- **Purpose**: To showcase technical depth without overwhelming non-technical users.
- **Implementation**: A boolean state (`devMode`) controls the visibility of a "Debug Context" section within each chat message. This section displays the RAG chunks retrieved for that message.
- **Takeaway**: Progressive disclosure is effective for portfolios that need to serve both recruiters (high-level) and engineers (low-level detail).

## Architecture Map
- **Pattern**: Interactive Node Graph Modal
- **Purpose**: To visualize the system architecture (React -> Edge -> Vector Store -> Gemini).
- **Implementation**: SVG-based node graph with hover states. Positioned as a modal triggered by a header button.
- **Takeaway**: Visualizing the "invisible" work (backend logic) increases the perceived value of the application.
