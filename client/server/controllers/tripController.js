import { GoogleGenAI, Type } from "@google/genai";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(ai, prompt, config) {
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`🤖 Trying ${model}...`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      console.log(`✅ Gemini response received from ${model}`);

      return response;
    } catch (error) {
      lastError = error;

      const status = Number(
        error?.status ||
          error?.code ||
          error?.response?.status
      );

      console.error(
        `❌ ${model} failed:`,
        error?.message || error
      );

      // Retry only temporary errors
      if (status === 503 || status === 429) {
        console.log("⏳ Temporary Gemini issue. Retrying once...");

        await sleep(1000);

        try {
          const retryResponse =
            await ai.models.generateContent({
              model,
              contents: prompt,
              config,
            });

          console.log(
            `✅ Retry successful with ${model}`
          );

          return retryResponse;
        } catch (retryError) {
          lastError = retryError;

          console.log(
            `⚠️ Retry failed for ${model}.`
          );
        }
      }

      // 404 / invalid model → immediately try next model
      if (status === 404) {
        console.log(
          `⚠️ ${model} unavailable. Switching model...`
        );
      }
    }
  }

  throw lastError;
}

export const generateTrip = async (req, res) => {
  try {
    const {
      destination,
      days,
      travellers,
      budget,
      travelStyle,
      interest,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (
      !destination ||
      !days ||
      !travellers ||
      !budget ||
      !travelStyle ||
      !interest
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all trip details.",
      });
    }

    // -----------------------------
    // API KEY CHECK
    // -----------------------------

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    // -----------------------------
    // GEMINI CLIENT
    // -----------------------------

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const tripDays = Number(days);
    const travellerCount = Number(travellers);
    const tripBudget = Number(budget);

    // -----------------------------
    // AI PROMPT
    // -----------------------------

    const prompt = `
You are TripNexus, an intelligent AI travel planner.

Create a realistic and personalized travel itinerary.

USER TRIP DETAILS:

Destination: ${destination}
Duration: ${tripDays} days
Travellers: ${travellerCount}
Total Budget: ₹${tripBudget}
Travel Style: ${travelStyle}
Main Interest: ${interest}

REQUIREMENTS:

1. Create exactly ${tripDays} itinerary days.
2. Each day must contain:
   - day
   - title
   - description
3. Make the itinerary realistic for ${destination}.
4. Focus on ${interest}.
5. Follow the ${travelStyle} travel style.
6. Suggest realistic attractions and activities.
7. Keep descriptions concise and useful.
8. Budget percentages must total exactly 100.
9. Give useful travel insights.
10. Do not use markdown.
11. Return ONLY JSON matching the schema.
`;

    // -----------------------------
    // STRUCTURED OUTPUT
    // -----------------------------

    const config = {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          itinerary: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                day: {
                  type: Type.INTEGER,
                },

                title: {
                  type: Type.STRING,
                },

                description: {
                  type: Type.STRING,
                },
              },

              required: [
                "day",
                "title",
                "description",
              ],
            },
          },

          budgetBreakdown: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                label: {
                  type: Type.STRING,
                },

                percentage: {
                  type: Type.NUMBER,
                },
              },

              required: [
                "label",
                "percentage",
              ],
            },
          },

          insights: {
            type: Type.STRING,
          },
        },

        required: [
          "itinerary",
          "budgetBreakdown",
          "insights",
        ],
      },
    };

    // -----------------------------
    // CALL GEMINI
    // -----------------------------

    const response = await callGemini(
      ai,
      prompt,
      config
    );

    // -----------------------------
    // PARSE RESPONSE
    // -----------------------------

    const aiData = JSON.parse(response.text);

    // -----------------------------
    // ITINERARY
    // -----------------------------

    let itinerary = Array.isArray(aiData.itinerary)
      ? aiData.itinerary
          .slice(0, tripDays)
          .map((item, index) => ({
            day: index + 1,
            title: item.title,
            description: item.description,
          }))
      : [];

    // Safety fallback
    while (itinerary.length < tripDays) {
      const nextDay = itinerary.length + 1;

      itinerary.push({
        day: nextDay,
        title: `Day ${nextDay} Exploration`,
        description: `Explore ${destination} and enjoy ${interest.toLowerCase()} experiences.`,
      });
    }

    // -----------------------------
    // BUDGET
    // -----------------------------

    let budgetBreakdown = Array.isArray(
      aiData.budgetBreakdown
    )
      ? aiData.budgetBreakdown
      : [];

    if (budgetBreakdown.length === 0) {
      budgetBreakdown = [
        {
          label: "Stay",
          percentage: 35,
        },
        {
          label: "Transport",
          percentage: 25,
        },
        {
          label: "Food",
          percentage: 20,
        },
        {
          label: "Activities",
          percentage: 15,
        },
        {
          label: "Other",
          percentage: 5,
        },
      ];
    }

    // -----------------------------
    // FINAL RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,

      trip: {
        destination,
        days: tripDays,
        travellers: travellerCount,
        budget: tripBudget,
        travelStyle,
        interest,

        itinerary,

        budgetBreakdown,

        insights:
          aiData.insights ||
          "Check local weather and travel conditions before travelling.",
      },
    });
  } catch (error) {
    console.error(
      "🔥 Final Gemini Error:",
      error?.message || error
    );

    const status = Number(
      error?.status ||
        error?.code ||
        error?.response?.status
    );

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI request limit reached. Please try again shortly.",
      });
    }

    if (status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini AI is temporarily busy. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI trip.",
      error: error?.message || "Unknown error",
    });
  }
};