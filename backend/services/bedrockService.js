// Bedrock Service - Amazon Nova Sonic Integration
// Handles voice processing and AI response generation via Amazon Bedrock

const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig } = require('../config/awsConfig');

const bedrockClient = new BedrockRuntimeClient(awsConfig);

class BedrockService {
  /**
   * Invoke Amazon Nova Sonic model for text generation
   * @param {string} prompt - The input prompt/query
   * @param {object} options - Configuration options
   */
  async invokeNovaModel(prompt, options = {}) {
    try {
      const {
        maxTokens = 1024,
        temperature = 0.7,
        topP = 0.9
      } = options;

      // Prepare the request payload for Nova Sonic
      const payload = {
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: topP,
        stop_sequences: ['\n\nUser:', '\n\nAssistant:']
      };

      const command = new InvokeModelCommand({
        modelId: 'amazon.nova-lite-v1:0', // Nova Sonic model
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        success: true,
        response: responseBody.outputs[0].text,
        model: 'amazon.nova-lite-v1:0',
        usage: {
          inputTokens: responseBody.usage?.input_tokens || 0,
          outputTokens: responseBody.usage?.output_tokens || 0
        }
      };
    } catch (error) {
      console.error('Bedrock Model Invocation Error:', error);
      throw new Error(`Failed to invoke Bedrock model: ${error.message}`);
    }
  }

  /**
   * Generate response with context from knowledge base
   * @param {string} userQuery - User's question
   * @param {array} knowledgeContext - Retrieved knowledge documents
   */
  async generateContextualResponse(userQuery, knowledgeContext = []) {
    try {
      // Build context string from knowledge documents
      let contextString = '';
      if (knowledgeContext.length > 0) {
        contextString = 'Based on the following information:\n\n';
        knowledgeContext.forEach((doc, index) => {
          contextString += `[Source ${index + 1}]: ${doc.content}\n`;
        });
        contextString += '\n';
      }

      // Create the prompt with context
      const prompt = `${contextString}User Query: ${userQuery}\n\nProvide a helpful and accurate response:`;

      // Invoke the model
      const result = await this.invokeNovaModel(prompt, {
        maxTokens: 512,
        temperature: 0.5
      });

      return {
        success: true,
        response: result.response,
        hasContext: knowledgeContext.length > 0,
        sourceCount: knowledgeContext.length,
        model: result.model
      };
    } catch (error) {
      console.error('Contextual Response Generation Error:', error);
      throw error;
    }
  }

  /**
   * Process voice transcription and generate response
   * @param {string} transcribedText - Text from voice transcription
   * @param {array} knowledgeContext - Retrieved knowledge
   */
  async processVoiceQuery(transcribedText, knowledgeContext = []) {
    try {
      const response = await this.generateContextualResponse(
        transcribedText,
        knowledgeContext
      );

      return {
        success: true,
        originalQuery: transcribedText,
        aiResponse: response.response,
        hasKnowledgeContext: response.hasContext,
        sourceCount: response.sourceCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Voice Query Processing Error:', error);
      throw error;
    }
  }

  /**
   * Summarize knowledge documents
   * @param {array} documents - Array of documents to summarize
   */
  async summarizeDocuments(documents) {
    try {
      const documentText = documents
        .map((doc, i) => `Document ${i + 1}:\n${doc.content}`)
        .join('\n\n---\n\n');

      const prompt = `Summarize the following documents in 2-3 sentences:\n\n${documentText}`;

      const result = await this.invokeNovaModel(prompt, {
        maxTokens: 256,
        temperature: 0.3
      });

      return {
        success: true,
        summary: result.response,
        documentCount: documents.length
      };
    } catch (error) {
      console.error('Document Summarization Error:', error);
      throw error;
    }
  }
}

module.exports = new BedrockService();
