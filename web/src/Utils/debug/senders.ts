import { DebugSection } from '../../types/debug';

// TODO: Implement your debug actions
const SendDebuggers: DebugSection[] = [
  {
    label: 'Example Section',
    actions: [
      {
        type: 'button',
        label: 'Test Button',
        action: () => console.log('Button clicked'),
      },
      {
        type: 'text',
        label: 'Test Input',
        value: '',
        action: (value) => console.log('Text value:', value),
      },
      {
        type: 'checkbox',
        label: 'Test Checkbox',
        value: false,
        action: (value) => console.log('Checkbox value:', value),
      },
      {
        type: 'slider',
        label: 'Test Slider',
        value: 50,
        min: 0,
        max: 100,
        step: 1,
        action: (value) => console.log('Slider value:', value),
      },
    ],
  },
];

export default SendDebuggers;
