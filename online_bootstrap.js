// Do not even request the Firebase module graph in an offline build.
if (window.GameRelease.online) await import('./cloud_manager.js');
