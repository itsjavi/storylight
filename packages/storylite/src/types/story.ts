import { SLComponentProps, SLFunctionComponent, SLNode } from './components'
import { SLParameters, SLParametersConfig } from './parameters'

export type SLContext<P extends SLFunctionComponent = SLFunctionComponent<{}>> = {
  /**
   * The component configuration.
   */
  meta: Story<P>
  /**
   * The args for the component, with any overrides from the user in the UI.
   */
  args: SLComponentProps<P>
  /**
   * The parameter values, with any overrides from the user in the UI.
   */
  parameters: SLParameters
  /**
   * A map containing all data (merged), loaded asynchronously by the configured data loaders.
   */
  loaded: {
    [key: string]: any
  }
}

export type SLDecorator<P extends SLFunctionComponent = SLFunctionComponent<{}>> = (
  story: P,
  context: SLDecoratorContext<P>,
) => SLNode
export type SLDecoratorContext<P extends SLFunctionComponent = SLFunctionComponent<{}>> = Omit<
  Story<P>,
  'decorators'
>

export type SLRenderedContext<P extends SLFunctionComponent = SLFunctionComponent<{}>> =
  SLContext<P> & {
    /**
     * The DOM element that contains the rendered component.
     */
    canvasElement: HTMLElement
  }

/**
 * StoryLite Story Metadata object, *almost fully* compatible
 * with Storybook Component Story Format (CSF) version 3.
 *
 * The default export defines metadata about your component, including the component itself,
 * its title (where it will show up in the navigation UI story hierarchy), decorators,
 * and parameters.
 *
 * All exported stories will inherit the metadata defined in this default export.
 *
 * The component field is required and used by addons for automatic prop table generation
 * and display of other component metadata. The title field is optional and should be
 * unique (i.e., not re-used across files).
 *
 * StoryLite will always use the named export to determine the story ID and URL,
 * the `title` and `name` fields are optional and will be inferred from the named export
 * if not specified.
 */
export interface Story<P extends SLFunctionComponent = SLFunctionComponent<{}>> {
  // /**
  //  * Unique id for the story.
  //  */
  // id: string
  /**
   * Title and path of the story in the navigation UI.
   * You can use "/" to organize stories into nested groups, if you provide a string.
   *
   * If not specified, defaults to the named export and the inferred path from the file name.
   */
  title?: string
  /**
   * Display name of the component in the UI.
   *
   * If not specified, the last segment of the `title` will be used as a fallback.
   */
  name?: string
  /**
   * Component to render the story.
   */
  component?: P
  /**
   * Properties to pass to the component. The will show up in the UI knobs.
   */
  args?: SLComponentProps<P>
  /**
   * Controls the display of knobs for the component.
   */
  //👨🏻‍💻 TODO:    argTypes?: SLArgTypes<P>
  /**
   * Parameters used to control the behaviour of StoryLite features and addons.
   */
  parameters?: SLParametersConfig
  /**
   * Decorators to wrap the story in.
   */
  decorators?: SLDecorator<P>[]
  /**
   * Asynchronous functions which provide data for a story, through the render context.
   *
   * All loaders, defined at all levels that apply to a story, run before the story renders
   * in StoryLite's canvas.
   *
   * - They run in parallel
   * - All results are the loaded field in the story context
   * - If there are keys that overlap, the keys defined in the story's loaders take precedence.
   */
  //👨🏻‍💻 TODO:    loaders?: ((context: SLContext<P>) => Promise<SLObject> | SLObject)[]
  /**
   * Define a custom render function for the story(ies). If not passed,
   * the default render function of the framework will be used.
   */
  render?: (args: SLComponentProps<P>, context: SLContext<P>) => SLNode
  /**
   * Function to execute after the story is rendered.
   */
  //👨🏻‍💻 TODO:    play?: (context: SLRenderedContext<P>) => Promise<void> | void
  /**
   * SideBar options.
   *
   * This property is not inherited by the named story exports, when defined in the default export.
   */
  navigation?: {
    /**
     * Icon for the story in the SideBar.
     * The `iconExpanded` icon is only used when the story has other nested stories.
     */
    icon?: SLNode
    iconExpanded?: SLNode
    /**
     * Sorting order of the story in the SideBar.
     */
    order?: number

    /**
     * If true, the story will be hidden in the SideBar.
     * Useful for stories that are not intended to be directly accessible.
     *
     * @default false
     */
    hidden?: boolean
  }
}

export interface StoryWithId<P extends SLFunctionComponent = SLFunctionComponent<{}>>
  extends Story<P> {
  id: string
}

export type StoryMap = Map<string, StoryWithId>
export type StoryModuleMap = Map<
  string,
  {
    [key: string]: StoryWithId<SLFunctionComponent<any>>
  }
>
