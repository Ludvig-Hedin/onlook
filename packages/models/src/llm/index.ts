import type { LanguageModel } from 'ai';

export enum LLMProvider {
    OPENROUTER = 'openrouter',
}

export enum OPENROUTER_MODELS {
    // Generate object does not work for Anthropic models https://github.com/OpenRouterTeam/ai-sdk-provider/issues/165
    CLAUDE_4_5_SONNET = 'anthropic/claude-sonnet-4.5',
    CLAUDE_3_5_HAIKU = 'anthropic/claude-3.5-haiku',
    OPEN_AI_GPT_5_5 = 'openai/gpt-5.5',
    GEMINI_3_PRO_PREVIEW = 'google/gemini-3-pro-preview',
    CLAUDE_OPUS_4_7 = 'anthropic/claude-opus-4.7',
    KIMI_K2_6 = 'moonshotai/kimi-k2.6',
    GLM_5_1 = 'zai/glm-5.1',
    DEEPSEEK_V4_PRO = 'deepseek/deepseek-v4-pro',
    OPEN_AI_GPT_5 = 'openai/gpt-5',
    OPEN_AI_GPT_5_MINI = 'openai/gpt-5-mini',
    OPEN_AI_GPT_5_NANO = 'openai/gpt-5-nano',
}

interface ModelMapping {
    [LLMProvider.OPENROUTER]: OPENROUTER_MODELS;
}

export type InitialModelPayload = {
    [K in keyof ModelMapping]: {
        provider: K;
        model: ModelMapping[K];
    };
}[keyof ModelMapping];

export type ModelConfig = {
    model: LanguageModel;
    providerOptions?: Record<string, any>;
    headers?: Record<string, string>;
    maxOutputTokens: number;
};

export const MODEL_MAX_TOKENS = {
    [OPENROUTER_MODELS.CLAUDE_4_5_SONNET]: 200000,
    [OPENROUTER_MODELS.CLAUDE_3_5_HAIKU]: 200000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_5]: 400000,
    [OPENROUTER_MODELS.GEMINI_3_PRO_PREVIEW]: 1048576,
    [OPENROUTER_MODELS.CLAUDE_OPUS_4_7]: 200000,
    [OPENROUTER_MODELS.KIMI_K2_6]: 1000000,
    [OPENROUTER_MODELS.GLM_5_1]: 1000000,
    [OPENROUTER_MODELS.DEEPSEEK_V4_PRO]: 1000000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_NANO]: 400000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_MINI]: 400000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5]: 400000,
} as const;

export const CHAT_MODEL_OPTIONS = [
    {
        label: 'OpenAI GPT-5.5',
        model: OPENROUTER_MODELS.OPEN_AI_GPT_5_5,
    },
    {
        label: 'Gemini 3 Pro Preview',
        model: OPENROUTER_MODELS.GEMINI_3_PRO_PREVIEW,
    },
    {
        label: 'Claude Opus 4.7',
        model: OPENROUTER_MODELS.CLAUDE_OPUS_4_7,
    },
    {
        label: 'Kimi K2.6',
        model: OPENROUTER_MODELS.KIMI_K2_6,
    },
    {
        label: 'GLM-5.1',
        model: OPENROUTER_MODELS.GLM_5_1,
    },
    {
        label: 'DeepSeek V4 Pro',
        model: OPENROUTER_MODELS.DEEPSEEK_V4_PRO,
    },
] as const;

export type ChatModel = typeof CHAT_MODEL_OPTIONS[number]['model'];
