# stevenjessup.com

My interactive terminal-style resume, live at [stevenjessup.com](https://stevenjessup.com).

Type `help` in the terminal to see what it can do — there are a few things `help` won't tell you.

## Stack

- [Svelte 4](https://svelte.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Based on [m4tt72/terminal](https://github.com/m4tt72/terminal) (MIT), heavily customized.

## Development

```bash
npm install
npm run dev      # dev server
npm run check    # type-check (svelte-check)
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Deploy

`npm run build`, then upload the contents of `dist/` to the web host.

## Font credits

The `machine` command's classic-computer modes use these fonts (see `public/fonts/`):

- **Pet Me 64** (Commodore 64) and **Print Char 21** (Apple II) by [Kreative Korp](https://www.kreativekorp.com/software/fonts/), Kreative Software Relay Fonts Free Use License (`LICENSE-KreativeKorp.txt`).
- **Web437 IBM VGA 8x16** (MS-DOS) from [The Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/) by VileR, CC BY-SA 4.0 (`LICENSE-Oldschool-PC-Fonts.txt`).
- **Glass TTY VT220** (amber terminal) by [Viacheslav Slavinsky](https://github.com/svofski/glasstty), free.
- **Cascadia Code** (linux mode) by Microsoft, SIL OFL.

The `phosphor`, `sony`, and `tv` CRT styles use overlay textures from a community RetroArch overlay pack (`public/overlays/`).
