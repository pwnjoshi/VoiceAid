// S3 Service - Manages document storage for Knowledge Base
// Handles uploads, retrieval, and document lifecycle management

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { awsConfig, s3Config } = require('../config/awsConfig');

const s3Client = new S3Client(awsConfig);

class S3Service {
  /**
   * Upload a document to S3 bucket
   * @param {Buffer} fileBuffer - File content
   * @param {string} fileName - Name of the file
   * @param {string} category - Category (agriculture, health, safety)
   */
  async uploadDocument(fileBuffer, fileName, category = 'general') {
    try {
      const folder = s3Config.folders[category] || s3Config.folders.general;
      const key = `${folder}${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: this.getContentType(fileName),
        Metadata: {
          category: category,
          uploadedAt: new Date().toISOString(),
          originalName: fileName
        },
        ServerSideEncryption: 'AES256'
      });

      await s3Client.send(command);
      
      return {
        success: true,
        key: key,
        bucket: s3Config.bucketName,
        category: category,
        message: 'Document uploaded successfully',
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * List all documents in a category
   */
  async listDocuments(category = null) {
    try {
      const prefix = category 
        ? s3Config.folders[category] || s3Config.folders.general
        : 'knowledge/';
      
      const command = new ListObjectsV2Command({
        Bucket: s3Config.bucketName,
        Prefix: prefix
      });

      const response = await s3Client.send(command);
      
      return {
        success: true,
        documents: response.Contents || [],
        count: response.KeyCount || 0,
        category: category || 'all'
      };
    } catch (error) {
      console.error('S3 List Error:', error);
      throw new Error(`Failed to list documents: ${error.message}`);
    }
  }

  /**
   * Get a presigned URL for document access
   */
  async getDocumentUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      
      return {
        success: true,
        url: url,
        expiresIn: expiresIn,
        key: key
      };
    } catch (error) {
      console.error('S3 URL Generation Error:', error);
      throw new Error(`Failed to generate document URL: ${error.message}`);
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key
      });

      const response = await s3Client.send(command);
      
      return {
        success: true,
        metadata: {
          key: key,
          size: response.ContentLength,
          contentType: response.ContentType,
          lastModified: response.LastModified,
          metadata: response.Metadata || {}
        }
      };
    } catch (error) {
      console.error('S3 Metadata Error:', error);
      throw new Error(`Failed to get document metadata: ${error.message}`);
    }
  }

  /**
   * Delete a document from S3
   */
  async deleteDocument(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key
      });

      await s3Client.send(command);
      
      return {
        success: true,
        message: 'Document deleted successfully',
        key: key
      };
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Get content type based on file extension
   */
  getContentType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
      pdf: 'application/pdf',
      txt: 'text/plain',
      md: 'text/markdown',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      json: 'application/json'
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Batch upload documents
   */
  async batchUploadDocuments(files, category = 'general') {
    try {
      const results = [];
      
      for (const file of files) {
        const result = await this.uploadDocument(
          file.buffer,
          file.originalname,
          category
        );
        results.push(result);
      }

      return {
        success: true,
        uploadedCount: results.length,
        results: results
      };
    } catch (error) {
      console.error('Batch Upload Error:', error);
      throw new Error(`Failed to batch upload documents: ${error.message}`);
    }
  }
}

module.exports = new S3Service();
