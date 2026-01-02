import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';

const app = new Elysia();

// Styles static
app.use(
    staticPlugin({
        assets: './src/data',
        prefix: '',
    }),
);

app.listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
