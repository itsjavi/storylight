export * from './components'
export * from './config'
export * from './core'
export * from './legacy'
export * from './modules'
export * from './parameters'
export * from './story'
export * from './ui'

/*
The new version of the API, provides a set of interoperable features with Storybook,
such as: decorators, args, parameters, play function, loaders, and more.
*/

// /**
//  * StoryLite Story Metadata object for default exports.
//  * It has additional properties
//  */
// export type StoryDefault<P extends SLObject = {}> = Story<P> & {}

// split string by '/' if it is not followed by another '/'
// const splitPath = (path: string) => path.split(/\/(?!\/)/g)

// // replace all '//' with '/'
// const normalizePathSegment = (path: string) => path.replace(/\/\//g, '/')

// The exported identifiers will be converted to "start case" using Lodash's startCase function. For example:
// export const myComponent = () => <MyComponent />
// will be converted to:
// My Component
