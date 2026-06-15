### Developer Pre-Submit Checklist

Before requesting review when using AI Assistance, I confirm:

- [ ] I filled out `.brainsback/<task-folder>/TODO.md` with a clear plan **before** coding
- [ ] I completed `.brainsback/<task-folder>/REACTO.md` explaining my understanding using REACTO-SE
- [ ] AI generated `.brainsback/<task-folder>/REPORT.md` summarizes the changes accurately
- [ ] I manually tested the changes
- [ ] I added/updated tests where appropriate
- [ ] I understand the trade-offs and can defend my design choices

---

### Change Summary

<!-- High-level summary for human reviewers - what problem does this solve? -->



### Key Design Decisions

<!-- What were the main architectural or algorithmic choices? Why? -->



### Testing Strategy

<!-- How did you verify this works? Manual tests? Unit tests? -->



### Known Limitations / Follow-ups

<!-- What's intentionally left out? What should be addressed later? -->



---

**For reviewers:** See `.brainsback/<task-folder>/REACTO.md` for detailed technical explanation.

**Instructions for @github-copilot reviewer:**
> 
> This repository implements **Mastery-Aware Pipelines** to prevent Cognitive Bypass. Before approving this PR, you MUST:
> 
> 1. **Read these artifacts in order:**
>    - `.brainsback/<task-folder>/TODO.md` — Strategic plan
>    - `.brainsback/<task-folder>/REPORT.md` — Implementation summary
>    - `.brainsback/<task-folder>/REACTO.md` — Proof of mastery
> 
> 2. **Verify mastery by checking:**
>    - Does `REACTO.md` demonstrate deep understanding (not surface-level)?
>    - Are edge cases and trade-offs explicitly discussed?
>    - Does the code diff align with the plan in `TODO.md`?
>    - Does `REPORT.md` accurately describe what changed and why?
> 
> 3. **Ask Socratic questions** about:
>    - Concurrency and race conditions
>    - Failure modes and error handling
>    - Performance implications
>    - Alternative approaches considered
> 
> 4. **Red flags for Cognitive Bypass:**
>    - Empty or template-only `REACTO.md`
>    - Vague explanations like "it just works"
>    - Missing discussion of trade-offs
>    - No mention of edge cases or tests
> 
> **Your role:** Test the developer's mental model, don't just approve the code.

---
