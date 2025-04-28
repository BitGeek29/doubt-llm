import { writable } from 'svelte/store';
import type { ChatMessage, FileData, MessagePart, UserData, Subject } from '$lib/types';

export const chatHistory = writable<ChatMessage[]>([]);
export const userData = writable<UserData>({ message: '', file: {} });
export const currentSubject = writable<Subject>({text: "", systemInstruction: "", title: "", icon: ""});
export const isResponding = writable<boolean>(false);
export const chatsActive = writable<boolean>(false);
export const systemInstruction = writable<string>("");

export function clearChats() {
  chatHistory.set([]);
  chatsActive.set(false);
  isResponding.set(false);
  systemInstruction.set("");
  currentSubject.set({text: "", systemInstruction: "", title: "", icon: ""});
}

export function addUserMessage(message: string, fileData: Partial<FileData> | undefined) {
  const parts: MessagePart[] = [{ text: message }];
  if (fileData?.data) {
    const { fileName, isImage, ...rest } = fileData;
    parts.push({ inline_data: rest });
  }
  
  chatHistory.update(history => [...history, { role: 'user', parts }]);
}

export function addModelMessage(text: string) {
    chatHistory.update(history => [...history, { role: 'model', parts: [{ text }] }]);
}