import './style.css'
import {Application} from "pixi.js";
import {createSpinnerExample} from "./service/service.ts";

async function initPixiApp() {
    const app = new Application();
    await app.init({
        resizeTo: window,
        autoDensity: true,
        background: '#242424',
        antialias: true,
    });

    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.prepend(app.canvas);
    } else {
        document.body.appendChild(app.canvas);
    }

    await createSpinnerExample(app);
}

initPixiApp().catch((err) => {
    console.error("PixiJS initialization failed:", err);
});
