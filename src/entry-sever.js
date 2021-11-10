import createApp from './entry.js';

export default function() {
    const { app } = createApp();
    return {
        app
    };
}
