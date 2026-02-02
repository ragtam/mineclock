import WakeWordOverlay from './WakeWordOverlay.svelte';

export default {
  title: 'Components/WakeWordOverlay',
  component: WakeWordOverlay,
  tags: ['autodocs'],
};

export const Hidden = {
  args: {
    isVisible: false,
  },
};

export const Visible = {
  args: {
    isVisible: true,
  },
};
