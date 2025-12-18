## 2024-02-14 - Loading State in Chat
**Learning:** Users lack confidence when AI response latency > 1s without feedback. The current "Send" button provided no visual cue that the request was processing, leading to potential double-clicks.
**Action:** Implemented a standard `Loader2` spinner replacement for the send icon during `isLoading` states. Future AI interactions should always couple the "thinking" state with immediate UI feedback near the action source (the button) rather than just the chat stream.
