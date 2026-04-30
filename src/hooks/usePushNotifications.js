import { useEffect } from 'react'
import { pushService } from '../services/pushService'

export function usePushNotifications(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) {
      pushService.cleanupForLogout()
      return
    }

    pushService.ensureSubscribed()
  }, [isAuthenticated])
}
