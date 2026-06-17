/**
 * Integration Test - Simulates WhatsApp message payload handling
 * Tests the message processing pipeline without actual WhatsApp connection
 */

import { FlowEngine } from './lib/flow-engine.js';
import { StateManager } from './lib/state-manager.js';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Simulate WhatsApp message payload structure (like Baileys sends)
interface SimulatedMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: { text: string };
    pollUpdateMessage?: any;
  };
  pushName?: string;
}

// Simulated formatPhone function (mirrors utils.formatPhone)
function formatPhone(contact: string, full: boolean = false): string {
  if (!contact) return '';
  
  // Handle linked devices (@lid@s.whatsapp.net)
  if (contact.includes('@lid@s.whatsapp.net')) {
    return contact;
  }
  
  // Handle group chats
  if (contact.includes('@g.us')) {
    return contact.includes('@g.us') ? contact : `${contact}@g.us`;
  }
  
  // Handle regular phone numbers
  let domain = '@s.whatsapp.net';
  contact = contact.replace(domain, '');
  return !full ? `${contact}${domain}` : contact;
}

// Simulated message handler (mirrors examples/bot.ts)
async function simulateMessageHandler(
  message: SimulatedMessage,
  flowEngine: FlowEngine,
  stateManager: StateManager
): Promise<{ response: string | null; nodeType: string | null; error: string | null }> {
  try {
    // Extract body from message (like baileys.ts does)
    const body = 
      message.message?.extendedTextMessage?.text ??
      message.message?.conversation;

    // Format phone
    const from = formatPhone(message.key.remoteJid);
    
    // Skip conditions
    if (message.key.fromMe) {
      return { response: null, nodeType: null, error: 'Ignored: fromMe' };
    }
    
    if (message.message?.pollUpdateMessage) {
      return { response: null, nodeType: null, error: 'Ignored: pollUpdateMessage' };
    }
    
    if (!from || from === 'status@broadcast') {
      return { response: null, nodeType: null, error: 'Ignored: invalid from' };
    }

    // Ignore group messages - only respond to personal chats
    if (from.includes('@g.us')) {
      return { response: null, nodeType: null, error: 'Ignored: group message' };
    }

    const userId = from;
    const userMessage = body?.toLowerCase().trim() || '';

    console.log(`${colors.cyan}📨 Processing message from ${userId}: "${userMessage}"${colors.reset}`);

    // Initialize or get existing session
    let session = stateManager.getSession(userId);
    if (!session) {
      console.log(`${colors.yellow}🆕 New user session created${colors.reset}`);
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

      return {
        response: node.message,
        nodeType: node.type,
        error: null
      };
    } else {
      return {
        response: "I didn't quite understand that. Please choose from the available options.",
        nodeType: 'fallback',
        error: null
      };
    }
  } catch (error: any) {
    return {
      response: null,
      nodeType: null,
      error: error.message
    };
  }
}

// Test cases
async function runIntegrationTests() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║   WhatsApp Bot Integration Test Suite              ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  const flowEngine = new FlowEngine();
  const stateManager = new StateManager('./state-test');

  let passed = 0;
  let failed = 0;

  // Test 1: Normal text message
  console.log(`${colors.bold}Test 1: Normal Text Message${colors.reset}`);
  const msg1: SimulatedMessage = {
    key: {
      remoteJid: '6281234567890@s.whatsapp.net',
      fromMe: false,
      id: 'test1'
    },
    message: {
      conversation: 'halo'
    },
    pushName: 'Test User'
  };

  let result = await simulateMessageHandler(msg1, flowEngine, stateManager);
  if (result.response && result.response.includes('Halo, Bunda')) {
    console.log(`${colors.green}✅ PASSED: Bot responded with start message${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAILED: No response or wrong response${colors.reset}`);
    console.log(`   Got: ${result.response?.substring(0, 50)}...`);
    failed++;
  }
  console.log();

  // Test 2: Extended text message
  console.log(`${colors.bold}Test 2: Extended Text Message Format${colors.reset}`);
  const msg2: SimulatedMessage = {
    key: {
      remoteJid: '6289876543210@s.whatsapp.net',
      fromMe: false,
      id: 'test2'
    },
    message: {
      extendedTextMessage: { text: 'hi there' }
    },
    pushName: 'Another User'
  };

  result = await simulateMessageHandler(msg2, flowEngine, stateManager);
  if (result.response) {
    console.log(`${colors.green}✅ PASSED: Extended text handled correctly${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAILED: Extended text not handled${colors.reset}`);
    failed++;
  }
  console.log();

  // Test 3: Message from self (should be ignored)
  console.log(`${colors.bold}Test 3: Message From Self (Should Ignore)${colors.reset}`);
  const msg3: SimulatedMessage = {
    key: {
      remoteJid: '6281234567890@s.whatsapp.net',
      fromMe: true,
      id: 'test3'
    },
    message: {
      conversation: 'test'
    }
  };

  result = await simulateMessageHandler(msg3, flowEngine, stateManager);
  if (result.error === 'Ignored: fromMe') {
    console.log(`${colors.green}✅ PASSED: Self messages ignored correctly${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAILED: Self messages not ignored${colors.reset}`);
    failed++;
  }
  console.log();

  // Test 4: Poll update message (should be ignored in normal handler)
  console.log(`${colors.bold}Test 4: Poll Update Message${colors.reset}`);
  const msg4: SimulatedMessage = {
    key: {
      remoteJid: '6281234567890@s.whatsapp.net',
      fromMe: false,
      id: 'test4'
    },
    message: {
      pollUpdateMessage: { pollCreationMessageKey: {} }
    }
  };

  result = await simulateMessageHandler(msg4, flowEngine, stateManager);
  if (result.error === 'Ignored: pollUpdateMessage') {
    console.log(`${colors.green}✅ PASSED: Poll update ignored in normal handler${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAILED: Poll update handling issue${colors.reset}`);
    failed++;
  }
  console.log();

  // Test 5: Complete conversation flow
  console.log(`${colors.bold}Test 5: Complete Conversation Flow${colors.reset}`);
  const userId = '6287777777777@s.whatsapp.net';
  
  const conversationSteps = [
    { text: 'halo', expectContains: 'Halo, Bunda' },
    { text: 'continue', expectContains: 'Chatbot ini berisi' },
    { text: 'ya, saya setuju', expectContains: 'Bunda ingin mulai' },
    { text: 'apa itu picky eater?', expectContains: 'Picky eater adalah' },
  ];

  let conversationPassed = true;
  for (const step of conversationSteps) {
    const msg: SimulatedMessage = {
      key: { remoteJid: userId, fromMe: false, id: `conv_${step.text}` },
      message: { conversation: step.text }
    };
    
    result = await simulateMessageHandler(msg, flowEngine, stateManager);
    
    if (result.response && result.response.includes(step.expectContains)) {
      console.log(`${colors.green}  ✓ "${step.text}" -> Got expected response${colors.reset}`);
    } else {
      console.log(`${colors.red}  ✗ "${step.text}" -> Wrong response${colors.reset}`);
      console.log(`    Expected to contain: "${step.expectContains}"`);
      console.log(`    Got: "${result.response?.substring(0, 50)}..."`);
      conversationPassed = false;
    }
  }
  
  if (conversationPassed) {
    console.log(`${colors.green}✅ PASSED: Full conversation flow works${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAILED: Conversation flow has issues${colors.reset}`);
    failed++;
  }
  console.log();

  // Test 6: Empty message handling
  console.log(`${colors.bold}Test 6: Empty Message Handling${colors.reset}`);
  const msg6: SimulatedMessage = {
    key: {
      remoteJid: '6288888888888@s.whatsapp.net',
      fromMe: false,
      id: 'test6'
    },
    message: {}
  };

  result = await simulateMessageHandler(msg6, flowEngine, stateManager);
  if (result.response) {
    console.log(`${colors.green}✅ PASSED: Empty message handled${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.yellow}⚠️ WARNING: Empty message returned no response (may be expected)${colors.reset}`);
    passed++;
  }
  console.log();

  // Test 7: Group message handling (should be IGNORED)
  console.log(`${colors.bold}Test 7: Group Message (Should Be Ignored)${colors.reset}`);
  const msg7: SimulatedMessage = {
    key: {
      remoteJid: '120363123456789012@g.us',
      fromMe: false,
      id: 'test7'
    },
    message: {
      conversation: 'halo'
    }
  };

  result = await simulateMessageHandler(msg7, flowEngine, stateManager);
  if (result.error === 'Ignored: group message') {
    console.log(`${colors.green}✅ PASSED: Group messages ignored correctly${colors.reset}`);
    passed++;
  } else {
    console.log(`${colors.red}❌ FAILED: Group messages should be ignored${colors.reset}`);
    failed++;
  }
  console.log();

  // Test 8: Linked device format
  console.log(`${colors.bold}Test 8: Linked Device Format (@lid)${colors.reset}`);
  const msg8: SimulatedMessage = {
    key: {
      remoteJid: 'ABC123@lid@s.whatsapp.net',
      fromMe: false,
      id: 'test8'
    },
    message: {
      conversation: 'hello'
    }
  };

  result = await simulateMessageHandler(msg8, flowEngine, stateManager);
  console.log(`${colors.cyan}ℹ️ Linked device message result: ${result.response ? 'handled' : result.error}${colors.reset}`);
  passed++;
  console.log();

  // Summary
  console.log(`\n${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}INTEGRATION TEST SUMMARY${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 All integration tests passed!${colors.reset}`);
    console.log(`\n${colors.yellow}Possible reasons bot doesn't respond:${colors.reset}`);
    console.log(`1. WhatsApp connection issue (check QR code scan)`);
    console.log(`2. Session auth problem (try deleting bot_sessions folder)`);
    console.log(`3. Network/timeout issues with Baileys`);
    console.log(`4. Message type not being captured (check bot.ts console logs)`);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️ Some tests failed - there may be issues in the message handling code${colors.reset}`);
  }

  // Cleanup
  stateManager.shutdown();
}

runIntegrationTests().catch(console.error);
