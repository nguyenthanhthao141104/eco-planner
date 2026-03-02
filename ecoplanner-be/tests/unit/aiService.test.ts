/**
 * Unit Tests for AIService
 * 
 * Testing with REAL HuggingFace API calls
 */
import { AIService } from '../../src/services/AIService';

// Increase timeout for real API calls
jest.setTimeout(60000);

describe('AIService', () => {
    let aiService: AIService;

    beforeAll(() => {
        aiService = new AIService();
    });

    describe('generateReply', () => {
        it('should return AI response from model', async () => {
            const response = await aiService.generateReply([
                { role: 'user', content: 'Xin chào, bạn có thể giới thiệu về EcoPlanner không?' },
            ]);

            expect(response.content).toBeDefined();
            expect(response.content.length).toBeGreaterThan(0);
            expect(response.model).toBeDefined();
            expect(response.sentiment).toBeDefined();
            console.log('AI Response:', response.content);
        });

        it('should include sentiment score', async () => {
            const response = await aiService.generateReply([
                { role: 'user', content: 'Cảm ơn bạn rất nhiều!' },
            ]);

            expect(response.sentiment).toBeGreaterThanOrEqual(1);
            expect(response.sentiment).toBeLessThanOrEqual(5);
            console.log('Sentiment:', response.sentiment);
        });
    });

    describe('analyzeSentiment', () => {
        it('should return low sentiment for negative messages', async () => {
            const response = await aiService.generateReply([
                { role: 'user', content: 'Tôi rất thất vọng và không hài lòng với dịch vụ!' },
            ]);

            expect(response.sentiment).toBeLessThanOrEqual(2);
        });

        it('should return high sentiment for positive messages', async () => {
            const response = await aiService.generateReply([
                { role: 'user', content: 'Sản phẩm tuyệt vời, tôi rất hài lòng!' },
            ]);

            expect(response.sentiment).toBeGreaterThanOrEqual(4);
        });
    });

    describe('generateProductDescription', () => {
        it('should generate product description', async () => {
            const description = await aiService.generateProductDescription(
                'Sổ Tay Tre Eco',
                ['eco-friendly', 'recycled', 'minimalist']
            );

            expect(description).toBeDefined();
            expect(description.length).toBeGreaterThan(10);
            console.log('Product Description:', description);
        });
    });
});
