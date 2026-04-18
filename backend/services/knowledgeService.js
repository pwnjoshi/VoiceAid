/**
 * KnowledgeService — Amazon Bedrock Knowledge Base (RAG)
 * Gracefully handles missing AWS credentials.
 */
const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand, RetrieveCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const { awsConfig, bedrockConfig } = require('../config/awsConfig');

let client = null;

function getClient() {
  if (!client) {
    if (!awsConfig.credentials.accessKeyId || awsConfig.credentials.accessKeyId === 'your_access_key') {
      return null;
    }
    client = new BedrockAgentRuntimeClient(awsConfig);
  }
  return client;
}

class KnowledgeService {
  /**
   * Retrieve + Generate (RAG) — returns a grounded answer
   */
  async retrieveAndGenerate(query, category = null) {
    const c = getClient();
    if (!c) throw new Error('Bedrock agent client not configured');
    if (!bedrockConfig.knowledgeBaseId) throw new Error('KNOWLEDGE_BASE_ID not set');

    const enhancedQuery = category ? `[${category}] ${query}` : query;

    const command = new RetrieveAndGenerateCommand({
      input: { text: enhancedQuery },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId: bedrockConfig.knowledgeBaseId,
          modelArn:        bedrockConfig.modelArn,
          retrievalConfiguration: {
            vectorSearchConfiguration: { numberOfResults: 5 },
          },
        },
      },
    });

    const response = await c.send(command);
    return {
      success:   true,
      query,
      category,
      answer:    response.output?.text || '',
      citations: response.citations   || [],
      sessionId: response.sessionId,
    };
  }

  /**
   * Retrieve documents only (no generation)
   */
  async retrieveKnowledge(query, category = null, maxResults = 5) {
    const c = getClient();
    if (!c) throw new Error('Bedrock agent client not configured');
    if (!bedrockConfig.knowledgeBaseId) throw new Error('KNOWLEDGE_BASE_ID not set');

    const enhancedQuery = category ? `[${category}] ${query}` : query;

    const command = new RetrieveCommand({
      knowledgeBaseId: bedrockConfig.knowledgeBaseId,
      retrievalQuery:  { text: enhancedQuery },
      retrievalConfiguration: {
        vectorSearchConfiguration: { numberOfResults: maxResults },
      },
    });

    const response = await c.send(command);
    const documents = (response.retrievalResults || []).map(r => ({
      content:  r.content?.text || '',
      score:    r.score,
      location: r.location,
      category: this._extractCategory(r.location),
    }));

    return { success: true, query, category, documents, count: documents.length };
  }

  _extractCategory(location) {
    if (!location) return 'general';
    const s = JSON.stringify(location);
    if (s.includes('agriculture')) return 'agriculture';
    if (s.includes('health'))      return 'health';
    if (s.includes('safety'))      return 'safety';
    return 'general';
  }
}

module.exports = new KnowledgeService();
