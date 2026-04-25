/**
 * Lecturer note:
 * Main application URL: https://study-time-mockup-prototype.vercel.app/
 * Page where this algorithm's work can be observed from a user perspective:
 * https://study-time-mockup-prototype.vercel.app/analytics
 * On that page, click "AI Insights" in the top-right corner.
 */

# Dormant Subject and Tag Ranking Algorithm

## Purpose in the Product
This algorithm helps the analytics feature find topics that the student has not revisited for some time.  
It turns raw session history into a short, ordered list of neglected subjects and hashtags.

The main goal is practical guidance.  
The student should see where revision is likely needed.

## Inputs and Outputs
**Inputs**
- A list of filtered study sessions.
- An anchor date (the date used as the reference point for “how long ago”).

Each session has topics.  
Each topic has:
- A subject label.
- A duration.
- A list of hashtags.
- The session date.

**Outputs**
- `dormantSubjects`: up to 5 subjects with:
  - subject name
  - total hours studied
  - last studied date
  - days since last study
- `dormantTags`: up to 8 tags with:
  - tag
  - total uses
  - last studied date
  - days since last study

Only items with at least 7 days since last study are included.

## Step-by-Step Logic
1. Read each session, then each topic inside it.
2. Group data by key:
   - subject label for the subject list
   - hashtag value for the tag list
3. For each key, keep:
   - cumulative activity (`totalSeconds` or `totalUses`)
   - most recent study date (`lastStudiedOn`)
4. Convert grouped data into ranked signals:
   - compute `daysSinceLastStudy` from the anchor date
   - convert seconds to hours for subjects
5. Filter out non-dormant items (`daysSinceLastStudy < 7`).
6. Sort results:
   - first by `daysSinceLastStudy` (higher first)
   - then by impact (`totalHours` or `totalUses`, higher first)
7. Keep only the top items:
   - top 5 subjects
   - top 8 tags

## Why This Design Was Chosen
This design is easy to verify.

- It uses clear rules.
- It prioritises both recency gap and importance.
- It limits output length, so the AI and the user interface stay focused.
- It is stable: the same input gives the same output every time.

## Connection to AI
The algorithm itself is deterministic, but it directly supports AI quality.

- The ranked dormant signals are added to the analytics request payload in `buildAnalyticsInsightsRequest(...)`.
- That payload is sent from the analytics page to `/api/analytics/insights`.
- The API route then sends these signals to the AI insights generator.

So AI text is grounded in factual study history.

## How It Appears to the User
The user does not see this ranking table directly.  
Instead, it appears as part of AI-backed advice in the **Performance Analytics** screen.

When the user opens AI insights, the model can mention neglected subjects or tags and suggest concrete revision actions.  
These suggestions are based on the ranked dormant data.

## Simple Worked Example
Assume the selected range includes:
- Subject A: last studied 20 days ago, total 6.0 hours
- Subject B: last studied 20 days ago, total 2.0 hours
- Subject C: last studied 5 days ago, total 4.0 hours

Processing result:
- Subject C is removed (not dormant, only 5 days).
- Subject A and B remain.
- A is ranked above B because both are 20 days dormant, but A has more total hours.

The final shortlist then feeds the AI request as evidence.

## Limitations and Safe Boundaries
- The 7-day dormancy threshold is fixed. It is simple, but not personalised.
- It only analyses sessions inside the selected analytics range.
- It does not predict outcomes (for example, grades or performance).
- It supports decisions; it does not replace human judgement.

## Code Evidence
- Aggregation and ranking:
  - `lib/analytics-ai-evidence.ts` (`buildDormantSubjects`, `buildDormantTags`)
- Added into AI request payload:
  - `lib/analytics-ai-evidence.ts` (`buildAnalyticsInsightsRequest`)
- Called from analytics client flow:
  - `app/(app)/analytics/page.tsx` (`buildAnalyticsInsightsRequest(...)`)
- Sent to AI analytics endpoint:
  - `app/(app)/analytics/page.tsx` (`fetch("/api/analytics/insights", ...)`)
- AI route consumption:
  - `app/api/analytics/insights/route.ts` (`generateAnalyticsInsights(parsed.data)`)
