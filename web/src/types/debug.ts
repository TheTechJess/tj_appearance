export type DebugActionType = 'button' | 'text' | 'checkbox' | 'slider';

export interface DebugAction {
  type?: DebugActionType;
  label: string;
  value?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  delay?: number;
  action: (value?: any) => void;
}

export interface DebugSection {
  label: string;
  actions: DebugAction[];
}
