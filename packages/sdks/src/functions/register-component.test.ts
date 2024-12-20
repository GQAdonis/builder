import type { ComponentInfo } from '../types/components.js';
import {
  createRegisterComponentMessage,
  serializeIncludingFunctions,
} from './register-component.js';

describe('Component Registration and Serialization', () => {
  test('createRegisterComponentMessage creates correct message structure', () => {
    const mockComponentInfo: ComponentInfo = {
      name: 'TestComponent',
      inputs: [{ name: 'testInput', type: 'string' }],
      // Add other required fields as necessary
    };

    const result = createRegisterComponentMessage(mockComponentInfo);

    expect(result).toEqual({
      type: 'builder.registerComponent',
      data: expect.any(Object), // We'll test the data content separately
    });
  });

  test('serializeComponentInfo handles functions correctly', () => {
    const mockComponentInfo: ComponentInfo = {
      name: 'TestComponent',
      inputs: [{ name: 'testInput', type: 'string' }],
      hooks: {
        // eslint-disable-next-line
        onChange: function (value: string) {
          return value.toUpperCase();
        },
      },
      // Add other required fields as necessary
    };

    const result = serializeIncludingFunctions(mockComponentInfo);

    expect(result).toMatchSnapshot();
    expect(result.name).toBe('TestComponent');
    expect(result.inputs).toEqual([{ name: 'testInput', type: 'string' }]);
    expect(typeof result.hooks.onChange).toBe('string');
    expect(result.hooks.onChange).toContain('return value.toUpperCase();');
  });

  test('serializeComponentInfo handles arrow functions', () => {
    const mockComponentInfo: ComponentInfo = {
      name: 'ArrowComponent',
      inputs: [{ name: 'testInput', type: 'number' }],
      hooks: {
        onInit: (num: number) => num * 2,
      },
      // Add other required fields as necessary
    };

    const result = serializeIncludingFunctions(mockComponentInfo);

    expect(result).toMatchSnapshot();
    expect(typeof result.hooks.onInit).toBe('string');
    expect(result.hooks.onInit).toContain('num * 2');
  });

  test('serializeFn handles different function syntaxes', () => {
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const mockComponentInfo: ComponentInfo = {
      name: 'SyntaxTestComponent',
      inputs: [{ name: 'testInput', type: 'string' }],
      hooks: {
        func1: function namedFunction(x: number) {
          return x + 1;
        },
        func2: (x: number) => x * 2,
        func3(x: number) {
          return x - 1;
        },
        func4: fn,
      },
      // Add other required fields as necessary
    };

    const result = serializeIncludingFunctions(mockComponentInfo);

    expect(result).toMatchSnapshot();
  });
});
