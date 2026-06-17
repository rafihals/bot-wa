import { BaileysClass } from '../src/baileys';
import { FlowEngine } from '../src/flow-engine';
import { StateManager } from '../src/state-manager';

// Import server (handles http server for QR code)
import '../src/server';

const botBaileys = new BaileysClass({ debug: false });
const flowEngine = new FlowEngine();
const stateManager = new StateManager('./state');

// Event handlers
botBaileys.on('auth_failure', async (error) => {
  console.error('❌ Authentication error:', error);
});

botBaileys.on('qr', (qr) => {
  console.log('📱 QR Code generated. Scan to authenticate.');
  console.log('🌐 Open http://localhost:3000/qr in your browser');
});

botBaileys.on('ready', async () => {
  console.log('✅ Bot is ready and connected to WhatsApp');
  console.log(`📊 Active sessions: ${stateManager.getActiveSessionCount()}`);
  console.log('🔄 Listening for incoming messages...');
});

botBaileys.on('message', async (message) => {
  try {
    const userId = message.from;
    const userMessage = message.body?.toLowerCase().trim() || '';

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📨 INCOMING MESSAGE`);
    console.log(`   From: ${userId}`);
    console.log(`   Body: "${userMessage}"`);
    console.log(`   Type: ${message.type || 'text'}`);
    console.log(`${'='.repeat(50)}`);

    // Initialize or get existing session
    let session = stateManager.getSession(userId);
    if (!session) {
      console.log(`🆕 New user session created: ${userId}`);
      session = stateManager.createSession(userId);
      flowEngine.initializeUser(userId);
    }

    // Process message through flow engine
    const result = flowEngine.processMessage(userId, userMessage);

    if (result) {
      const { node, isNewConversation } = result;

      // Update session state
      const flowState = flowEngine.getUserState(userId);
      if (flowState) {
        stateManager.updateSession(userId, {
          currentNode: flowState.currentNode,
          history: flowState.history,
          context: flowState.context
        });
      }

      console.log(`📤 SENDING RESPONSE`);
      console.log(`   Node: ${node.id} (${node.type})`);

      // Send response based on node type
      if (node.type === 'poll' && node.options) {
        // Send poll for interactive menu
        console.log(`   Sending poll with ${node.options.length} options...`);
        const pollResult = await botBaileys.sendPoll(userId, node.message, {
          options: node.options,
          multiselect: false
        });
        console.log(`✅ Poll sent successfully`);
      } else {
        // Send text message
        console.log(`   Sending text message...`);
        const textResult = await botBaileys.sendText(userId, node.message);
        console.log(`✅ Text sent successfully`);

        // If node has next default, automatically proceed
        if (node.next?.default) {
          console.log(`⏳ Auto-proceeding to next node in 1.5s...`);
          setTimeout(async () => {
            try {
              const nextResult = flowEngine.processMessage(userId, 'continue');
              if (nextResult) {
                const nextNode = nextResult.node;
                console.log(`📤 Auto-sending next node: ${nextNode.id}`);
                
                if (nextNode.type === 'poll' && nextNode.options) {
                  await botBaileys.sendPoll(userId, nextNode.message, {
                    options: nextNode.options,
                    multiselect: false
                  });
                  console.log(`✅ Auto poll sent`);
                } else {
                  await botBaileys.sendText(userId, nextNode.message);
                  console.log(`✅ Auto text sent`);
                }

                // Update session again
                const updatedFlowState = flowEngine.getUserState(userId);
                if (updatedFlowState) {
                  stateManager.updateSession(userId, {
                    currentNode: updatedFlowState.currentNode,
                    history: updatedFlowState.history
                  });
                }
              }
            } catch (autoError: any) {
              console.error('❌ Error in auto-proceed:', autoError?.message);
            }
          }, 1500);
        }
      }
    } else {
      // If no valid flow result, send a helpful message
      console.log(`⚠️ No matching flow for input: "${userMessage}"`);
      await botBaileys.sendText(
        userId,
        'Maaf, saya tidak mengerti. Silakan pilih dari opsi yang tersedia.'
      );
      console.log(`✅ Fallback message sent`);
    }
  } catch (error: any) {
    console.error('❌ ERROR processing message:');
    console.error(`   ${error?.message || error}`);
    try {
      await botBaileys.sendText(
        message.from,
        'Maaf, terjadi kesalahan. Silakan coba lagi.'
      );
    } catch (sendError: any) {
      console.error('❌ Failed to send error message:', sendError?.message);
    }
  }
});

// Note: Poll responses are handled through the 'message' event with type='poll'
// The bot.ts 'message' handler already processes these correctly

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot gracefully...');
  stateManager.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  stateManager.shutdown();
  process.exit(0);
});

console.log('🚀 Bot starting...');
console.log('🔧 Mode: Docker deployment');
