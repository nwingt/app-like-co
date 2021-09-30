// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'LoadingIndicator',
  argTypes: {
    value: {
      type: {
        name: 'number',
        required: false,
      },
      defaultValue: 0,
      description: 'Progress of the loading',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: {
          summary: '0',
        },
      },
      control: {
        type: 'number',
      },
    },
    isIntermediate: {
      type: {
        name: 'boolean',
        required: false,
      },
      defaultValue: false,
      description: 'Show intermediate loading',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: false,
        },
      },
      control: {
        type: 'boolean',
      },
    },
  },
  decorators: [() => ({ template: `<div class="flex justify-start"><story/></div>` })],
}

const Template: Story = (
  _args: any,
  {
    argTypes,
  }: any,
) => ({
  props: Object.keys(argTypes),
  template: `
    <LoadingIndicator v-bind="$props" />
  `,
})

export const Default = Template.bind({})
