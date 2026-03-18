import { EmbeddingService } from '@/interfaces/global.interface';
import { openai } from '@ai-sdk/openai';
import { Embedding, EmbeddingModel, EmbedResult } from 'ai';

class OpenAIIntegration implements EmbeddingService {
    private static instance: OpenAIIntegration;
    private readonly embeddingModel: EmbeddingModel;

    constructor() {
        this.embeddingModel = openai.embedding('text-embedding-3-small');
    }

    public static getInstance = (): OpenAIIntegration => {
        if (!OpenAIIntegration.instance) {
            OpenAIIntegration.instance = new OpenAIIntegration();
        }
        return OpenAIIntegration.instance;
    };
    generateEmbedding(value: string): Promise<EmbedResult | null> {
        return Promise.resolve(null);
    }
    generateEmbeddings(value: string): Promise<Embedding[]> {
        return Promise.resolve([]);
    }

    private generateChunks(text: string) {
        return text
            .trim()
            .split('.')
            .map((i) => i.trim())
            .filter((i) => i !== '');
    }
}

export default OpenAIIntegration;
