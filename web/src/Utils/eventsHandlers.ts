import { Send } from '../enums/events';
import { TriggerNuiCallback } from './TriggerNuiCallback';

/**
 * Send an event to the client/server
 * @param event The event name from Send enum
 * @param data The data to send
 * @returns Promise with response data
 */
export async function SendEvent<T = unknown>(event: Send, data?: unknown): Promise<T> {
  return TriggerNuiCallback<T>(event, data);
}

/**
 * Send a debug event (for development)
 * Uses postMessage to simulate NUI callbacks
 */
export function DebugEventSend<T = unknown>(event: string, data?: unknown): void {
  console.log('[Debug Event]', event, data);
  
  // Use postMessage to simulate NUI message
  window.postMessage({
    action: event,
    data: data
  }, '*');
}
