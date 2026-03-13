// Knowledge Service - Retrieves information from Bedrock Knowledge Base
// Handles document retrieval, filtering, and knowledge base queries

const {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
  RetrieveAndGenerateCommand
} = require('@aws-sdk/client-bedrock-agent-runtime');
const { awsConfig, bedrockConfig } = require('../config/awsConfig');

const bedrockClient = new BedrockAgentRuntimeClient(awsConfig);

class KnowledgeService {
  /**
   * Query the Knowledge Base and retrieve relevant documents
   * @param {string} query - User's question or query
   * @param {string} category - Optional category filter (agriculture, health, safety)
   * @param {number} maxResults - Maximum number of results to return
   */
  async retrieveKnowledge(query, category = null, maxResults = 5) {
    try {
      // Add category context if provided
      const enhancedQuery = category 
        ? `[${category}] ${query}`
        : query;

      const command = new RetrieveCommand({
        knowledgeBaseId: bedrockConfig.knowledgeBaseId,
        retrievalQuery: {
          text: enhancedQuery
        },
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: maxResults
          }
        }
      });

      const response = await bedrockClient.send(command);
      
      // Format the retrieved documents
      const documents = response.retrievalResults.map(result => ({
        content: result.content.text,
        score: result.score,
        location: result.location,
        metadata: result.metadata,
        category: this.extractCategory(result.location)
      }));

      return {
        success: true,
        query: query,
        category: category,
        documents: documents,
        count: documents.length
      };
    } catch (error) {
      console.error('Knowledge Retrieval Error:', error);
      throw new Error(`Failed to retrieve knowledge: ${error.message}`);
    }
  }

  /**
   * Retrieve knowledge AND generate a response using RAG
   * This combines retrieval with AI generation for a complete answer
   */
  async retrieveAndGenerate(query, category = null) {
    try {
      const enhancedQuery = category 
        ? `[${category}] ${query}`
        : query;

      const command = new RetrieveAndGenerateCommand({
        input: {
          text: enhancedQuery
        },
        retrieveAndGenerateConfiguration: {
          type: 'KNOWLEDGE_BASE',
          knowledgeBaseConfiguration: {
            knowledgeBaseId: bedrockConfig.knowledgeBaseId,
            modelArn: bedrockConfig.modelArn
          }
        }
      });

      const response = await bedrockClient.send(command);
      
      return {
        success: true,
        query: query,
        category: category,
        answer: response.output.text,
        citations: response.citations || [],
        sessionId: response.sessionId
      };
    } catch (error) {
      console.error('RAG Generation Error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Query knowledge by category (agriculture, health, safety)
   */
  async queryByCategory(query, category) {
    try {
      if (!category) {
        throw new Error('Category is required');
      }

      return await this.retrieveAndGenerate(query, category);
    } catch (error) {
      console.error('Category Query Error:', error);
      throw new Error(`Failed to query ${category} knowledge: ${error.message}`);
    }
  }

  /**
   * Extract category from document location
   */
  extractCategory(location) {
    if (!location) return 'general';
    
    const locationStr = JSON.stringify(location);
    if (locationStr.includes('agriculture')) return 'agriculture';
    if (locationStr.includes('health')) return 'health';
    if (locationStr.includes('safety')) return 'safety';
    
    return 'general';
  }

  /**
   * Search across all categories
   */
  async searchAll(query, maxResults = 10) {
    try {
      const command = new RetrieveCommand({
        knowledgeBaseId: bedrockConfig.knowledgeBaseId,
        retrievalQuery: {
          text: query
        },
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: maxResults
          }
        }
      });

      const response = await bedrockClient.send(command);
      
      const documents = response.retrievalResults.map(result => ({
        content: result.content.text,
        score: result.score,
        location: result.location,
        metadata: result.metadata,
        category: this.extractCategory(result.location)
      }));

      return {
        success: true,
        query: query,
        documents: documents,
        count: documents.length,
        byCategory: this.groupByCategory(documents)
      };
    } catch (error) {
      console.error('Search All Error:', error);
      throw new Error(`Failed to search knowledge base: ${error.message}`);
    }
  }

  /**
   * Group documents by category
   */
  groupByCategory(documents) {
    const grouped = {
      agriculture: [],
      health: [],
      safety: [],
      general: []
    };

    documents.forEach(doc => {
      const category = doc.category || 'general';
      if (grouped[category]) {
        grouped[category].push(doc);
      }
    });

    return grouped;
  }
}

module.exports = new KnowledgeService();
