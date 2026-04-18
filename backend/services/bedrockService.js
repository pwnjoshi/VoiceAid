/**
 * BedrockService — Amazon Bedrock text generation
 * Uses the Converse API (correct format for Nova/Claude models)
 * Falls back gracefully when credentials are missing
 */
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig } = require('../config/awsConfig');

let client = null;

function getClient() {
  if (!client) {
    if (!awsConfig.credentials.accessKeyId || awsConfig.credentials.accessKeyId === 'your_access_key') {
      return null;
    }
    client = new BedrockRuntimeClient(awsConfig);
  }
  return client;
}

// System prompt tuned for non-literate / elderly users
const SYSTEM_PROMPT = `You are VoiceAid, a helpful voice assistant for rural and non-literate communities worldwide.
Your answers must be:
- Short (2-4 sentences maximum)
- Simple language — no jargon
- Practical and actionable
- Spoken naturally (this will be read aloud)
- Focused on agriculture, health, safety, livelihoods, or climate topics
Never say "I cannot help" — always give the best practical advice you can.`;

class BedrockService {
  /**
   * Generate a response using Amazon Nova Lite via Converse API
   * @param {string} userQuery
   * @param {string[]} contextDocs — retrieved knowledge snippets
   * @returns {{ success: boolean, response: string, model: string }}
   */
  async generateResponse(userQuery, contextDocs = []) {
    const c = getClient();
    if (!c) throw new Error('Bedrock client not configured');

    // Build context block
    let contextBlock = '';
    if (contextDocs.length > 0) {
      contextBlock = 'Relevant information:\n' +
        contextDocs.map((d, i) => `${i + 1}. ${d.content || d}`).join('\n') +
        '\n\n';
    }

    const userMessage = `${contextBlock}Question: ${userQuery}`;

    const command = new ConverseCommand({
      modelId: 'amazon.nova-lite-v1:0',
      system: [{ text: SYSTEM_PROMPT }],
      messages: [
        { role: 'user', content: [{ text: userMessage }] },
      ],
      inferenceConfig: {
        maxTokens: 300,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    const response = await c.send(command);
    const text = response.output?.message?.content?.[0]?.text || '';

    return {
      success: true,
      response: text.trim(),
      model: 'amazon.nova-lite-v1:0',
      inputTokens:  response.usage?.inputTokens  || 0,
      outputTokens: response.usage?.outputTokens || 0,
    };
  }

  /**
   * Process a voice query with optional knowledge context
   */
  async processVoiceQuery(transcribedText, knowledgeContext = []) {
    const result = await this.generateResponse(transcribedText, knowledgeContext);
    return {
      success:             true,
      originalQuery:       transcribedText,
      aiResponse:          result.response,
      hasKnowledgeContext: knowledgeContext.length > 0,
      sourceCount:         knowledgeContext.length,
      model:               result.model,
      timestamp:           new Date().toISOString(),
    };
  }
}

module.exports = new BedrockService();
