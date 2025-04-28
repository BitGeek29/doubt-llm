export interface ChatMessage {
    role: 'user' | 'model';
    parts: MessagePart[];
  }
  
  export interface MessagePart {
    text?: string;
    inline_data?: FileData;
  }
  
  export interface FileData {
    mime_type?: string | undefined;
    data?: string | undefined;
    fileName?: string;
    isImage?: boolean;
  }
  
  export interface UserData {
    message: string;
    file: Partial<FileData>;
  }

  export interface Subject {
    text: string;
    systemInstruction: string;
    title: string;
    icon: string;
  }