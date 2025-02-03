import fs from 'fs';
import path from 'path';
import type { Message, Conversation } from '../types/chat';
import type { SystemOperation, SystemResponse, SystemCapability } from '../types/system';
import type { Notification } from '../store/ui';

export interface MessageFixtures {
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];
  systemOperations: SystemOperation[];
  systemResponses: SystemResponse[];
}

export interface SystemFixtures {
  capabilities: SystemCapability[];
  status: {
    isConnected: boolean;
    lastOperation: SystemOperation | null;
    lastResponse: SystemResponse | null;
    pendingOperations: number;
    errors: string[];
  };
  events: Array<{
    type: string;
    content: string;
    timestamp: number;
  }>;
  metrics: {
    cpu: { usage: number; timestamp: number };
    memory: { total: number; used: number; timestamp: number };
    disk: { total: number; used: number; timestamp: number };
    network: { bytesIn: number; bytesOut: number; timestamp: number };
  };
}

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

export const loadFixture = <T>(filename: string): T => {
  const filePath = path.join(FIXTURES_DIR, filename);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    throw new Error(`Failed to load fixture ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const loadMessageFixtures = (): MessageFixtures => {
  return loadFixture<MessageFixtures>('messages.json');
};

export const loadSystemFixtures = (): SystemFixtures => {
  return loadFixture<SystemFixtures>('system.json');
};

export const getTestMessage = (id: string): Message | undefined => {
  const fixtures = loadMessageFixtures();
  return fixtures.messages.find(message => message.id === id);
};

export const getTestConversation = (id: string): Conversation | undefined => {
  const fixtures = loadMessageFixtures();
  return fixtures.conversations.find(conversation => conversation.id === id);
};

export const getTestNotification = (id: string): Notification | undefined => {
  const fixtures = loadMessageFixtures();
  return fixtures.notifications.find(notification => notification.id === id);
};

export const getTestOperation = (requestId: string): SystemOperation | undefined => {
  const fixtures = loadMessageFixtures();
  return fixtures.systemOperations.find(operation => operation.requestId === requestId);
};

export const getTestResponse = (requestId: string): SystemResponse | undefined => {
  const fixtures = loadMessageFixtures();
  return fixtures.systemResponses.find(response => response.requestId === requestId);
};

export const getTestCapability = (type: string): SystemCapability | undefined => {
  const fixtures = loadSystemFixtures();
  return fixtures.capabilities.find(capability => capability.type === type);
};

export const getTestMetrics = () => {
  const fixtures = loadSystemFixtures();
  return fixtures.metrics;
};

export const getTestEvents = () => {
  const fixtures = loadSystemFixtures();
  return fixtures.events;
};

// Helper to create a temporary fixture for a test
export const createTempFixture = async <T>(data: T): Promise<string> => {
  const tempDir = path.join(FIXTURES_DIR, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFile = path.join(tempDir, `${Date.now()}.json`);
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));

  return tempFile;
};

// Helper to clean up temporary fixtures
export const cleanupTempFixtures = () => {
  const tempDir = path.join(FIXTURES_DIR, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

// Register cleanup on process exit
process.on('exit', cleanupTempFixtures);
process.on('SIGINT', () => {
  cleanupTempFixtures();
  process.exit();
});