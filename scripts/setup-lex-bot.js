/**
 * Setup Amazon Lex V2 Bot
 * Creates the VoiceAid bot with intents and slots
 */
const { 
  LexModelsV2Client,
  CreateBotCommand,
  CreateBotLocaleCommand,
  CreateIntentCommand,
  CreateSlotTypeCommand,
  BuildBotLocaleCommand
} = require('@aws-sdk/client-lex-models-v2');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const client = new LexModelsV2Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function setupLexBot() {
  try {
    console.log('🤖 Setting up Amazon Lex V2 Bot...');
    
    // Load bot definition
    const botDef = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../backend/lex-bot-definition.json'), 'utf8')
    );
    
    // Step 1: Create Bot
    console.log('Creating bot...');
    const createBotResponse = await client.send(new CreateBotCommand({
      botName: botDef.name,
      description: botDef.description,
      roleArn: process.env.LEX_ROLE_ARN,
      dataPrivacy: {
        childDirected: false
      },
      idleSessionTTLInSeconds: 300
    }));
    
    const botId = createBotResponse.botId;
    console.log(`✅ Bot created: ${botId}`);
    
    // Step 2: Create Bot Locale
    console.log('Creating bot locale...');
    await client.send(new CreateBotLocaleCommand({
      botId: botId,
      botVersion: 'DRAFT',
      localeId: 'en_US',
      description: 'English (US) locale',
      nluIntentConfidenceThreshold: 0.4
    }));
    
    console.log('✅ Locale created');
    
    // Step 3: Create Intents
    for (const intent of botDef.intents) {
      console.log(`Creating intent: ${intent.name}...`);
      
      const intentCommand = new CreateIntentCommand({
        botId: botId,
        botVersion: 'DRAFT',
        localeId: 'en_US',
        intentName: intent.name,
        description: intent.description,
        sampleUtterances: intent.sampleUtterances.map(text => ({ utterance: text })),
        intentConfirmationSetting: {
          promptSpecification: {
            messageGroupsList: [{
              message: {
                plainTextMessage: {
                  value: 'Is that correct?'
                }
              }
            }],
            maxRetries: 2
          },
          declinationResponse: {
            messageGroupsList: [{
              message: {
                plainTextMessage: {
                  value: 'Okay, let me know if you need anything else.'
                }
              }
            }]
          }
        }
      });
      
      await client.send(intentCommand);
      console.log(`✅ Intent created: ${intent.name}`);
    }
    
    // Step 4: Build Bot
    console.log('Building bot...');
    await client.send(new BuildBotLocaleCommand({
      botId: botId,
      botVersion: 'DRAFT',
      localeId: 'en_US'
    }));
    
    console.log('✅ Bot build started');
    console.log('\n📝 Add this to your .env file:');
    console.log(`LEX_BOT_ID=${botId}`);
    console.log(`LEX_BOT_ALIAS_ID=TSTALIASID`);
    console.log(`LEX_LOCALE_ID=en_US`);
    
  } catch (error) {
    console.error('❌ Error setting up Lex bot:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupLexBot()
    .then(() => {
      console.log('\n✅ Lex bot setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupLexBot;
