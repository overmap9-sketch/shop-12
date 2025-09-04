import { useToast } from './use-toast';
import { NotificationService } from '../shared/lib/notifications';

export function useNotifications() {
  const { toast, dismiss } = useToast();

  // Enhanced notification methods with better UX
  const showSuccess = (title: string, description?: string) => {
    return NotificationService.success(title, description);
  };

  const showError = (title: string, description?: string) => {
    return NotificationService.error(title, description);
  };

  const showWarning = (title: string, description?: string) => {
    return NotificationService.warning(title, description);
  };

  const showInfo = (title: string, description?: string) => {
    return NotificationService.info(title, description);
  };

  // Loading notification with auto-dismiss
  const showLoading = (title: string, description?: string) => {
    return NotificationService.loading(title, description);
  };

  // Dismiss all notifications
  const dismissAll = () => {
    dismiss();
  };

  // Promise-based notification for async operations
  const notifyAsync = async <T>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading?: string;
      success?: string | ((result: T) => string);
      error?: string | ((error: Error) => string);
    }
  ): Promise<T> => {
    let loadingToast: ReturnType<typeof toast> | undefined;

    try {
      if (loadingMessage) {
        loadingToast = showLoading('Loading...', loadingMessage);
      }

      const result = await promise;

      if (loadingToast) {
        loadingToast.dismiss();
      }

      if (successMessage) {
        const message = typeof successMessage === 'function' ? successMessage(result) : successMessage;
        showSuccess('Success', message);
      }

      return result;
    } catch (error) {
      if (loadingToast) {
        loadingToast.dismiss();
      }

      if (errorMessage) {
        const message = typeof errorMessage === 'function' 
          ? errorMessage(error instanceof Error ? error : new Error('Unknown error'))
          : errorMessage;
        showError('Error', message);
      }

      throw error;
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissAll,
    notifyAsync,
    // Direct access to NotificationService methods
    auth: {
      loginSuccess: NotificationService.loginSuccess,
      loginError: NotificationService.loginError,
      logoutSuccess: NotificationService.logoutSuccess,
      registerSuccess: NotificationService.registerSuccess,
      registerError: NotificationService.registerError,
    },
    cart: {
      addSuccess: NotificationService.addToCartSuccess,
      removeSuccess: NotificationService.removeFromCartSuccess,
      updateSuccess: NotificationService.updateCartSuccess,
      clearSuccess: NotificationService.clearCartSuccess,
      error: NotificationService.cartError,
    },
    favourites: {
      addSuccess: NotificationService.addToFavouritesSuccess,
      removeSuccess: NotificationService.removeFromFavouritesSuccess,
      error: NotificationService.favouritesError,
    },
  };
}
