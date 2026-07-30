export const NOTIFICATION_CHANGE_EVENT = 'notification-change';

export function dispatchNotificationChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_CHANGE_EVENT));
  }
}
