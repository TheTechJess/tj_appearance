/**
  * Returns true if you're running on a browser.
  * 
  * Returns false if you're running on the Chromium Embedded Framework.
**/
export const IsRunningInBrowser = (): boolean => !(window as any).invokeNative;

/**
 * Get the parent resource name for NUI callbacks.
 * Falls back to 'debug' if not available.
**/
export const GetResourceName = (): string => {
  return (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : 'debug';
};

/**
 * Just a basic no operation function
**/
export const NoOperationFunction = () => {};