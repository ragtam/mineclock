declare module '*.svelte' {
  import { ComponentType } from 'svelte'
  const component: ComponentType
  export default component
}

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
