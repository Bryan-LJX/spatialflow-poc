# AI Performance Report — SpatialFlow PoC

> A plain-language look at how well the AI (Claude) did while building this
> website, based only on the work logs from every session and the record of
> every feature request ("change") made in this project.

## 1. Scope and method

Between September 23 and September 25, the AI built this site across eight
work sessions. Six of those sessions each delivered one finished feature or
redesign:

1. Building the first version of the website
2. Redesigning it with a modern furniture-catalog look
3. Redesigning it again with a "cinematic, high-end" look
4. Adding user accounts and saved layouts
5. Splitting the site into two pages and adding smoother animations
6. Adding a small animated effect to a product photo

The other two sessions were setup and documentation work, not new features.

## 2. Successes

Several pieces of work were done correctly the first time, with nothing
needing to be fixed afterward:

- **The original planner tool** (drag-and-drop furniture placement, saving
  your layout) worked correctly the first time it was built and tested.
- **The furniture-catalog redesign** — pricing, power usage, room space
  used, shopping list — passed every check on the first try, and the
  numbers matched hand-calculated totals exactly.
- **User accounts and saved layouts** worked correctly in every test,
  including a security check confirming one person's saved layout truly
  cannot be seen or accessed by another person's account.
- **Splitting the site into two pages** (marketing page and planner tool)
  kept the planner working exactly as before — nothing broke in the move.
- **The photo licensing process** (using only freely-licensed images and
  keeping a credits list) was set up once and then followed correctly every
  time afterward, without needing to be reminded.

## 3. Hallucinations and incorrect technical assumptions

A few times, the AI built something based on an assumption that turned out
to be incorrect once actually tested in a real browser:

- Built an animation effect assuming a certain browser feature would make
  an image glide in as you scroll. It didn't work at all — the image never
  moved.
- Built a "fade in as you scroll" effect using a different browser feature.
  It mostly worked, but the very last section of the page stayed invisible
  no matter how far you scrolled — a dead end the AI hadn't anticipated.
- Tried to add a dashed-line warning outline using a shortcut styling
  option that, it turned out, doesn't support dashed lines at all. Had to
  use a different, more basic approach instead.
- Used a color-blending trick to make the site's top navigation bar
  automatically stay readable over any background. In practice it made the
  text hard to read over several sections, so it had to be replaced with a
  more manual (but reliable) approach.
- Used a color-blending trick to hide a white box around a product photo.
  It worked for that specific photo, but when the photo was swapped out
  later for a different one, the same problem came back in a milder form —
  because the trick only worked by coincidence for the first photo's exact
  background color.
- **The biggest one:** the AI initially misunderstood what "scroll-driven
  animations" meant. It built a full version with fade-in effects on the
  existing warm-toned design. The user then clarified they actually wanted
  a completely different, darker, more high-end visual style (similar to a
  private-jet company's website). The entire first attempt — code, images,
  documentation — had to be thrown away and rebuilt from scratch in the
  correct direction.

## 4. Manual interventions required during code generation

The AI could not complete everything alone. It needed the user to:

- Clarify what "scroll-driven animations" actually meant, after the first
  guess was wrong (see above).
- Watch three different versions of a chair animation and reject the first
  two live ("looks weird," then "not obvious enough") before approving the
  third.
- Ask again for the furniture photos to be re-added after they were
  accidentally lost when the earlier wrong-direction work was discarded.
- Personally set up the outside accounts the AI cannot create on its own —
  the database/login service (Supabase) and the hosting service (Vercel),
  plus connecting them to a GitHub account.
- Explicitly tell the AI not to open or read the file containing real login
  credentials, keeping that information private.
- Tell the AI not to save/publish a finished piece of work yet, because the
  user wasn't ready to make it public.
- Confirm it was OK to save an old work log that had been sitting unsaved
  since an earlier session.
- Report that a diagram looked too small on GitHub's website, which the AI
  had not checked before publishing it — it had to be redone as a
  different type of image afterward.
- Manually delete a section from the project's README file rather than
  asking the AI to do it.

## 5. Mistakes the user caught post-implementation that Claude did not catch first

This is the most important pattern in the report. Several times, the AI
tested its own work, declared it finished and working, and then the user
found a real problem anyway just by looking at it:

| Problem | How it was found |
| --- | --- |
| A metrics panel visually spilled slightly outside its container box on wide screens | User looked at screenshots of the finished page |
| A product photo visually overlapped with nearby text in an awkward way | User looked at screenshots of the finished page |
| Scroll animations weren't saving/replaying properly, the navigation bar text was hard to read, and furniture photos were missing entirely | All three reported by the user after the AI had already called the work finished |
| A chair animation "looked weird" (full spin) | User watched it live and rejected it |
| A second version of that same animation was "not obvious enough" | User watched it live and rejected it |
| A diagram on the README page was too small to read on GitHub | User viewed the actual published page |

**In short: every single one of these six problems was caught by the user
looking at or using the actual result — not by any test the AI ran on its
own beforehand.** By contrast, the AI's own checks were reliably good at
catching *functional* problems (wrong numbers, broken saving, security
leaks) — it just wasn't good at judging *how something looked or felt* to a
real person, and once it declared something "done," that was usually before
anyone had actually looked at it critically.

## 6. Edge cases where actual implementation differed from baseline predictions

A few technical problems only showed up once things were actually running
live, not while anything was being planned or written:

- Two animation systems running at the same time made the page's motion
  slightly out of sync with itself — only noticeable once actually watching
  it scroll, not from reading the plan.
- The login system was accidentally being started twice on the same page,
  which caused a warning and a risk of the login process getting confused —
  only surfaced as a warning message during live testing.
- A rare timing issue meant that if someone edited their layout in the
  exact instant after logging in or out, the change could be saved to the
  wrong place. This only showed up under deliberate, careful live testing.
- The website failed to publish correctly the first time because of a
  mismatched technical setting between the code and the hosting service —
  discovered only when the actual publish attempt failed.
- Text inside the login pop-up box was invisible (white text on a white
  background) — only visible once actually opening and using the pop-up.
- The AI's own screenshot tool occasionally produced blank or broken
  images while testing scroll animations. The AI correctly figured out this
  was a flaw in its own screenshot tool, not a real bug in the website — a
  case of correctly *not* chasing a false alarm.
- A styling trick that fixed a white-box problem around one photo turned
  out to only work by coincidence for that one photo's exact shade of
  white; a replacement photo brought the same problem back in a fainter
  form (see also section 2).

## 7. Summary

| Measure | Result |
| --- | --- |
| Features that worked correctly on the first try, no fixes needed | 3 out of 6 |
| Times the AI built something on a wrong technical assumption | 6 |
| Sessions where the user had to personally step in, correct, or approve something | 7 out of 8 |
| Real problems the user found that the AI's own testing had missed | 6 |
| Live surprises that didn't match the original plan | 7 |

**Bottom line:** The AI was consistently reliable at checking whether
things *worked correctly* — correct numbers, correct saving/loading,
correct security, no broken logins. It was consistently less reliable at
judging whether things *looked or felt right* to an actual person, or at
predicting rare browser/technical quirks before hitting them live. Nearly
every visual or aesthetic problem in this project was caught by the user,
not by the AI. The one major misstep on direction (the "scroll-driven
animations" mix-up) happened because the initial instruction was
open to more than one interpretation, and the AI guessed instead of asking
for clarification first — costing a full day's worth of discarded work
before the correct direction was confirmed.

---

*Sources: every work log in `docs/sessions/`, and the feature-request
records (proposal, design, and task files) for all six features listed at
the top of this report.*
