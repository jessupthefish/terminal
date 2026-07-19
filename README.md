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
