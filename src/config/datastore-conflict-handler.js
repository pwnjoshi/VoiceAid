/**
 * DataStore Conflict Resolution
 * Handles offline sync conflicts - always prefer server data for safety
 */

const conflictHandler = (data) => {
  const { modelConstructor, localModel, remoteModel } = data;
  
  // For critical data like reminders and settings, prefer server
  if (modelConstructor.name === 'Reminder' || modelConstructor.name === 'UserSettings') {
    return remoteModel;
  }
  
  // For conversations, keep the most recent
  if (modelConstructor.name === 'Conversation') {
    const localTime = new Date(localModel.timestamp).getTime();
    const remoteTime = new Date(remoteModel.timestamp).getTime();
    return localTime > remoteTime ? localModel : remoteModel;
  }
  
  // Default: prefer server data
  return remoteModel;
};

export default conflictHandler;
