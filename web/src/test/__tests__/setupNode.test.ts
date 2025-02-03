describe('Node.js Test Environment Setup', () => {
  describe('Global Objects', () => {
    it('should have TextEncoder and TextDecoder defined', () => {
      expect(global.TextEncoder).toBeDefined();
      expect(global.TextDecoder).toBeDefined();
    });

    it('should have process.env configured', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.TZ).toBe('UTC');
    });
  });

  describe('Window Mock', () => {
    it('should have location properties', () => {
      expect(window.location.href).toBe('http://localhost:3000');
      expect(window.location.origin).toBe('http://localhost:3000');
      expect(window.location.protocol).toBe('http:');
      expect(window.location.host).toBe('localhost:3000');
      expect(window.location.hostname).toBe('localhost');
      expect(window.location.port).toBe('3000');
      expect(window.location.pathname).toBe('/');
      expect(window.location.search).toBe('');
      expect(window.location.hash).toBe('');
    });

    it('should have localStorage mock', () => {
      window.localStorage.setItem('test', 'value');
      expect(window.localStorage.getItem('test')).toBe('value');
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.getItem).toHaveBeenCalled();
    });

    it('should have sessionStorage mock', () => {
      window.sessionStorage.setItem('test', 'value');
      expect(window.sessionStorage.getItem('test')).toBe('value');
      expect(window.sessionStorage.setItem).toHaveBeenCalled();
      expect(window.sessionStorage.getItem).toHaveBeenCalled();
    });

    it('should have matchMedia mock', () => {
      const mediaQuery = window.matchMedia('(min-width: 768px)');
      expect(mediaQuery.matches).toBe(false);
      expect(mediaQuery.media).toBe('(min-width: 768px)');
      expect(mediaQuery.addListener).toBeDefined();
      expect(mediaQuery.removeListener).toBeDefined();
    });

    it('should have animation frame mocks', () => {
      const callback = jest.fn();
      const id = window.requestAnimationFrame(callback);
      expect(setTimeout).toHaveBeenCalledWith(callback, 0);
      window.cancelAnimationFrame(id);
      expect(window.requestAnimationFrame).toHaveBeenCalled();
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should have window dimensions', () => {
      expect(window.innerWidth).toBe(1280);
      expect(window.innerHeight).toBe(800);
      expect(window.devicePixelRatio).toBe(1);
    });
  });

  describe('Document Mock', () => {
    it('should have document element properties', () => {
      expect(document.documentElement.clientWidth).toBe(1280);
      expect(document.documentElement.clientHeight).toBe(800);
      expect(document.documentElement.scrollTop).toBe(0);
      expect(document.documentElement.scrollLeft).toBe(0);
    });

    it('should create elements with mock methods', () => {
      const element = document.createElement('div');
      element.setAttribute('id', 'test');
      element.classList.add('test-class');

      expect(element.tagName).toBe('DIV');
      expect(element.setAttribute).toHaveBeenCalledWith('id', 'test');
      expect(element.classList.add).toHaveBeenCalledWith('test-class');
    });

    it('should have query selector mocks', () => {
      document.querySelector('.test');
      document.querySelectorAll('.test');
      document.getElementById('test');
      document.getElementsByClassName('test');
      document.getElementsByTagName('div');

      expect(document.querySelector).toHaveBeenCalled();
      expect(document.querySelectorAll).toHaveBeenCalled();
      expect(document.getElementById).toHaveBeenCalled();
      expect(document.getElementsByClassName).toHaveBeenCalled();
      expect(document.getElementsByTagName).toHaveBeenCalled();
    });
  });

  describe('Fetch API Mock', () => {
    it('should mock fetch with default response', async () => {
      const response = await fetch('https://api.example.com');
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({});
      expect(await response.text()).toBe('');
      expect(await response.blob()).toBeInstanceOf(Blob);
      expect(await response.arrayBuffer()).toBeInstanceOf(ArrayBuffer);
      expect(await response.formData()).toBeInstanceOf(FormData);
    });
  });

  describe('WebSocket Mock', () => {
    it('should mock WebSocket lifecycle', (done) => {
      const ws = new WebSocket('ws://localhost:8080');
      expect(ws.readyState).toBe(WebSocket.CONNECTING);

      ws.onopen = () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.send('test message');
        expect(ws.send).toHaveBeenCalledWith('test message');
        ws.close();
        expect(ws.close).toHaveBeenCalled();
        done();
      };
    });
  });

  describe('Console Mock', () => {
    it('should mock console methods', () => {
      console.log('test');
      console.info('test');
      console.warn('test');
      console.error('test');
      console.debug('test');

      expect(console.log).toHaveBeenCalledWith('test');
      expect(console.info).toHaveBeenCalledWith('test');
      expect(console.warn).toHaveBeenCalledWith('test');
      expect(console.error).toHaveBeenCalledWith('test');
      expect(console.debug).toHaveBeenCalledWith('test');
    });
  });

  describe('Cleanup', () => {
    it('should clear mocks after each test', () => {
      const mock = jest.fn();
      mock();
      expect(mock).toHaveBeenCalled();
      
      // Run cleanup
      jest.clearAllMocks();
      expect(mock).not.toHaveBeenCalled();
    });

    it('should clear storage after each test', () => {
      window.localStorage.setItem('test', 'value');
      window.sessionStorage.setItem('test', 'value');
      
      // Run cleanup
      window.localStorage.clear();
      window.sessionStorage.clear();
      
      expect(window.localStorage.getItem('test')).toBeNull();
      expect(window.sessionStorage.getItem('test')).toBeNull();
    });
  });
});