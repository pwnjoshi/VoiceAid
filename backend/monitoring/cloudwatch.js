// CloudWatch Monitoring Integration
// Sends metrics and logs to AWS CloudWatch

const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
const { awsConfig } = require('../config/awsConfig');

const cloudwatchClient = new CloudWatchClient(awsConfig);

class CloudWatchMonitoring {
  /**
   * Send custom metric to CloudWatch
   */
  static async putMetric(metricName, value, unit = 'Count') {
    try {
      const command = new PutMetricDataCommand({
        Namespace: 'VoiceAid/Backend',
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date()
          }
        ]
      });

      await cloudwatchClient.send(command);
    } catch (error) {
      console.error('CloudWatch Metric Error:', error);
    }
  }

  /**
   * Track API request metrics
   */
  static async trackRequest(endpoint, statusCode, duration) {
    try {
      await this.putMetric(`${endpoint}-requests`, 1, 'Count');
      await this.putMetric(`${endpoint}-duration`, duration, 'Milliseconds');
      
      if (statusCode >= 400) {
        await this.putMetric(`${endpoint}-errors`, 1, 'Count');
      }
    } catch (error) {
      console.error('Request Tracking Error:', error);
    }
  }

  /**
   * Track knowledge base queries
   */
  static async trackKnowledgeQuery(category, success) {
    try {
      const metric = success ? 'knowledge-queries-success' : 'knowledge-queries-failed';
      await this.putMetric(metric, 1, 'Count');
      
      if (category) {
        await this.putMetric(`knowledge-queries-${category}`, 1, 'Count');
      }
    } catch (error) {
      console.error('Knowledge Query Tracking Error:', error);
    }
  }
}

module.exports = CloudWatchMonitoring;
