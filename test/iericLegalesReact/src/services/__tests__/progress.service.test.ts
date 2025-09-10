import { ProgressService, type ProgressTracker, type ProgressStep } from '../progress.service';

describe('ProgressService', () => {
  let progressService: ProgressService;

  beforeEach(() => {
    progressService = new ProgressService();
  });

  afterEach(() => {
    progressService.clearAll();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      expect(progressService).toBeInstanceOf(ProgressService);
      const config = progressService.getConfig();
      expect(config.updateInterval).toBe(100);
      expect(config.enableLogging).toBe(true);
      expect(config.maxTrackers).toBe(10);
      expect(config.autoCleanup).toBe(true);
    });

    it('should create instance with custom config', () => {
      const customConfig = {
        updateInterval: 200,
        enableLogging: false,
        maxTrackers: 5,
        autoCleanup: false,
        cleanupDelay: 10000
      };
      
      const service = new ProgressService(customConfig);
      expect(service.getConfig()).toEqual(customConfig);
    });
  });

  describe('Tracker Creation', () => {
    it('should create tracker with basic information', () => {
      const tracker = progressService.createTracker(
        'test-id',
        'Test Operation',
        ['Step 1', 'Step 2', 'Step 3'],
        'Test description',
        { custom: 'data' }
      );
      
      expect(tracker.id).toBe('test-id');
      expect(tracker.title).toBe('Test Operation');
      expect(tracker.description).toBe('Test description');
      expect(tracker.totalSteps).toBe(3);
      expect(tracker.currentStep).toBe(0);
      expect(tracker.overallProgress).toBe(0);
      expect(tracker.status).toBe('idle');
      expect(tracker.steps).toHaveLength(3);
      expect(tracker.metadata).toEqual({ custom: 'data' });
    });

    it('should create steps with correct structure', () => {
      const tracker = progressService.createTracker(
        'test-id',
        'Test Operation',
        ['Step 1', 'Step 2']
      );
      
      expect(tracker.steps[0]).toEqual({
        id: 'step_0',
        name: 'Step 1',
        status: 'pending',
        progress: 0
      });
      
      expect(tracker.steps[1]).toEqual({
        id: 'step_1',
        name: 'Step 2',
        status: 'pending',
        progress: 0
      });
    });

    it('should limit trackers to maxTrackers', () => {
      const service = new ProgressService({ maxTrackers: 2 });
      
      service.createTracker('id1', 'Operation 1', ['Step 1']);
      service.createTracker('id2', 'Operation 2', ['Step 1']);
      service.createTracker('id3', 'Operation 3', ['Step 1']);
      
      const trackers = service.getAllTrackers();
      expect(trackers).toHaveLength(2);
      expect(trackers[0].id).toBe('id2'); // First one should be removed
      expect(trackers[1].id).toBe('id3');
    });
  });

  describe('Tracker Management', () => {
    it('should start tracker', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      const result = progressService.startTracker('test-id');
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      expect(updatedTracker?.status).toBe('running');
      expect(updatedTracker?.startTime).toBeDefined();
    });

    it('should return false for non-existent tracker', () => {
      const result = progressService.startTracker('non-existent');
      expect(result).toBe(false);
    });

    it('should complete tracker successfully', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      progressService.startTracker('test-id');
      
      const result = progressService.completeTracker('test-id', true);
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      expect(updatedTracker?.status).toBe('completed');
      expect(updatedTracker?.endTime).toBeDefined();
    });

    it('should complete tracker with failure', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      progressService.startTracker('test-id');
      
      const result = progressService.completeTracker('test-id', false);
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      expect(updatedTracker?.status).toBe('failed');
    });

    it('should cancel tracker', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      progressService.startTracker('test-id');
      
      const result = progressService.cancelTracker('test-id');
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      expect(updatedTracker?.status).toBe('cancelled');
    });
  });

  describe('Step Management', () => {
    it('should update step progress', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      const result = progressService.updateStep('test-id', 'step_0', 50, 'running');
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      const step = updatedTracker?.steps[0];
      expect(step?.progress).toBe(50);
      expect(step?.status).toBe('running');
      expect(step?.startTime).toBeDefined();
    });

    it('should complete step', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      progressService.updateStep('test-id', 'step_0', 100, 'completed');
      
      const updatedTracker = progressService.getTracker('test-id');
      const step = updatedTracker?.steps[0];
      expect(step?.status).toBe('completed');
      expect(step?.endTime).toBeDefined();
    });

    it('should update step with error', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      const result = progressService.updateStep('test-id', 'step_0', 0, 'failed', 'Step failed');
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      const step = updatedTracker?.steps[0];
      expect(step?.status).toBe('failed');
      expect(step?.error).toBe('Step failed');
    });

    it('should update step with metadata', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      const result = progressService.updateStep('test-id', 'step_0', 50, 'running', undefined, { custom: 'data' });
      expect(result).toBe(true);
      
      const updatedTracker = progressService.getTracker('test-id');
      const step = updatedTracker?.steps[0];
      expect(step?.metadata).toEqual({ custom: 'data' });
    });

    it('should return false for non-existent tracker or step', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      expect(progressService.updateStep('non-existent', 'step_0', 50)).toBe(false);
      expect(progressService.updateStep('test-id', 'non-existent', 50)).toBe(false);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate overall progress correctly', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1', 'Step 2', 'Step 3']);
      
      // Complete first step
      progressService.updateStep('test-id', 'step_0', 100, 'completed');
      
      const updatedTracker = progressService.getTracker('test-id');
      expect(updatedTracker?.overallProgress).toBe(33); // 1/3 * 100
      expect(updatedTracker?.currentStep).toBe(1);
    });

    it('should calculate progress with running steps', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1', 'Step 2']);
      
      // Complete first step, run second step at 50%
      progressService.updateStep('test-id', 'step_0', 100, 'completed');
      progressService.updateStep('test-id', 'step_1', 50, 'running');
      
      const updatedTracker = progressService.getTracker('test-id');
      expect(updatedTracker?.overallProgress).toBe(75); // (100 + 50) / 2
      expect(updatedTracker?.currentStep).toBe(2);
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers when tracker changes', () => {
      const mockCallback = jest.fn();
      const unsubscribe = progressService.subscribe(mockCallback);
      
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-id',
        title: 'Test Operation'
      }));
      
      unsubscribe();
    });

    it('should allow unsubscribing from updates', () => {
      const mockCallback = jest.fn();
      const unsubscribe = progressService.subscribe(mockCallback);
      
      progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      
      progressService.createTracker('test-id-2', 'Test Operation 2', ['Step 1']);
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Cleanup', () => {
    it('should remove specific tracker', () => {
      const tracker = progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      const result = progressService.removeTracker('test-id');
      expect(result).toBe(true);
      
      expect(progressService.getTracker('test-id')).toBeUndefined();
      expect(progressService.getAllTrackers()).toHaveLength(0);
    });

    it('should clear all trackers', () => {
      progressService.createTracker('id1', 'Operation 1', ['Step 1']);
      progressService.createTracker('id2', 'Operation 2', ['Step 1']);
      
      progressService.clearAll();
      
      expect(progressService.getAllTrackers()).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('should return correct statistics', () => {
      const tracker1 = progressService.createTracker('id1', 'Operation 1', ['Step 1']);
      const tracker2 = progressService.createTracker('id2', 'Operation 2', ['Step 1']);
      
      progressService.startTracker('id1');
      progressService.completeTracker('id2', true);
      
      const stats = progressService.getStats();
      expect(stats.totalTrackers).toBe(2);
      expect(stats.activeTrackers).toBe(1);
      expect(stats.completedTrackers).toBe(1);
      expect(stats.failedTrackers).toBe(0);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxTrackers: 5,
        enableLogging: false
      };
      
      progressService.updateConfig(newConfig);
      
      const config = progressService.getConfig();
      expect(config.maxTrackers).toBe(5);
      expect(config.enableLogging).toBe(false);
    });
  });

  describe('Auto-cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should cleanup completed trackers after delay', () => {
      const service = new ProgressService({
        autoCleanup: true,
        cleanupDelay: 5000
      });
      
      const tracker = service.createTracker('test-id', 'Test Operation', ['Step 1']);
      service.completeTracker('test-id', true);
      
      expect(service.getAllTrackers()).toHaveLength(1);
      
      // Advance time past cleanup delay
      jest.advanceTimersByTime(5000);
      
      expect(service.getAllTrackers()).toHaveLength(0);
    });

    it('should not cleanup running trackers', () => {
      const service = new ProgressService({
        autoCleanup: true,
        cleanupDelay: 5000
      });
      
      const tracker = service.createTracker('test-id', 'Test Operation', ['Step 1']);
      service.startTracker('test-id');
      
      jest.advanceTimersByTime(5000);
      
      expect(service.getAllTrackers()).toHaveLength(1);
    });
  });

  describe('Destroy', () => {
    it('should destroy service and clean up', () => {
      progressService.createTracker('test-id', 'Test Operation', ['Step 1']);
      
      progressService.destroy();
      
      expect(progressService.getAllTrackers()).toHaveLength(0);
    });
  });
});
