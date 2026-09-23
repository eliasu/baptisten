import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/site.css', 'resources/js/site.ts'],
            refresh: true,
        }),
    ],
    server: {
        watch: {
            // Antlers' cache writes here; watching it causes reload loops.
            ignored: [
                '**/storage/framework/views/**',
                '**/storage/statamic/**',
            ],
        },
    },
});
