import { ref, readonly } from 'vue'

// Global state for demo notifications
const showDemoNotification = ref(false)
const demoNotificationMessage = ref('')

export function useDemoNotification() {
  const { isDemoUser } = useAuth()

  /**
   * Shows a notification when demo user tries to perform a restricted action
   * @param action - Description of the action being blocked
   */
  const showDemoRestriction = (action: string = 'action') => {
    if (isDemoUser.value) {
      demoNotificationMessage.value = `${action.charAt(0).toUpperCase() + action.slice(1)} is not available in demo mode. Create a full account to access all features!`
      showDemoNotification.value = true
      return true
    }
    return false
  }

  /**
   * Closes the demo notification
   */
  const closeDemoNotification = () => {
    showDemoNotification.value = false
    demoNotificationMessage.value = ''
  }

  /**
   * Checks if user is demo user and shows notification if they try restricted action
   * @param action - Description of the action being attempted
   * @returns true if demo user (action blocked), false if regular user (action allowed)
   */
  const checkDemoRestriction = (action: string = 'action'): boolean => {
    return showDemoRestriction(action)
  }

  return {
    showDemoNotification: readonly(showDemoNotification),
    demoNotificationMessage: readonly(demoNotificationMessage),
    showDemoRestriction,
    closeDemoNotification,
    checkDemoRestriction,
    isDemoUser,
  }
}
