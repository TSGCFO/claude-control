import '@testing-library/jest-dom';
import '../types/matchers';
import {
  waitForComponentUpdate,
  simulateUserInteraction,
  simulateFormInteraction,
  simulateKeyboardInteraction,
  simulateDragAndDrop,
  simulateFileUpload,
  simulateClipboardOperation,
  simulateScroll,
  simulateResize,
  simulateMediaQuery
} from '../setupReact';

describe('React Test Utilities', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    jest.clearAllMocks();
  });

  describe('Custom Matchers', () => {
    it('should check style rules', () => {
      element.style.color = 'red';
      expect(element).toHaveStyleRule('color', 'red');
    });

    it('should check viewport visibility', () => {
      // Element is in viewport
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          top: 0,
          left: 0,
          bottom: 100,
          right: 100,
          width: 100,
          height: 100,
          x: 0,
          y: 0,
          toJSON: () => ({})
        })
      });
      expect(element).toBeVisibleInViewport();

      // Element is outside viewport
      Object.defineProperty(element, 'getBoundingClientRect', {
        value: () => ({
          top: -100,
          left: -100,
          bottom: -50,
          right: -50,
          width: 50,
          height: 50,
          x: -100,
          y: -100,
          toJSON: () => ({})
        })
      });
      expect(element).not.toBeVisibleInViewport();
    });
  });

  describe('Component Update', () => {
    it('should wait for component updates', async () => {
      let updated = false;
      setTimeout(() => { updated = true; }, 0);
      await waitForComponentUpdate();
      expect(updated).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('should simulate click', async () => {
      const onClick = jest.fn();
      element.addEventListener('click', onClick);
      await simulateUserInteraction(element, 'click');
      expect(onClick).toHaveBeenCalled();
    });

    it('should simulate hover', async () => {
      const onMouseEnter = jest.fn();
      element.addEventListener('mouseenter', onMouseEnter);
      await simulateUserInteraction(element, 'hover');
      expect(onMouseEnter).toHaveBeenCalled();
    });

    it('should simulate focus/blur', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      element.addEventListener('focus', onFocus);
      element.addEventListener('blur', onBlur);

      await simulateUserInteraction(element, 'focus');
      expect(document.activeElement).toBe(element);
      expect(onFocus).toHaveBeenCalled();

      await simulateUserInteraction(element, 'blur');
      expect(document.activeElement).not.toBe(element);
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Form Interactions', () => {
    it('should simulate typing', async () => {
      const input = document.createElement('input');
      const onChange = jest.fn();
      input.addEventListener('input', onChange);
      await simulateFormInteraction(input, 'test text');
      expect(input.value).toBe('test text');
      expect(onChange).toHaveBeenCalled();
    });

    it('should simulate keyboard events', async () => {
      const input = document.createElement('input');
      const onKeyDown = jest.fn();
      input.addEventListener('keydown', onKeyDown);
      await simulateKeyboardInteraction(input, 'Enter');
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should simulate drag and drop', async () => {
      const dragElement = document.createElement('div');
      const dropElement = document.createElement('div');
      const onDragStart = jest.fn();
      const onDrop = jest.fn();

      dragElement.addEventListener('dragstart', onDragStart);
      dropElement.addEventListener('drop', onDrop);

      await simulateDragAndDrop(dragElement, dropElement);
      expect(onDragStart).toHaveBeenCalled();
      expect(onDrop).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should simulate file upload', async () => {
      const input = document.createElement('input');
      input.type = 'file';
      const onChange = jest.fn();
      input.addEventListener('change', onChange);

      const files = [new File(['test'], 'test.txt', { type: 'text/plain' })];
      await simulateFileUpload(input, files);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Clipboard Operations', () => {
    it('should simulate clipboard operations', async () => {
      const onCopy = jest.fn();
      const onCut = jest.fn();
      const onPaste = jest.fn();

      element.addEventListener('copy', onCopy);
      element.addEventListener('cut', onCut);
      element.addEventListener('paste', onPaste);

      await simulateClipboardOperation(element, 'copy');
      expect(onCopy).toHaveBeenCalled();

      await simulateClipboardOperation(element, 'cut');
      expect(onCut).toHaveBeenCalled();

      await simulateClipboardOperation(element, 'paste');
      expect(onPaste).toHaveBeenCalled();
    });
  });

  describe('Scroll and Resize', () => {
    it('should simulate scroll', async () => {
      const scrollable = document.createElement('div');
      scrollable.style.height = '100px';
      scrollable.style.overflow = 'auto';
      const onScroll = jest.fn();
      scrollable.addEventListener('scroll', onScroll);

      await simulateScroll(scrollable, { top: 50 });
      expect(scrollable.scrollTop).toBe(50);
      expect(onScroll).toHaveBeenCalled();
    });

    it('should simulate resize', async () => {
      const onResize = jest.fn();
      window.addEventListener('resize', onResize);

      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      
      await simulateResize(800, 600);
      expect(window.innerWidth).toBe(800);
      expect(window.innerHeight).toBe(600);
      expect(onResize).toHaveBeenCalled();

      // Restore original dimensions
      await simulateResize(originalWidth, originalHeight);
    });
  });

  describe('Media Queries', () => {
    it('should simulate media query changes', () => {
      simulateMediaQuery('(min-width: 768px)', true);
      expect(window.matchMedia('(min-width: 768px)').matches).toBe(true);
      expect(window.matchMedia('(min-width: 1024px)').matches).toBe(false);
    });
  });
});