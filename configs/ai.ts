import {
  GoogleGenAI,
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai"

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
}

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
}

const settings = {
  maxOutputTokens: 32768,
  temperature: 1,
  topP: 0.95,
  responseModalities: ["IMAGE"],
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.OFF,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.OFF,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.OFF,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.OFF,
    },
  ],
}

type Params = {
  title: string
  user_prompt?: string
  aspect_ratio?: "16:9" | "1:1" | "9:16"
  style: keyof typeof stylePrompts
  color_scheme?: keyof typeof colorSchemeDescriptions
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export default async function generateImage({
  title,
  style,
  aspect_ratio,
  user_prompt,
  color_scheme,
}: Params) {
  let finalBuffer: Buffer | null = null

  const config: GenerateContentConfig = {
    imageConfig: {
      aspectRatio: aspect_ratio || "16:9",
      imageSize: "1K",
    },
    ...settings,
  }

  const prompt = generatePrompt({
    title,
    style,
    aspect_ratio,
    user_prompt,
    color_scheme,
  })

  // Generate the image using the ai model
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image",
    contents: [prompt],
    config,
  })

  const parts = response?.candidates?.[0]?.content?.parts

  if (!parts) throw new Error("Unexpected response")

  const data = parts[0]?.inlineData?.data

  if (data) {
    finalBuffer = Buffer.from(data, "base64")
  }

  if (!finalBuffer) throw new Error("Failed to generate image")

  const base64Image = `data:image/png;base64,${finalBuffer.toString("base64")}`

  return base64Image
}

function generatePrompt({
  title,
  style,
  aspect_ratio,
  user_prompt,
  color_scheme,
}: Params) {
  let prompt = `Create a ${stylePrompts[style]} for: "${title}". The thumbnail should be ${aspect_ratio || "16:9"}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`

  if (color_scheme) {
    prompt += `Use a ${colorSchemeDescriptions[color_scheme]} color scheme.`
  }

  if (user_prompt) {
    prompt += `Additional details: ${user_prompt}. `
  }

  return prompt
}
