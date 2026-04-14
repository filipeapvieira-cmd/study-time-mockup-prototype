/**
 * Business value:
 * Generates AI analytics narratives from deterministic evidence so students get
 * actionable study guidance tied to real usage patterns.
 */
import { generateText, Output } from "ai"

import {
  analyticsInsightsOutputSchema,
  type AnalyticsInsightsRequest,
  type AnalyticsInsightsResponse,
} from "@/lib/ai/contracts"
import { getStudyTimeAiModel } from "@/lib/ai/provider"

export function buildAnalyticsInsightsPrompt(input: AnalyticsInsightsRequest) {
  return `
You are writing AI-supported study analytics insights for a student-facing dashboard.

Your job:
- explain only patterns supported by the provided evidence
- give practical study actions
- stay conservative

Hard constraints:
- do not infer talent, intelligence, career fit, grades, or true mastery
- do not claim the student is objectively weak at something unless the student explicitly wrote that
- use the user's written reflection excerpts as qualitative context, not as proof of performance
- if evidence is thin, say so plainly
- every insight must include one concrete next action

Analytics range: ${input.rangeLabel}
Period: ${input.period}
Date from: ${input.from ?? "n/a"}
Date to: ${input.to ?? "n/a"}
Total sessions: ${input.totalSessions}
Total topic hours: ${input.totalTopicHours}

Subject distribution:
${JSON.stringify(input.subjectDistribution, null, 2)}

Weekday distribution:
${JSON.stringify(input.weekdayDistribution, null, 2)}

Start hour distribution:
${JSON.stringify(input.startHourDistribution, null, 2)}

Dormant subjects:
${JSON.stringify(input.dormantSubjects, null, 2)}

Dormant tags:
${JSON.stringify(input.dormantTags, null, 2)}

Recent topic excerpts:
${JSON.stringify(input.recentTopicExcerpts, null, 2)}
`.trim()
}

export async function generateAnalyticsInsights(
  input: AnalyticsInsightsRequest,
): Promise<AnalyticsInsightsResponse> {
  const { output } = await generateText({
    model: getStudyTimeAiModel(),
    output: Output.object({
      schema: analyticsInsightsOutputSchema,
      name: "study_analytics_insights",
      description:
        "A concise analytics overview with 2 to 4 evidence-backed study insight sections.",
    }),
    prompt: buildAnalyticsInsightsPrompt(input),
  })

  return {
    ...output,
    generatedAt: new Date().toISOString(),
  }
}
