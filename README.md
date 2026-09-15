# MyMenu

MyMenu adds a persistent, customizable command toolbar to Obsidian. It works
with core commands and commands registered by community plugins, including Ask
AI and Todoist-Plug.

Requires Obsidian 1.13.0 or newer. MyMenu uses browser and Obsidian APIs only
and supports desktop and mobile, including iPadOS 17.6.

## Features

- Add, edit, remove, and reorder toolbar buttons in MyMenu settings.
- Choose any registered Obsidian command and any built-in Obsidian icon.
- Keep one shared configuration that horizontally scrolls on narrow screens.
- Move above the software keyboard and respect mobile safe-area insets.
- Preserve unavailable command slots until their source plugin returns.
- Adjust button size, spacing, and vertical offset.
- Hide or show the toolbar from settings or the command palette.

New installations include bold, italic, strikethrough, underline, superscript,
subscript, inline code, fenced code block, and blockquote buttons. Every default
can be changed or removed.

## Development

Requires Node.js 24 or newer and pnpm.

```sh
pnpm install
pnpm check
```

The project uses strict TypeScript, Biome, Vitest, Zod validation, esbuild, and
the release conventions used by Todoist-Plug.

## Installation for development

Run `pnpm build`, then copy `main.js`, `manifest.json`, and `styles.css` into
`<vault>/.obsidian/plugins/my-menu/`. Enable MyMenu under Community plugins.

## Releasing

`pnpm release`, `pnpm release minor`, or `pnpm release major` runs the full
check, synchronizes release metadata, creates a matching version tag, and
pushes it. The tag workflow publishes `main.js`, `manifest.json`, and
`styles.css` as GitHub release assets.

## Privacy

MyMenu runs locally. It makes no network requests and collects no telemetry.

## License

MIT
