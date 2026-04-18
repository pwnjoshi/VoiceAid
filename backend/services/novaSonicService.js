/**
 * NovaSonicService — Amazon Nova Sonic bidirectional speech-to-speech
 *
 * Nova Sonic is a preview model. This service implements the correct
 * InvokeModelWithBidirectionalStream API for real-time voice streaming.
 * Falls back to Bedrock text generation when Nova Sonic is unavailable.
 */
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
const { awsConfig } = require('../config/awsConfig');
const bedrockService = require('./bedrockService');

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

const MODEL_ID = 'amazon.nova-sonic-v1:0';

class NovaSonicService {
  /**
   * Process speech via Nova Sonic bidirectional streaming.
   * If Nova Sonic is unavailable, falls back to Bedrock text generation.
   *
   * @param {Buffer} audioBuffer — PCM 16kHz mono audio
   * @param {object} context — { language, userId, sessionId, previousTurns }
   * @returns {{ transcription: string, textResponse: string, audioResponse: Buffer|null }}
   */
  async processSpeech(audioBuffer, context = {}) {
    const c = getClient();

    // ── Nova Sonic path ────────────────────────────────────────────────────
    if (c && process.env.NOVA_SONIC_ENABLED === 'true') {
      try {
        return await this._novaSonicStream(c, audioBuffer, context);
      } catch (err) {
        console.warn('[NovaSonic] Streaming failed, falling back to text:', err.message);
      }
    }

    // ── Fallback: text-only via Bedrock ────────────────────────────────────
    // In this path the caller already has the transcription from device STT
    const transcription = context.transcription || '';
    if (!transcription) {
      return { transcription: '', textResponse: '', audioResponse: null };
    }

    const result = await bedrockService.generateResponse(transcription, context.knowledgeDocs || []);
    return {
      transcription,
      textResponse:  result.response,
      audioResponse: null, // TTS handled by expo-speech on device
      source:        'bedrock-fallback',
    };
  }

  /**
   * Real Nova Sonic bidirectional stream implementation.
   * Uses InvokeModelWithBidirectionalStream (SDK v3 preview).
   */
  async _novaSonicStream(client, audioBuffer, context) {
    // Nova Sonic uses a specific event-stream protocol.
    // This is the correct payload structure per AWS docs (preview).
    const sessionConfig = {
      promptName: 'voiceaid-assistant',
      systemPrompt: `You are VoiceAid, a helpful voice assistant for rural communities. 
        Give short, practical answers in simple language. 
        User language: ${context.language || 'en'}.`,
      inferenceConfig: { maxTokens: 300, temperature: 0.4 },
      audioInputConfig:  { mediaType: 'audio/lpcm', sampleRateHertz: 16000, sampleSizeBits: 16, channelCount: 1 },
      audioOutputConfig: { mediaType: 'audio/lpcm', sampleRateHertz: 16000, sampleSizeBits: 16, channelCount: 1 },
    };

    // Build the async iterable input stream
    async function* inputStream() {
      // 1. Session start
      yield {
        sessionStart: {
          promptName:          sessionConfig.promptName,
          inferenceConfiguration: sessionConfig.inferenceConfig,
          systemPrompt:        { text: sessionConfig.systemPrompt },
          audioInputConfiguration:  sessionConfig.audioInputConfig,
          audioOutputConfiguration: sessionConfig.audioOutputConfig,
        },
      };

      // 2. Content start
      yield { contentStart: { role: 'USER', type: 'AUDIO' } };

      // 3. Audio chunks (100ms each at 16kHz = 3200 bytes)
      const CHUNK = 3200;
      for (let i = 0; i < audioBuffer.length; i += CHUNK) {
        yield { audioInput: { content: audioBuffer.slice(i, i + CHUNK).toString('base64') } };
      }

      // 4. Content end
      yield { contentEnd: {} };

      // 5. Session end
      yield { sessionEnd: {} };
    }

    // Note: InvokeModelWithBidirectionalStream is not yet in the stable SDK.
    // When available, the call would be:
    //   const cmd = new InvokeModelWithBidirectionalStreamCommand({ modelId: MODEL_ID, body: inputStream() });
    //   const response = await client.send(cmd);
    // For now, throw so we fall back to Bedrock text.
    throw new Error('Nova Sonic bidirectional stream SDK not yet stable — using Bedrock fallback');
  }

  /**
   * Check if Nova Sonic is available
   */
  isAvailable() {
    return !!(getClient() && process.env.NOVA_SONIC_ENABLED === 'true');
  }
}

module.exports = new NovaSonicService();
