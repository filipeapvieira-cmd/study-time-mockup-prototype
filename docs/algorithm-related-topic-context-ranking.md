# Related Topic Context Ranking Algorithm

## Purpose in the Product
This algorithm supports the **AI Prompts** feature on the log-session page.  
It selects recent, relevant past topics so the AI can ask better reflection questions.

The aim is to keep prompts connected to the student’s own learning history.

## Inputs and Outputs
**Inputs**
- Current reflection request data:
  - selected subject
  - selected hashtags
  - current reflection text
- Stored study sessions (prototype dataset in this project)

**Output**
- A short list of related topic context items (maximum 4), each with:
  - date
  - subject label
  - hashtags
  - short reflection excerpt

This list is then injected into the final AI prompt.

## Step-by-Step Logic
1. Flatten session history into topic-level entries.
2. Keep only topics that are related to the current one:
   - same subject, or
   - at least one shared hashtag
3. Build compact context records for each related topic.
4. Convert rich reflection content to plain searchable text.
5. Trim long reflection text to a safe excerpt length (220 characters).
6. Sort related topics by date, newest first.
7. Keep only the top 4 entries.

The result is small, relevant context for question generation.

## Why This Design Was Chosen
This design balances clarity and reliability.

- It uses direct links (same subject or shared tags).
- It trims and limits context so prompts stay focused.
- It gives repeatable results for the same input.
- It avoids overloading the model with large, noisy history blocks.

## Connection to AI
This algorithm is a pre-AI selection stage.

- `buildRelatedTopicContext(...)` prepares ranked context items.
- `buildReflectionQuestionsPrompt(...)` inserts them into the “Related history” block.
- `generateReflectionQuestions(...)` sends the complete prompt to the model.
- The route `/api/reflection/questions` returns the final structured AI response.

So the algorithm does not generate the final wording itself, but it strongly shapes AI output quality.

## How It Appears to the User
On `/log-session`, the user opens **AI Prompts**.  
They receive three guided reflection questions.

The sheet tells the user that prompts use:
- selected subject
- selected tags
- current reflection draft
- related study history

The “related study history” part comes from this ranking algorithm.

## Simple Worked Example
Assume the user selects:
- Subject: Mathematics
- Tags: `#algebra`, `#proof`

History contains six past topics.  
Three match by subject or shared tag.

Processing result:
- The three matches are kept.
- Their reflection texts are shortened.
- They are sorted by date (newest first).
- If there were more than four matches, only the newest four would remain.

These records are added to the AI prompt before questions are generated.

## Limitations and Safe Boundaries
- Matching is rule-based (subject/tag overlap), not semantic understanding.
- It may miss useful older context because of the top-4 limit.
- It supports reflective guidance only; it does not assess ability or grade quality.

## Code Evidence
- Context ranking logic:
  - `lib/ai/reflection-questions.ts` (`buildRelatedTopicContext`)
- Prompt assembly that consumes ranked context:
  - `lib/ai/reflection-questions.ts` (`buildReflectionQuestionsPrompt`)
- AI generation call:
  - `lib/ai/reflection-questions.ts` (`generateReflectionQuestions`)
- API route:
  - `app/api/reflection/questions/route.ts`
- UI trigger and request call:
  - `components/log-session/ai-questions-sheet.tsx` (`fetch("/api/reflection/questions", ...)`)
