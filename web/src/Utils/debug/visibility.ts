import { SendNuiMessage } from '../SendNuiMessage';

/**
 * Toggle visibility of the debug UI
 * In browser mode, this sends a NUI message to show/hide the UI
 */
export const toggleVisible = (visible: boolean): void => {
  SendNuiMessage([{ action: 'setVisibleApp', data: visible }]);
};
