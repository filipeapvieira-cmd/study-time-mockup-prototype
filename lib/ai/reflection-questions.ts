/**
 * Business value:
 * Generates guided reflection questions from the student's current subject,
 * tags, notes, and recent history to improve reflection quality during logging.
 */
import { generateText, Output } from "ai"

import {
  reflectionQuestionsOutputSchema,
  type ReflectionQuestionsRequest,
  type ReflectionQuestionsResponse,
} from "@/lib/ai/contracts"
import { getStudyTimeAiModel } from "@/lib/ai/provider"
import { truncateNormalizedText } from "@/lib/ai/text-utils"
import { TEMP_STUDY_SESSIONS } from "@/lib/session-dummy-data"
import { reflectionToSearchText } from "@/lib/session-reflection"

type RelatedTopicContext = {
  date: string
  subjectLabel: string
  hashtags: string[]
  reflectionExcerpt: string
}

function buildRelatedTopicContext(
  input: ReflectionQuestionsRequest,
): RelatedTopicContext[] {
  return TEMP_STUDY_SESSIONS.flatMap((session) =>
    session.topics
      .filter(
        (topic) =>
          topic.subject === input.subjectValue ||
          topic.hashtags.some((tag) => input.hashtags.includes(tag)),
      )
      .map((topic) => ({
        date: session.date,
        subjectLabel: topic.subjectLabel,
        hashtags: topic.hashtags,
        reflectionExcerpt: truncateNormalizedText(
          reflectionToSearchText(topic.reflection),
          220,
        ),
      })),
  )
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 4)
}

function buildReflectionQuestionsPrompt(input: ReflectionQuestionsRequest) {
  const reflectionText =
    input.reflectionText.trim().length > 0
      ? truncateNormalizedText(input.reflectionText, 1800)
      : "No reflection text has been written yet."

  const hashtagBlock =
    input.hashtagLabels.length > 0
      ? input.hashtagLabels.join(", ")
      : "No hashtags selected."

  const relatedTopics = buildRelatedTopicContext(input)

  const historyBlock =
    relatedTopics.length > 0
      ? relatedTopics
          .map(
            (topic, index) =>
              `${index + 1}. ${topic.date} | ${topic.subjectLabel} | tags: ${
                topic.hashtags.length > 0
                  ? topic.hashtags.map((tag) => `#${tag}`).join(", ")
                  : "none"
              } | note: ${topic.reflectionExcerpt}`,
          )
          .join("\n")
      : "No related history found in the current prototype dataset."

  return `
You are generating guided reflection questions for a study logging interface.

Return exactly three questions.

Rules:
- Keep every question open-ended and concrete.
- Use the subject as the primary anchor.
- Use the user's written reflection text directly when it exists.
- Use hashtags and related history only as supporting context.
- Do not claim you know the student's real weaknesses or mastery.
- Do not infer talent, career fit, grades, or external performance.
- When the reflection is still short, ask starter questions that help the user deepen it.
- Vary the three questions across clarification, connection, and next-step thinking.

Current topic subject: ${input.subjectLabel}
Selected hashtags: ${hashtagBlock}

Current reflection draft:
${reflectionText}

Related history:
${historyBlock}
`.trim()
}

export async function generateReflectionQuestions(
  input: ReflectionQuestionsRequest,
): Promise<ReflectionQuestionsResponse> {
  const { output } = await generateText({
    model: getStudyTimeAiModel(),
    output: Output.object({
      schema: reflectionQuestionsOutputSchema,
      name: "reflection_questions",
      description:
        "Three guided reflection questions for a study session log, plus a short intro sentence.",
    }),
    prompt: buildReflectionQuestionsPrompt(input),
  })

  return {
    ...output,
    generatedAt: new Date().toISOString(),
  }
}
