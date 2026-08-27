# SwipyUI Workspace

Angular workspace for [`@swipergy/swipyui`](projects/swipergy/swipyui/README.md) — a UI component library with design-token based theming — and its showcase/documentation app.

**Live demo:** <https://www.swipergy.com/swipyui>

## Projects

- `projects/swipergy/swipyui` — the library, published to npm as `@swipergy/swipyui` ([styling manual](projects/swipergy/swipyui/STYLING.md))
- `projects/showcase` — documentation site with live demos

## Development

```bash
npm ci
ng serve showcase          # docs app at http://localhost:4200 (compiles library from source)
ng test @swipergy/swipyui  # unit tests (Vitest)
ng build @swipergy/swipyui # build the publishable package to dist/swipergy/swipyui
```

## License

MIT
