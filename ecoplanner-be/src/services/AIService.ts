import { HfInference } from '@huggingface/inference';
import { config } from '../config';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AIResponse {
    content: string;
    model: string;
    sentiment?: number;
}

const SYSTEM_PROMPT = `Bạn là Eco-Assistant, trợ lý AI của EcoPlanner - cửa hàng sản phẩm văn phòng phẩm thân thiện môi trường.
Giọng điệu: Nhẹ nhàng, thân thiện.
Nhiệm vụ: Tư vấn sản phẩm, giải đáp thắc mắc, hỗ trợ đặt hàng.
Quy tắc: Trả lời tiếng Việt, sử dụng emoji phù hợp.`;

export class AIService {
    private hf: HfInference;
    private primaryModel: string;
    private fallbackModel: string;

    constructor() {
        this.hf = new HfInference(config.huggingface.apiKey);
        this.primaryModel = config.huggingface.primaryModel;
        this.fallbackModel = config.huggingface.fallbackModel;
    }

    async generateReply(conversationHistory: ChatMessage[], productContext?: string): Promise<AIResponse> {
        const messages: ChatMessage[] = [
            { role: 'system', content: SYSTEM_PROMPT + (productContext ? `\n\nSản phẩm:\n${productContext}` : '') },
            ...conversationHistory,
        ];

        try {
            const response = await this.callModel(this.primaryModel, messages);
            return { content: response, model: this.primaryModel, sentiment: this.analyzeSentiment(conversationHistory) };
        } catch (primaryError: any) {
            console.warn(`[AIService] Primary failed: ${primaryError.message}`);
            if (this.isRecoverableError(primaryError)) {
                try {
                    const response = await this.callModel(this.fallbackModel, messages);
                    return { content: response, model: this.fallbackModel, sentiment: this.analyzeSentiment(conversationHistory) };
                } catch (fallbackError) {
                    throw new Error('AI service temporarily unavailable');
                }
            }
            throw primaryError;
        }
    }

    private async callModel(model: string, messages: ChatMessage[]): Promise<string> {
        const response = await this.hf.chatCompletion({
            model,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            max_tokens: 500,
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || 'Xin lỗi, mình không thể trả lời lúc này.';
    }

    private isRecoverableError(error: any): boolean {
        return [403, 404, 503, 429].includes(error.status || error.statusCode);
    }

    private analyzeSentiment(messages: ChatMessage[]): number {
        const text = messages.filter(m => m.role === 'user').slice(-3).map(m => m.content.toLowerCase()).join(' ');
        const negative = ['tệ', 'chán', 'thất vọng', 'không hài lòng', 'lừa đảo'];
        const positive = ['tốt', 'tuyệt vời', 'cảm ơn', 'hài lòng', 'thích'];
        let score = 3;
        for (const kw of negative) if (text.includes(kw)) score = Math.max(1, score - 1);
        for (const kw of positive) if (text.includes(kw)) score = Math.min(5, score + 1);
        return score;
    }

    async generateProductDescription(productName: string, tags: string[]): Promise<string> {
        const prompt = `Viết mô tả ngắn (2-3 câu) cho "${productName}" với đặc điểm: ${tags.join(', ')}. Nhấn mạnh tính thân thiện môi trường.`;
        return this.callModel(this.fallbackModel, [{ role: 'user', content: prompt }]);
    }

    async summarizeConversation(messages: ChatMessage[]): Promise<{ summary: string; tags: string[] }> {
        return { summary: 'Khách hàng cần hỗ trợ', tags: ['general'] };
    }
}

export const aiService = new AIService();
