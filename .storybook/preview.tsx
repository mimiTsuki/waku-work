import type { Preview } from '@storybook/react-vite'
import '../src/renderer/src/assets/main.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    backgrounds: {
      options: {
        light: { name: 'light', value: 'oklch(92.2% 0.005 34.3)' },
        dark: { name: 'dark', value: 'oklch(20.5% 0 0)' }
      }
    },

    a11y: {
      test: 'todo'
    }
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.backgrounds?.value === 'dark'
      const html = document.documentElement
      if (isDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }

      return <Story />
    }
  ],

  initialGlobals: {
    backgrounds: { value: 'light' }
  }
}

export default preview
