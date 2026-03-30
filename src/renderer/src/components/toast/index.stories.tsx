import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from '.'

const meta: Meta = {
  title: 'Components/Toast',
  decorators: [
    (Story) => (
      <Toast.Provider>
        <Story />
        <Toast.Viewport />
      </Toast.Provider>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta

type Story = StoryObj

export const Success: Story = {
  render: () => (
    <Toast.Root variant="success" open duration={Infinity}>
      <div className="grid gap-1">
        <Toast.Title>保存しました</Toast.Title>
        <Toast.Description>データが正常に保存されました。</Toast.Description>
      </div>
      <Toast.Close />
    </Toast.Root>
  )
}

export const Error: Story = {
  render: () => (
    <Toast.Root variant="error" open duration={Infinity}>
      <div className="grid gap-1">
        <Toast.Title>エラーが発生しました</Toast.Title>
        <Toast.Description>データの保存に失敗しました。再度お試しください。</Toast.Description>
      </div>
      <Toast.Close />
    </Toast.Root>
  )
}
