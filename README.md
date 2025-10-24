# SkillBridge Frontend

This is the frontend for my SkillBridge project. It's built using a monorepo setup with Expo (for mobile) and Next.js (for web).

## Tech in the project

- **Tamagui** - for styling components that work everywhere
- **Solito** - makes navigation work the same on web and mobile
- **Next.js** - handles the web side
- **Expo** - handles the mobile app
- **Expo Router** - for routing on mobile

This is based on a starter template by [@FernandoTheRojo](https://twitter.com/fernandotherojo). His [Next.js Conf talk](https://www.youtube.com/watch?v=0lnbdRweJtA) explains the concept really well if you're curious.

## How the Project is Organized

Here's how I've structured everything:

```
apps/
  expo/    - the mobile app
  next/    - the web app

packages/
  app/     - shared code between mobile and web
    features/  - organized by feature (not screens)
    provider/  - context providers and stuff
  ui/      - custom UI components using Tamagui
```

The cool thing is that most of the actual app logic lives in `packages/app` so I can share it between web and mobile.

## Getting Started

First time setup:

```sh
yarn
```

Running the web version locally:

```sh
yarn web
```

Running the mobile version (make sure you have Expo Go installed):

```sh
yarn native
```

There's also `yarn web:extract` if you want to test with the optimizer on, but honestly it's slower so I usually don't bother during development. For production builds use `yarn web:prod`.

**For regular JavaScript packages** (like date-fns or lodash):

```sh
cd packages/app
yarn add <package-name>
cd ../..
yarn
```

**For packages with native code** (like react-native-reanimated):

```sh
cd apps/expo
yarn add <package-name>
cd ../..
yarn
```

The key thing is native packages MUST go in the expo folder, otherwise the mobile app won't build.

## Updating Dependencies

Just run:

```sh
yarn upgrade-interactive
```

## UI Components

We are using Tamagui's design system approach, so all my custom components are in `packages/ui`. It's set up as `@my/ui` internally.

Check out the [Tamagui design systems guide](https://tamagui.dev/docs/guides/design-systems) if you want to understand this better.
