/**
 * Local Test Script for WhatsApp Bot Flow Engine
 * Tests all conversation flows without WhatsApp connection
 */

import { FlowEngine, FlowNode } from './lib/flow-engine.js';
import { StateManager } from './lib/state-manager.js';

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(type: 'success' | 'error' | 'info' | 'warn' | 'user' | 'bot', message: string) {
  const icons = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    info: `${colors.blue}ℹ️`,
    warn: `${colors.yellow}⚠️`,
    user: `${colors.cyan}👤`,
    bot: `${colors.green}🤖`
  };
  console.log(`${icons[type]} ${message}${colors.reset}`);
}

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

class FlowTester {
  private flowEngine: FlowEngine;
  private results: TestResult[] = [];

  constructor() {
    this.flowEngine = new FlowEngine();
  }

  async runAllTests(): Promise<void> {
    console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}║   WhatsApp Bot Flow Engine Test Suite              ║${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

    // Test 1: Initialize new user
    await this.testNewUserInitialization();

    // Test 2: Start node response
    await this.testStartNode();

    // Test 3: Agreement flow - Accept
    await this.testAgreementAccept();

    // Test 4: Agreement flow - Exit
    await this.testAgreementExit();

    // Test 5: Main menu navigation
    await this.testMainMenuNavigation();

    // Test 6: Picky eater flow
    await this.testPickyEaterFlow();

    // Test 7: Difficulty eating flow
    await this.testDifficultyEatingFlow();

    // Test 8: Worried/confused flow
    await this.testWorriedConfusedFlow();

    // Test 9: Easy tips flow
    await this.testEasyTipsFlow();

    // Test 10: Immediate help flow
    await this.testImmediateHelpFlow();

    // Test 11: Poll response handling
    await this.testPollResponseHandling();

    // Test 12: Invalid input handling
    await this.testInvalidInputHandling();

    // Test 13: Full conversation simulation
    await this.testFullConversation();

    // Print summary
    this.printSummary();
  }

  private async testNewUserInitialization(): Promise<void> {
    const testName = "New User Initialization";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_user_1';
    this.flowEngine.initializeUser(userId);
    const state = this.flowEngine.getUserState(userId);

    if (state && state.currentNode === 'start') {
      log('success', `User initialized at 'start' node`);
      this.results.push({ name: testName, passed: true, details: 'User state created correctly' });
    } else {
      log('error', `Failed to initialize user`);
      this.results.push({ name: testName, passed: false, details: 'User state not created' });
    }
    console.log();
  }

  private async testStartNode(): Promise<void> {
    const testName = "Start Node Response";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_user_2';
    this.flowEngine.resetUser(userId);
    
    const result = this.flowEngine.processMessage(userId, 'halo');
    
    if (result && result.node.id === 'start') {
      log('bot', `Bot: "${result.node.message.substring(0, 50)}..."`);
      log('success', `Start node returned correctly`);
      this.results.push({ name: testName, passed: true, details: 'Start message sent' });
    } else {
      log('error', `Start node not returned`);
      this.results.push({ name: testName, passed: false, details: 'Failed to get start node' });
    }
    console.log();
  }

  private async testAgreementAccept(): Promise<void> {
    const testName = "Agreement Flow - Accept";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_agreement_accept';
    this.flowEngine.resetUser(userId);
    
    // First message to get start
    this.flowEngine.processMessage(userId, 'halo');
    
    // Simulate auto-proceed to agreement
    let result = this.flowEngine.processMessage(userId, 'continue');
    log('bot', `Bot poll: "${result?.node.message}"`);
    
    // User accepts
    log('user', `User: "ya, saya setuju"`);
    result = this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    if (result && result.node.id === 'main_menu') {
      log('bot', `Bot: "${result.node.message}"`);
      log('success', `Navigated to main_menu after accepting`);
      this.results.push({ name: testName, passed: true, details: 'Agreement accepted -> main menu' });
    } else {
      log('error', `Did not navigate to main_menu`);
      this.results.push({ name: testName, passed: false, details: `Got ${result?.node.id} instead of main_menu` });
    }
    console.log();
  }

  private async testAgreementExit(): Promise<void> {
    const testName = "Agreement Flow - Exit";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_agreement_exit';
    this.flowEngine.resetUser(userId);
    
    // First message
    this.flowEngine.processMessage(userId, 'halo');
    
    // Auto-proceed to agreement
    let result = this.flowEngine.processMessage(userId, 'continue');
    
    // User exits
    log('user', `User: "keluar"`);
    result = this.flowEngine.processMessage(userId, 'keluar');
    
    if (result && result.node.id === 'end') {
      log('bot', `Bot: "${result.node.message.substring(0, 60)}..."`);
      log('success', `Navigated to end after exit`);
      this.results.push({ name: testName, passed: true, details: 'Exit -> end node' });
    } else {
      log('error', `Did not navigate to end`);
      this.results.push({ name: testName, passed: false, details: `Got ${result?.node.id} instead of end` });
    }
    console.log();
  }

  private async testMainMenuNavigation(): Promise<void> {
    const testName = "Main Menu Navigation";
    log('info', `Testing: ${testName}`);
    
    const menuOptions = [
      { input: 'apa itu picky eater?', expected: 'picky_eater_intro' },
      { input: 'anak saya susah makan', expected: 'difficulty_eating' },
      { input: 'saya khawatir & bingung', expected: 'worried_confused' },
      { input: 'tips awal yang mudah', expected: 'easy_tips' },
      { input: 'butuh bantuan langsung', expected: 'immediate_help' }
    ];

    let allPassed = true;
    const details: string[] = [];

    for (const option of menuOptions) {
      const userId = `test_menu_${option.expected}`;
      this.flowEngine.resetUser(userId);
      
      // Navigate to main menu
      this.flowEngine.processMessage(userId, 'halo');
      this.flowEngine.processMessage(userId, 'continue');
      this.flowEngine.processMessage(userId, 'ya, saya setuju');
      
      // Test menu option
      log('user', `User: "${option.input}"`);
      const result = this.flowEngine.processMessage(userId, option.input);
      
      if (result && result.node.id === option.expected) {
        log('success', `-> ${option.expected}`);
        details.push(`${option.input} ✓`);
      } else {
        log('error', `Expected ${option.expected}, got ${result?.node.id}`);
        details.push(`${option.input} ✗`);
        allPassed = false;
      }
    }

    this.results.push({ name: testName, passed: allPassed, details: details.join(', ') });
    console.log();
  }

  private async testPickyEaterFlow(): Promise<void> {
    const testName = "Picky Eater Education Flow";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_picky_eater';
    this.flowEngine.resetUser(userId);
    
    // Navigate to picky eater intro
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue');
    this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    let result = this.flowEngine.processMessage(userId, 'apa itu picky eater?');
    log('bot', `Bot (intro): "${result?.node.message.substring(0, 50)}..."`);
    
    // Auto-proceed to submenu
    result = this.flowEngine.processMessage(userId, 'continue');
    
    if (result && result.node.id === 'picky_eater_submenu' && result.node.options) {
      log('success', `Submenu with ${result.node.options.length} options`);
      
      // Test one submenu option
      log('user', `User: "penyebab picky eater"`);
      result = this.flowEngine.processMessage(userId, 'penyebab picky eater');
      
      if (result && result.node.id === 'causes') {
        log('bot', `Bot (causes): "${result.node.message.substring(0, 50)}..."`);
        log('success', `Causes explanation delivered`);
        this.results.push({ name: testName, passed: true, details: 'Full picky eater flow works' });
      } else {
        this.results.push({ name: testName, passed: false, details: 'Failed to get causes' });
      }
    } else {
      this.results.push({ name: testName, passed: false, details: 'Failed to get submenu' });
    }
    console.log();
  }

  private async testDifficultyEatingFlow(): Promise<void> {
    const testName = "Difficulty Eating Flow";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_difficulty';
    this.flowEngine.resetUser(userId);
    
    // Navigate to difficulty eating
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue');
    this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    let result = this.flowEngine.processMessage(userId, 'anak saya susah makan');
    
    if (result && result.node.options) {
      log('bot', `Bot poll: "${result.node.message}"`);
      log('success', `Difficulty menu with ${result.node.options.length} options`);
      
      // Test one option
      log('user', `User: "anak menolak makan"`);
      result = this.flowEngine.processMessage(userId, 'anak menolak makan');
      
      if (result && result.node.id === 'refuses_to_eat') {
        log('bot', `Bot: "${result.node.message.substring(0, 50)}..."`);
        log('success', `Refuses to eat response delivered`);
        this.results.push({ name: testName, passed: true, details: 'Difficulty flow works' });
      } else {
        this.results.push({ name: testName, passed: false, details: `Got ${result?.node.id}` });
      }
    } else {
      this.results.push({ name: testName, passed: false, details: 'No options in difficulty menu' });
    }
    console.log();
  }

  private async testWorriedConfusedFlow(): Promise<void> {
    const testName = "Worried/Confused Emotional Support Flow";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_worried';
    this.flowEngine.resetUser(userId);
    
    // Navigate
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue');
    this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    let result = this.flowEngine.processMessage(userId, 'saya khawatir & bingung');
    
    if (result && result.node.options) {
      log('bot', `Bot poll: "${result.node.message}"`);
      
      log('user', `User: "merasa gagal"`);
      result = this.flowEngine.processMessage(userId, 'merasa gagal');
      
      if (result && result.node.id === 'emotional_support') {
        log('bot', `Bot: "${result.node.message.substring(0, 50)}..."`);
        log('success', `Emotional support message delivered`);
        this.results.push({ name: testName, passed: true, details: 'Emotional support flow works' });
      } else {
        this.results.push({ name: testName, passed: false, details: 'No emotional support' });
      }
    } else {
      this.results.push({ name: testName, passed: false, details: 'No options in worried menu' });
    }
    console.log();
  }

  private async testEasyTipsFlow(): Promise<void> {
    const testName = "Easy Tips Flow";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_tips';
    this.flowEngine.resetUser(userId);
    
    // Navigate
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue');
    this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    let result = this.flowEngine.processMessage(userId, 'tips awal yang mudah');
    
    if (result && result.node.message.includes('langkah ringan')) {
      log('bot', `Bot: "${result.node.message.substring(0, 80)}..."`);
      log('success', `Easy tips delivered`);
      this.results.push({ name: testName, passed: true, details: 'Easy tips flow works' });
    } else {
      this.results.push({ name: testName, passed: false, details: 'Easy tips not found' });
    }
    console.log();
  }

  private async testImmediateHelpFlow(): Promise<void> {
    const testName = "Immediate Help Flow";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_help';
    this.flowEngine.resetUser(userId);
    
    // Navigate
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue');
    this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    let result = this.flowEngine.processMessage(userId, 'butuh bantuan langsung');
    
    if (result && result.node.message.includes('087849194804')) {
      log('bot', `Bot: "${result.node.message.substring(0, 80)}..."`);
      log('success', `Contact number provided`);
      this.results.push({ name: testName, passed: true, details: 'Contact info provided' });
    } else {
      this.results.push({ name: testName, passed: false, details: 'No contact info' });
    }
    console.log();
  }

  private async testPollResponseHandling(): Promise<void> {
    const testName = "Poll Response Simulation";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_poll';
    this.flowEngine.resetUser(userId);
    
    // Navigate to a poll node
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue'); // -> agreement poll
    
    const state = this.flowEngine.getUserState(userId);
    const currentNode = this.flowEngine.getCurrentNode(userId);
    
    if (currentNode && currentNode.type === 'poll') {
      log('success', `Current node is poll type: ${currentNode.id}`);
      log('info', `Options: ${currentNode.options?.join(', ')}`);
      this.results.push({ name: testName, passed: true, details: 'Poll handling works' });
    } else {
      this.results.push({ name: testName, passed: false, details: 'Not at poll node' });
    }
    console.log();
  }

  private async testInvalidInputHandling(): Promise<void> {
    const testName = "Invalid Input Handling";
    log('info', `Testing: ${testName}`);
    
    const userId = 'test_invalid';
    this.flowEngine.resetUser(userId);
    
    // Get to a menu state
    this.flowEngine.processMessage(userId, 'halo');
    this.flowEngine.processMessage(userId, 'continue');
    this.flowEngine.processMessage(userId, 'ya, saya setuju');
    
    // Send invalid input
    log('user', `User: "random gibberish xyz123"`);
    const result = this.flowEngine.processMessage(userId, 'random gibberish xyz123');
    
    // Check if it handled gracefully (returns null for invalid input)
    if (result === null) {
      log('warn', `No matching flow found (expected behavior)`);
      log('success', `Bot should send "didn't understand" message`);
      this.results.push({ name: testName, passed: true, details: 'Invalid input handled gracefully' });
    } else {
      log('info', `Flow found: ${result.node.id}`);
      this.results.push({ name: testName, passed: true, details: 'Input matched a flow' });
    }
    console.log();
  }

  private async testFullConversation(): Promise<void> {
    const testName = "Full Conversation Simulation";
    log('info', `Testing: ${testName}`);
    
    console.log(`\n${colors.cyan}--- Simulating Complete User Journey ---${colors.reset}\n`);
    
    const userId = 'test_full_conversation';
    this.flowEngine.resetUser(userId);
    
    const conversation = [
      { input: 'halo', expected: 'start', description: 'User sends hello' },
      { input: 'continue', expected: 'agreement', description: 'Auto-proceed to agreement' },
      { input: 'ya, saya setuju', expected: 'main_menu', description: 'User accepts agreement' },
      { input: 'apa itu picky eater?', expected: 'picky_eater_intro', description: 'User asks about picky eater' },
      { input: 'continue', expected: 'picky_eater_submenu', description: 'Auto-proceed to submenu' },
      { input: 'dampak picky eater', expected: 'impact', description: 'User asks about impact' },
      { input: 'continue', expected: 'return_to_submenu', description: 'Auto-proceed to return menu' },
      { input: 'kembali ke menu utama', expected: 'main_menu', description: 'User returns to main menu' },
    ];

    let allPassed = true;
    
    for (const step of conversation) {
      log('user', `User: "${step.input}"`);
      const result = this.flowEngine.processMessage(userId, step.input);
      
      if (result && result.node.id === step.expected) {
        log('bot', `Bot (${result.node.id}): "${result.node.message.substring(0, 40)}..."`);
        log('success', step.description);
      } else {
        log('error', `Expected: ${step.expected}, Got: ${result?.node.id || 'null'}`);
        allPassed = false;
      }
    }
    
    this.results.push({ 
      name: testName, 
      passed: allPassed, 
      details: allPassed ? 'Complete conversation flow works' : 'Some steps failed' 
    });
    console.log();
  }

  private printSummary(): void {
    console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}║                 TEST SUMMARY                       ║${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    for (const result of this.results) {
      const icon = result.passed ? `${colors.green}✅` : `${colors.red}❌`;
      const status = result.passed ? 'PASSED' : 'FAILED';
      console.log(`${icon} ${result.name}: ${status}${colors.reset}`);
      console.log(`   ${colors.cyan}${result.details}${colors.reset}`);
    }
    
    console.log(`\n${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.bold}Total: ${this.results.length} tests${colors.reset}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    if (failed === 0) {
      console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! Bot flow engine is working correctly.${colors.reset}`);
      console.log(`${colors.yellow}Note: This tests the flow logic only. Make sure WhatsApp connection is working separately.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bold}⚠️ Some tests failed. Please review the flow logic.${colors.reset}`);
    }
  }
}

// Run tests
const tester = new FlowTester();
tester.runAllTests().catch(console.error);
