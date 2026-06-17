/**
 * State Manager for persistent conversation state
 * Handles file-based storage for user conversation context
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface UserSession {
  userId: string;
  currentNode: string;
  history: string[];
  context: { [key: string]: any };
  lastActivity: number;
}

export class StateManager {
  private storePath: string;
  private sessions: Map<string, UserSession>;
  private saveInterval: NodeJS.Timeout | null = null;
  private sessionTimeout: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(storePath: string = './state') {
    this.storePath = storePath;
    this.sessions = new Map();
    this.initialize();
  }

  private initialize(): void {
    // Create state directory if it doesn't exist
    if (!existsSync(this.storePath)) {
      mkdirSync(this.storePath, { recursive: true });
    }

    // Load existing sessions
    this.loadSessions();

    // Auto-save every 30 seconds
    this.saveInterval = setInterval(() => {
      this.saveSessions();
      this.cleanupExpiredSessions();
    }, 30000);
  }

  private getFilePath(): string {
    return join(this.storePath, 'user_sessions.json');
  }

  private loadSessions(): void {
    const filePath = this.getFilePath();
    
    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath, 'utf-8');
        const sessionsArray: UserSession[] = JSON.parse(data);
        
        sessionsArray.forEach(session => {
          this.sessions.set(session.userId, session);
        });
        
        console.log(`Loaded ${this.sessions.size} user sessions`);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  }

  private saveSessions(): void {
    const filePath = this.getFilePath();
    
    try {
      const sessionsArray = Array.from(this.sessions.values());
      writeFileSync(filePath, JSON.stringify(sessionsArray, null, 2));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  public getSession(userId: string): UserSession | null {
    return this.sessions.get(userId) || null;
  }

  public createSession(userId: string): UserSession {
    const session: UserSession = {
      userId,
      currentNode: 'start',
      history: [],
      context: {},
      lastActivity: Date.now()
    };
    
    this.sessions.set(userId, session);
    return session;
  }

  public updateSession(userId: string, updates: Partial<UserSession>): void {
    const session = this.sessions.get(userId);
    
    if (session) {
      Object.assign(session, updates, { lastActivity: Date.now() });
      this.sessions.set(userId, session);
    }
  }

  public resetSession(userId: string): void {
    const session = this.sessions.get(userId);
    
    if (session) {
      session.currentNode = 'start';
      session.history = [];
      session.context = {};
      session.lastActivity = Date.now();
      this.sessions.set(userId, session);
    }
  }

  public deleteSession(userId: string): void {
    this.sessions.delete(userId);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredUsers: string[] = [];
    
    this.sessions.forEach((session, userId) => {
      if (now - session.lastActivity > this.sessionTimeout) {
        expiredUsers.push(userId);
      }
    });
    
    expiredUsers.forEach(userId => {
      this.sessions.delete(userId);
    });
    
    if (expiredUsers.length > 0) {
      console.log(`Cleaned up ${expiredUsers.length} expired sessions`);
    }
  }

  public getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  public getActiveSessionCount(): number {
    return this.sessions.size;
  }

  public shutdown(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    this.saveSessions();
  }
}
