// Application Metrics
// Tracks application performance and usage

class Metrics {
  constructor() {
    this.requests = {
      total: 0,
      successful: 0,
      failed: 0
    };
    this.knowledgeQueries = {
      total: 0,
      byCategory: {}
    };
    this.startTime = Date.now();
  }

  /**
   * Record API request
   */
  recordRequest(success = true) {
    this.requests.total++;
    if (success) {
      this.requests.successful++;
    } else {
      this.requests.failed++;
    }
  }

  /**
   * Record knowledge query
   */
  recordKnowledgeQuery(category = 'general') {
    this.knowledgeQueries.total++;
    if (!this.knowledgeQueries.byCategory[category]) {
      this.knowledgeQueries.byCategory[category] = 0;
    }
    this.knowledgeQueries.byCategory[category]++;
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.requests.total > 0 
      ? ((this.requests.successful / this.requests.total) * 100).toFixed(2)
      : 0;

    return {
      uptime: `${Math.floor(uptime / 1000)}s`,
      requests: this.requests,
      successRate: `${successRate}%`,
      knowledgeQueries: this.knowledgeQueries
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.requests = { total: 0, successful: 0, failed: 0 };
    this.knowledgeQueries = { total: 0, byCategory: {} };
    this.startTime = Date.now();
  }
}

module.exports = new Metrics();
