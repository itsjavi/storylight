import React, { useEffect, useState } from 'react'

import {
  SLAddonsMap,
  SLAppComponentProps,
  SLNativeType,
  SLParameters,
  StoryMeta,
  StoryModulesMap,
} from '../..'
import {
  getDefaultToolbarAddons,
  getToolbarAddonsAsParameters,
  resolveToolbarAddons,
} from '../../components/toolbar/getToolbarAddons'
import {
  CrossDocumentMessage,
  CrossDocumentMessageSource,
  CrossDocumentMessageType,
  registerWindowMessageListener,
  sendWindowMessage,
} from '../../services/messenger'
import { useParams, useSearchParamsMap } from '../../services/router/router.state'
import { getLocalStorageItem, setLocalStorageItem } from '../../services/storage/localStorage'

export const defaultConfig: SLAppComponentProps = {
  title: <> ⚡️ StoryLite</>,
  defaultStory: 'index',
}

export type StoryLiteStateContextType = {
  config?: SLAppComponentProps
  stories: StoryModulesMap
  iframeRef: HTMLIFrameElement | null
  setIframeRef: (element: HTMLIFrameElement | null) => void
  iframeLoadState: 'loading' | 'ready'
  isStandalone: boolean
  parameters: SLParameters
  setParameters: (parameters: SLParameters) => void
  setParameter: (name: string, value: SLNativeType) => void
  addons: SLAddonsMap
  currentStory:
    | {
        story: string | undefined
        exportName: string | undefined
        meta: StoryMeta
      }
    | undefined
}

type UseParamsReturnType = [
  SLParameters,
  (parameters: SLParameters, persist?: boolean) => void,
  (name: string, value: SLNativeType, persist?: boolean) => void,
]

const StoryLiteStateContext = React.createContext<StoryLiteStateContextType | undefined>(undefined)

export const useStoryLiteStateContext = () => {
  const context = React.useContext(StoryLiteStateContext)
  if (!context) {
    throw new Error('useStoryLiteDataContext must be used within a StoryLiteDataProvider')
  }

  return context
}

export const useStoryLiteState = (): Required<StoryLiteStateContextType> => {
  const { config, stories, ...rest } = useStoryLiteStateContext()
  const { story, export_name } = useParams()
  const storyMeta = story ? stories.get(story)?.meta : {}
  const searchParams = useSearchParamsMap()
  const isStandalone = searchParams.has('standalone')

  if (!config) {
    throw new Error(
      'useStoryLiteState must be used within a StoryLiteDataProvider. config is undefined.',
    )
  }

  return {
    ...rest,
    config,
    stories,
    isStandalone: isStandalone,
    currentStory: story ? { story, exportName: export_name, meta: storyMeta || {} } : undefined,
  }
}

export const useStoryLiteConfig = (): SLAppComponentProps => {
  const { config } = useStoryLiteState()

  return config
}

export const useStoryLiteStories = (): StoryModulesMap => {
  const { stories } = useStoryLiteState()

  return stories
}

const useParametersFromBrowserStorage = (
  defaultParams: SLParameters,
): [
  parameters: SLParameters,
  setParameters: (parameters: SLParameters, persist?: boolean) => void,
] => {
  const params = getLocalStorageItem<SLParameters>('sl_parameters', defaultParams)

  const setParams = (parameters: SLParameters) => {
    const merged = { ...defaultParams, ...parameters }
    setLocalStorageItem<SLParameters>('sl_parameters', merged)
  }

  const merged = { ...defaultParams, ...params }

  return [merged, setParams]
}

export const StoryLiteStateProvider = ({
  config,
  stories,
  children,
}: {
  config?: Partial<SLAppComponentProps>
  stories: StoryModulesMap
  children: React.ReactNode
}) => {
  const addons = resolveToolbarAddons(getDefaultToolbarAddons(), config?.addons)
  const mergedConfig: SLAppComponentProps = {
    ...defaultConfig,
    ...config,
    addons: Array.from(addons.entries()),
  }
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null)
  const [iframeState, setIframeState] = React.useState<'loading' | 'ready'>('loading')
  const [storeParams, storeSetParams] = useParametersFromBrowserStorage(
    getToolbarAddonsAsParameters(addons),
  )
  const [params, _setParams] = useState<SLParameters>(storeParams)

  const setParams = (newParams: SLParameters, persist: boolean = true) => {
    _setParams(newParams)
    if (persist) {
      storeSetParams(newParams)
    }
  }

  const setSingleParam = (name: string, value: SLNativeType, persist: boolean = true) => {
    const newParams = {
      ...params,
      [name]: {
        value,
      },
    }
    setParams(newParams, persist)
  }

  const iframeWindowMessageHandler = (message: CrossDocumentMessage) => {
    // here is where the iframe processes messages from the root
    if (message.type === CrossDocumentMessageType.UpdateParameters) {
      setParams(message.payload, false)
    }
  }

  useEffect(() => {
    const handleIframeLoad = () => {
      setIframeState('ready')
    }

    if (iframeRef) {
      iframeRef.addEventListener('load', handleIframeLoad)
    }

    return () => {
      if (iframeRef) {
        iframeRef.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [])

  useEffect(() => {
    if (iframeRef?.contentWindow) {
      // send a message to the iframe window, and tell it to update the parameters in its context
      sendWindowMessage(
        {
          type: CrossDocumentMessageType.UpdateParameters,
          payload: params,
        },
        CrossDocumentMessageSource.Root,
        iframeRef.contentWindow,
      )
    }
  }, [iframeRef, iframeState, params])

  // If we receive a message from the root, it means we are in an iframe
  registerWindowMessageListener(iframeWindowMessageHandler, CrossDocumentMessageSource.Root, window)

  return (
    <StoryLiteStateContext.Provider
      value={{
        config: mergedConfig,
        addons,
        stories,
        currentStory: undefined,
        isStandalone: false,
        iframeRef,
        iframeLoadState: iframeState,
        setIframeRef,
        parameters: params,
        setParameters: setParams,
        setParameter: setSingleParam,
      }}
    >
      {children}
    </StoryLiteStateContext.Provider>
  )
}

export const useStoryLiteAddons = (): SLAddonsMap => {
  const { addons } = useStoryLiteState()

  return addons
}

export const useStoryLiteParameters = (): UseParamsReturnType => {
  const { parameters, setParameters, setParameter } = useStoryLiteState()

  return [parameters, setParameters, setParameter]
}

export const useStoryLiteCurrentStory = (): {
  story: string | undefined
  exportName: string | undefined
  meta: StoryMeta
} => {
  const { currentStory } = useStoryLiteState()

  return currentStory || { story: undefined, exportName: undefined, meta: {} }
}

export const useStoryLiteIframe = (): {
  iframe: HTMLIFrameElement | null
  loaded: boolean
  setIframe: (element: HTMLIFrameElement | null) => void
  window: Window | null
  document: Document | null
} => {
  const { iframeRef, iframeLoadState, setIframeRef } = useStoryLiteState()
  const win = iframeRef?.contentWindow ?? null
  const doc = iframeRef?.contentDocument ?? iframeRef?.contentWindow?.document ?? null

  return {
    iframe: iframeRef,
    setIframe: setIframeRef,
    loaded: iframeLoadState === 'ready',
    window: win,
    document: doc,
  }
}
