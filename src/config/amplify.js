/**
 * AWS Amplify Configuration
 * Enables offline-first data sync with DataStore
 */

export const amplifyConfig = {
  Auth: {
    region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
    userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID,
    identityPoolId: process.env.EXPO_PUBLIC_IDENTITY_POOL_ID,
  },
  API: {
    GraphQL: {
      endpoint: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT,
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.EXPO_PUBLIC_API_KEY,
    },
  },
  Storage: {
    S3: {
      bucket: process.env.EXPO_PUBLIC_S3_BUCKET || 'voiceaid-knowledge-docs',
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
    },
  },
  DataStore: {
    conflictHandler: require('./datastore-conflict-handler').default,
    errorHandler: (error) => {
      console.warn('DataStore error:', error);
    },
    maxRecordsToSync: 10000,
    syncPageSize: 1000,
    fullSyncInterval: 24 * 60, // 24 hours in minutes
  },
};

export default amplifyConfig;
