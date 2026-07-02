## When to commit

Do not leave completed work uncommitted. Once a logical unit of work is done
and the tree is green, commit it — don't wait to be asked. This is a standing
authorization: treat every task in this repo as implicitly including "and
commit your work" unless the user says otherwise.

Commit as you go, not all at once at the end. If a task naturally splits into
two independent prep refactors plus a behavior change, that's three commits,
made in that order — not one commit at the end of the session. (Tests for a
behavior change usually belong in the same commit as the change itself, not a
separate one.)

## How to structure commits

Prefer a fine-grained commit history. Commits should be as small as possible
while still being meaningful and self-contained.

- **Every commit must compile and pass all tests.** No "WIP" commits, no
  commits that leave the tree broken and rely on a follow-up to fix it.
- **Every commit must be `gofumpt`-formatted.** Run `just format` before
  committing.
- **Commit messages explain _why_, not _what_.** The diff already shows what
  changed; the message should capture the motivation, the constraint, or the
  bug being fixed. If the reason is obvious from a one-line subject, no body
  is needed — but never paraphrase the diff.
- **Separate preparatory refactorings from behavior changes.** If a fix or
  feature is easier to review after a refactor, land the refactor in its own
  commit first. Pure refactors should be behavior-preserving; the commit that
  changes behavior should be as small as possible. This applies even when the
  refactor only becomes apparent _while_ writing the behavior change — e.g. you
  extract a helper to avoid duplication. Don't let "I discovered it mid-change"
  excuse bundling it in. Before committing, review your diff and split out any
  hunk that is behavior-preserving (an extraction, a rename, a move) into a
  preceding commit, by staging hunks or resetting and recommitting in order.
- **Do not use conventional commits** (no `feat:`/`fix:`/`chore:` prefixes).
  Match the plain English imperative style of the existing history.
- **Wrap message body to 72 characters**. The subject is allowed to go up to 80
  characters, or even a little more if needed to convey a good single-line
  summary; the body should be wrapped at 72 exactly, no more, no less.

## Iterate with `fixup!` commits

When refining work that's already committed — adjusting an approach,
incorporating an idea from elsewhere, fixing something that belongs to the
same logical unit — create a fixup against the target commit
(`git commit --fixup=<sha>`) so it sits alongside its target, ready for the
user to fold in later with `git rebase --autosquash`. Don't pile follow-up
commits on top with the intent of squashing them later.

This holds **even when the target is the most recent commit (HEAD)**: use
`git commit --fixup`, not `git commit --amend`. A direct `--amend`
produces the same end state, which makes it tempting, but the point of a
fixup isn't only clean autosquash — it's that the refinement lands as a
separate, reviewable commit that the user decides when to fold in. A bare
`--amend` rewrites the commit on the spot and skips that checkpoint. Don't
treat "I'm only touching the tip commit" as an exception.

If the changes don't map cleanly onto existing commits — say they cut
across several of them, or restructure something at a different layer
than any existing commit naturally owns — stop and ask the user how to
proceed. Resetting the branch and redoing the work is sometimes the right
call, but it's the user's call to make.

After writing a fixup, re-read the target commit's message. If anything in
that message has become inaccurate or misleading because of the fixup, use
an `amend!` commit instead. The safest way to create one is
`git commit --fixup=amend:<sha>`, which opens the editor prefilled with the
target's existing message for you to revise.

An `amend!` commit's message has this exact shape:

```
amend! <original subject>

<new subject>

<new body>
```

The first line (`amend! <original subject>`) is **only the matcher** that
ties the commit to its target — it must equal the target's current subject.
Everything after the blank line is the **complete replacement message**, so
it must begin with a subject line of its own. Even when you only mean to
change the body, you still repeat the (unchanged) subject as that first line.

This is the trap when writing the message by hand with `-m` instead of using
the prefilled editor: if you pass only the body, there is no replacement
subject line, so after autosquash the target loses its subject and the first
body paragraph silently gets promoted to the subject. By hand it must be
`-m "amend! <subject>" -m "<subject>" -m "<body>"` — note the subject appears
twice, once in the matcher and once as the start of the replacement message.

A plain `fixup!` keeps the original message verbatim, so message drift stays
in unless you explicitly correct it.

**Never squash the fixups yourself.** Leave them in the history as separate
commits. Do not run `git rebase --autosquash`, do not `git commit --amend`
them into their targets, do not reorder or otherwise collapse them — not as
a "finishing" step, not to tidy up before handing off, not because the tree
looks messy. The whole point of a fixup is that the iteration stays
**visible and reviewable**; squashing it away yourself destroys exactly the
artifact it exists to create. Collapsing fixups into their targets is the
user's action, taken once they've reviewed the iterations. Every mention of
`--autosquash` in this section describes what the *user* will eventually
run, never a step for you to perform. If you think the history is ready to
collapse, say so and leave it to them.

The same commit-structure rules apply to `fixup!` and `amend!` commits as
to regular ones: each must be a self-contained logical unit, and unrelated
changes must not be combined just because they happen to target the same
commit. If you have two independent refinements for the same target, make
two separate fixups. Reviewability of the intermediate state matters even
when the end state after autosquash would be identical.

## Surface mid-implementation decisions; decide them together

Planning can't anticipate everything. When a decision surfaces while you're
implementing — a design choice, a tradeoff, a scope cut, a "this turned out
harder than expected, so maybe X" — don't quietly make the call and keep
going, even if you have a clear recommendation and even if the call seems
small. Stop, lay out the options and your recommendation, and let me weigh in.
I want to make these calls _with_ you, not discover them after the fact in the
diff.

This isn't a request to stop and ask about every trivial detail; obvious
mechanical choices with one sensible answer don't need a checkpoint. It's about
genuine forks — the ones where a reasonable person might pick differently, or
where you'd be trading away something the plan assumed (scope, UX, performance,
reload behavior, …). When in doubt, surface it.

## Prefer the cleaner design over the smaller diff

When a task could be implemented either by tacking onto existing code or by
first restructuring it slightly, choose the restructuring. "Minimal change" is
not a goal in itself; a readable final state is. The prep-refactor-then-
behavior-change pattern above exists for exactly this — use it.

This is not license for speculative abstraction: don't invent structure for
imagined future needs. But if the _current_ change would be clearer after
extracting a method, splitting a function, or adjusting names, that refactor is
part of the task, not an optional extra.

If you catch yourself thinking any of these, stop and refactor first:

- "This does a bit of wasted work, but it's harmless."
- "I'll just add the new behavior alongside the old."
- "The existing method does more than I need, but calling it is fine."

## Demonstrating bugs before fixing them

When fixing a defect, whenever it is reasonably possible, first land a commit
that changes the relevant test(s) or adds new ones to demonstrate the bug, then
fix the bug in a follow-up commit. This gives reviewers (and `git bisect`) a
clear before/after and proves the test actually exercises the broken code path.

Use the `EXPECTED` / `ACTUAL` pattern in the bug-demonstrating commit. The test
asserts the current (wrong) behavior so it passes on the broken code, with the
correct expectation preserved inline as a comment. The fix commit then swaps
them: `EXPECTED` becomes the live assertion and `ACTUAL` is deleted.

## Unify duplicated logic before you change it

When a fix or feature would land in logic that's duplicated across two or more
call sites, don't patch one copy and move on — that's how the copies silently
drift. (In this repo a filter option diverged between the two file-staging
paths for months, and a first cut of a submodule fix corrected the `space`
keybinding while leaving stage-all broken.) Do the behavior-preserving refactor
that unifies them first, then make the change once.

Keep that refactor at the foundation of the branch, before the change. Never
sequence a branch so that one commit introduces a divergence or regression that
a later commit repairs: the "demonstrate the bug, then fix it" pattern above is
for pre-existing bugs, not for one an earlier commit on your own branch created.
Follow this even when the need for the refactor is only discovered in the middle
of working on the branch; suggest to the user to rewrite the history to move the
refactor to an earlier commit (but don't do it without asking first).

## Code comments are for future readers, not development history

Comments in source code explain *why this code is shaped the way it is*. They
are not the place to narrate the path we took during development — what was
tried first, what didn't work, what's "more reliable" or "cleaner" than some
alternative. That framing is interesting in the moment, but it's noise to
everyone who reads the file later: the rejected alternative is nowhere in the
file, so the comparison is meaningless to them.

Avoid phrasings like:

- "more reliable than triggering one manually"
- "cleaner than the previous approach"
- "we used to ... but ..."
- "after trying X, we found Y"

The iteration story is sometimes worth preserving — but it belongs in the
commit message, which is the durable record of *why this change was made*. The
code comment should make sense to someone who has never seen any prior version
and is just trying to understand the file as it currently exists.

## Don't present "live with the bug" as an option

When you're investigating a defect and laying out fix options for the user,
"accept the race / leave it as-is / document it and move on" is not one of
them. A known race condition, data corruption, or correctness violation is a
bug that needs a real fix, not a tradeoff. Even if the failure rate is low,
even if the window is tiny, even if no current code path appears to hit it —
present actual fixes. If a real fix is genuinely out of reach (e.g. it
requires API changes you can't make), say so plainly; don't dress "no fix"
up as a viable option in a numbered list alongside real ones.
