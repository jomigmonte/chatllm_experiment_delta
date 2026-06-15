---
mode: agent
description: Run a Socratic review of the current project following the brainsback-reviewer skill specification.
---

Read the agent instructions from `_.github/skills/brainsback-reviewer/SKILL.md` and apply them to the current project state. Follow every rule in that file exactly — it defines the task ordering, the question sequence, the scoring dimensions, and the output format.

**Critical workflow note:** Before asking the developer any question, you MUST complete the **Question Preparation Phase**: read all inputs, prepare ALL questions (6 per task + comparative) with internal file/method references, write them into `/memories/session/socratic_review_bank.md` using the memory tool, and only then start asking. Do NOT re-read the repository between questions unless the developer presents an argument that requires it — all context is in the internal references block you prepared. As questions are answered, append them and the exact answers to `.brainsback/SOCRATIC_REVIEW.md`.
