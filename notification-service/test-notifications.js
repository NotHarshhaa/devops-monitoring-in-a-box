#!/usr/bin/env node

/**
 * Test script for the notification service
 * This script tests all notification channels to ensure they're working correctly
 */

const axios = require('axios');

const NOTIFICATION_SERVICE_URL = 'http://localhost:5001';

// Test data
const testAlert = {
  title: 'Test Alert',
  description: 'This is a test alert from the DevOps Monitor notification service',
  severity: 'warning',
  metadata: {
    instance: 'test-server-01',
    service: 'test-service',
    component: 'test-component',
    runbook_url: 'https://docs.example.com/runbooks/test-alert'
  }
};

async function testHealth() {
  console.log('🔍 Testing notification service health...');
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testConfiguration() {
  console.log('🔍 Testing configuration endpoint...');
  try {
    const response = await axios.get(`${NOTIFICATION_SERVICE_URL}/config`);
    console.log('✅ Configuration retrieved:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    return false;
  }
}

async function testNotification(channel) {
  console.log(`🔍 Testing ${channel} notification...`);
  try {
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/test/${channel}`);
    console.log(`✅ ${channel} test passed:`, response.data);
    return true;
  } catch (error) {
    console.error(`❌ ${channel} test failed:`, error.message);
    return false;
  }
}

async function testDirectNotification() {
  console.log('🔍 Testing direct notification...');
  try {
    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notify`, {
      channel: 'all',
      message: testAlert,
      severity: 'warning',
      metadata: testAlert.metadata
    });
    console.log('✅ Direct notification test passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Direct notification test failed:', error.message);
    return false;
  }
}

async function testWebhook() {
  console.log('🔍 Testing webhook endpoint...');
  try {
    const webhookData = {
      alerts: [
        {
          status: 'firing',
          labels: {
            alertname: 'TestAlert',
            instance: 'test-server-01',
            severity: 'warning',
            service: 'test-service'
          },
          annotations: {
            summary: 'Test alert from webhook',
            description: 'This is a test alert sent via webhook',
            runbook_url: 'https://docs.example.com/runbooks/test-alert'
          }
        }
      ]
    };

    const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/webhook`, webhookData);
    console.log('✅ Webhook test passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting notification service tests...\n');

  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Configuration', fn: testConfiguration },
    { name: 'Slack Test', fn: () => testNotification('slack') },
    { name: 'Teams Test', fn: () => testNotification('teams') },
    { name: 'Discord Test', fn: () => testNotification('discord') },
    { name: 'Email Test', fn: () => testNotification('email') },
    { name: 'Webhook Test', fn: () => testNotification('webhook') },
    { name: 'Direct Notification', fn: testDirectNotification },
    { name: 'Alertmanager Webhook', fn: testWebhook }
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const success = await test.fn();
    results.push({ name: test.name, success });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Notification service is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the configuration and try again.');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'health':
    testHealth();
    break;
  case 'config':
    testConfiguration();
    break;
  case 'slack':
    testNotification('slack');
    break;
  case 'teams':
    testNotification('teams');
    break;
  case 'discord':
    testNotification('discord');
    break;
  case 'email':
    testNotification('email');
    break;
  case 'webhook':
    testNotification('webhook');
    break;
  case 'direct':
    testDirectNotification();
    break;
  case 'alertmanager':
    testWebhook();
    break;
  case 'all':
  default:
    runAllTests();
    break;
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
