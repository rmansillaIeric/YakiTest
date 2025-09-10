import { RetryService, type RetryConfig, type RetryResult } from '../retry.service';

describe('RetryService', () => {
  let retryService: RetryService;

  beforeEach(() => {
    retryService = new RetryService();
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      expect(retryService).toBeInstanceOf(RetryService);
      const config = retryService.getConfig();
      expect(config.maxAttempts).toBe(3);
      expect(config.baseDelay).toBe(1000);
      expect(config.maxDelay).toBe(10000);
      expect(config.backoffMultiplier).toBe(2);
      expect(config.jitter).toBe(true);
    });

    it('should create instance with custom config', () => {
      const customConfig: Partial<RetryConfig> = {
        maxAttempts: 5,
        baseDelay: 500,
        maxDelay: 5000
      };
      
      const service = new RetryService(customConfig);
      const config = service.getConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.baseDelay).toBe(500);
      expect(config.maxDelay).toBe(5000);
    });
  });

  describe('Basic Retry Logic', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue('success');
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('Always fails');
      expect(result.attempts).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Retry Conditions', () => {
    it('should not retry on AbortError', async () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      
      const mockFn = jest.fn().mockRejectedValue(abortError);
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx errors', async () => {
      const serverError = new Error('Server error');
      (serverError as any).status = 500;
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should retry on timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.message = 'timeout occurred';
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValue('success');
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should not retry on 4xx errors', async () => {
      const clientError = new Error('Client error');
      (clientError as any).status = 400;
      
      const mockFn = jest.fn().mockRejectedValue(clientError);
      
      const result = await retryService.execute(mockFn);
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
    });
  });

  describe('Delay Calculation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate exponential backoff delay', async () => {
      const service = new RetryService({
        maxAttempts: 3,
        baseDelay: 1000,
        backoffMultiplier: 2,
        jitter: false
      });
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      const promise = service.execute(mockFn);
      
      // Advance timers to simulate delays
      jest.advanceTimersByTime(1000); // First retry delay
      jest.advanceTimersByTime(2000); // Second retry delay
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
    });

    it('should cap delay at maxDelay', async () => {
      const service = new RetryService({
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 2,
        jitter: false
      });
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockRejectedValueOnce(new Error('Third attempt'))
        .mockResolvedValue('success');
      
      const promise = service.execute(mockFn);
      
      // Advance timers - third delay should be capped at 2000ms
      jest.advanceTimersByTime(1000); // First retry: 1000ms
      jest.advanceTimersByTime(2000); // Second retry: 2000ms
      jest.advanceTimersByTime(2000); // Third retry: capped at 2000ms
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(4);
    });
  });

  describe('Callbacks', () => {
    it('should call onRetry callback for each retry', async () => {
      const onRetry = jest.fn();
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValue('success');
      
      await retryService.execute(mockFn, {
        onRetry,
        onSuccess,
        onFailure
      });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith('success', 2);
      expect(onFailure).not.toHaveBeenCalled();
    });

    it('should call onFailure callback when max attempts reached', async () => {
      const onRetry = jest.fn();
      const onSuccess = jest.fn();
      const onFailure = jest.fn();
      
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await retryService.execute(mockFn, {
        onRetry,
        onSuccess,
        onFailure
      });
      
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).toHaveBeenCalledTimes(1);
      expect(onFailure).toHaveBeenCalledWith(expect.any(Error), 3);
    });
  });

  describe('Specialized Methods', () => {
    it('should execute request with HTTP-specific retry conditions', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limited' })
        .mockResolvedValue('success');
      
      const result = await retryService.executeRequest(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should execute critical operation with extended retry', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockRejectedValueOnce(new Error('Third attempt'))
        .mockRejectedValueOnce(new Error('Fourth attempt'))
        .mockResolvedValue('success');
      
      const result = await retryService.executeCritical(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(5);
    });

    it('should execute fast operation with minimal retry', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValue('success');
      
      const result = await retryService.executeFast(mockFn);
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxAttempts: 5,
        baseDelay: 2000
      };
      
      retryService.updateConfig(newConfig);
      
      const config = retryService.getConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.baseDelay).toBe(2000);
    });
  });

  describe('Static Factory Method', () => {
    it('should create instance with static method', () => {
      const config = { maxAttempts: 10 };
      const service = RetryService.create(config);
      
      expect(service).toBeInstanceOf(RetryService);
      expect(service.getConfig().maxAttempts).toBe(10);
    });
  });

  describe('Performance Metrics', () => {
    it('should track total execution time', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryService.execute(mockFn);
      
      expect(result.totalTime).toBeGreaterThan(0);
      expect(typeof result.totalTime).toBe('number');
    });
  });
});
