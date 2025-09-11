import { NotificationService, type Notification, type NotificationType } from '../notification.service';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
  });

  afterEach(() => {
    notificationService.clear();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      expect(notificationService).toBeInstanceOf(NotificationService);
      expect(notificationService.getConfig().defaultDuration).toBe(5000);
      expect(notificationService.getConfig().maxNotifications).toBe(5);
    });

    it('should create instance with custom config', () => {
      const customConfig = {
        defaultDuration: 3000,
        maxNotifications: 3,
        position: 'top-left' as const,
        enableSound: true,
        enableVibration: true
      };
      
      const service = new NotificationService(customConfig);
      expect(service.getConfig()).toEqual(customConfig);
    });
  });

  describe('Notification Creation', () => {
    it('should create success notification', () => {
      const id = notificationService.success('Test Success', 'Operation completed');
      
      expect(id).toBeDefined();
      expect(notificationService.getNotifications()).toHaveLength(1);
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.type).toBe('success');
      expect(notification.title).toBe('Test Success');
      expect(notification.message).toBe('Operation completed');
      expect(notification.persistent).toBe(false);
    });

    it('should create error notification with persistent flag', () => {
      const id = notificationService.error('Test Error', 'Something went wrong');
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.type).toBe('error');
      expect(notification.persistent).toBe(true);
    });

    it('should create loading notification with persistent flag', () => {
      const id = notificationService.loading('Loading...', 'Please wait');
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.type).toBe('loading');
      expect(notification.persistent).toBe(true);
    });

    it('should create notification with custom options', () => {
      const actions = [
        { label: 'Retry', action: jest.fn(), variant: 'primary' as const }
      ];
      
      const id = notificationService.success('Test', 'Message', {
        duration: 10000,
        actions
      });
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.duration).toBe(10000);
      expect(notification.actions).toEqual(actions);
    });
  });

  describe('Notification Management', () => {
    it('should remove notification by id', () => {
      const id = notificationService.info('Test', 'Message');
      expect(notificationService.getNotifications()).toHaveLength(1);
      
      notificationService.remove(id);
      expect(notificationService.getNotifications()).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      notificationService.success('Test 1', 'Message 1');
      notificationService.error('Test 2', 'Message 2');
      expect(notificationService.getNotifications()).toHaveLength(2);
      
      notificationService.clear();
      expect(notificationService.getNotifications()).toHaveLength(0);
    });

    it('should limit notifications to maxNotifications', () => {
      const service = new NotificationService({ maxNotifications: 2 });
      
      service.info('Test 1', 'Message 1');
      service.info('Test 2', 'Message 2');
      service.info('Test 3', 'Message 3');
      
      const notifications = service.getNotifications();
      expect(notifications).toHaveLength(2);
      expect(notifications[0].title).toBe('Test 2'); // First one should be removed
      expect(notifications[1].title).toBe('Test 3');
    });
  });

  describe('Auto-dismiss', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-dismiss non-persistent notifications', () => {
      notificationService.success('Test', 'Message', { duration: 1000 });
      expect(notificationService.getNotifications()).toHaveLength(1);
      
      jest.advanceTimersByTime(1000);
      expect(notificationService.getNotifications()).toHaveLength(0);
    });

    it('should not auto-dismiss persistent notifications', () => {
      notificationService.error('Test', 'Message');
      expect(notificationService.getNotifications()).toHaveLength(1);
      
      jest.advanceTimersByTime(10000);
      expect(notificationService.getNotifications()).toHaveLength(1);
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers when notifications change', () => {
      const mockCallback = jest.fn();
      const unsubscribe = notificationService.subscribe(mockCallback);
      
      notificationService.success('Test', 'Message');
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          type: 'success',
          title: 'Test',
          message: 'Message'
        })
      ]));
      
      unsubscribe();
    });

    it('should allow unsubscribing from notifications', () => {
      const mockCallback = jest.fn();
      const unsubscribe = notificationService.subscribe(mockCallback);
      
      notificationService.success('Test 1', 'Message 1');
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      
      notificationService.success('Test 2', 'Message 2');
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Convenience Methods', () => {
    it('should create retry error notification', () => {
      const onRetry = jest.fn();
      const id = notificationService.showRetryError('Error', 'Something failed', onRetry);
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.type).toBe('error');
      expect(notification.actions).toHaveLength(2);
      expect(notification.actions![0].label).toBe('Reintentar');
      expect(notification.actions![1].label).toBe('Cancelar');
    });

    it('should create success notification with action', () => {
      const onAction = jest.fn();
      const id = notificationService.showSuccessWithAction('Success', 'Operation completed', 'View Details', onAction);
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.type).toBe('success');
      expect(notification.actions).toHaveLength(1);
      expect(notification.actions![0].label).toBe('View Details');
    });

    it('should create progress notification', () => {
      const id = notificationService.showProgress('Loading', 'Processing data', 50);
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.type).toBe('loading');
      expect(notification.message).toBe('Processing data (50%)');
      expect(notification.persistent).toBe(true);
    });

    it('should update progress notification', () => {
      const id = notificationService.showProgress('Loading', 'Processing data', 25);
      
      notificationService.updateProgress(id, 75, 'Almost done');
      
      const notification = notificationService.getNotifications()[0];
      expect(notification.message).toBe('Almost done (75%)');
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        defaultDuration: 10000,
        maxNotifications: 10
      };
      
      notificationService.updateConfig(newConfig);
      
      const config = notificationService.getConfig();
      expect(config.defaultDuration).toBe(10000);
      expect(config.maxNotifications).toBe(10);
    });
  });

  describe('Effects', () => {
    it('should play sound when enabled', () => {
      const service = new NotificationService({ enableSound: true });
      const consoleSpy = jest.spyOn(console, 'log');
      
      service.success('Test', 'Message');
      
      expect(consoleSpy).toHaveBeenCalledWith('Sound: 🔔');
    });

    it('should vibrate when enabled', () => {
      const service = new NotificationService({ enableVibration: true });
      const vibrateSpy = jest.spyOn(navigator, 'vibrate');
      
      service.success('Test', 'Message');
      
      expect(vibrateSpy).toHaveBeenCalledWith([100]);
    });
  });
});
