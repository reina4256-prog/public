(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordVoiceEffects = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // The dry voice remains present so words stay intelligible.
    const presets = {
        robot: { high: 230, low: 3900, ring: 38, depth: .24, echo: .025, wet: .13 },
        spirit: { high: 100, low: 10000, echo: .12, wet: .22 },
        seed: { high: 110, low: 6800, echo: .035, wet: .08 },
        ghost: { high: 180, low: 7200, echo: .17, wet: .24 },
        stone: { high: 70, low: 3200, bass: 4, echo: .055, wet: .16 },
        magician: { high: 100, low: 8500, echo: .085, wet: .18 },
        beetle: { high: 280, low: 5500, ring: 65, depth: .12, echo: .02, wet: .08 },
        balloon: { high: 160, low: 9500, echo: .075, wet: .13 },
        bird: { high: 300, low: 11000, echo: .028, wet: .1 },
        machine: { high: 330, low: 3000, ring: 52, depth: .3, echo: .018, wet: .16 },
        dragon: { high: 65, low: 4200, bass: 5, echo: .08, wet: .19 }
    };
    const clamp = (value, min, max, fallback) => typeof value === 'number' && Number.isFinite(value)
        ? Math.max(min, Math.min(max, value)) : fallback;
    function create(host) {
        const Context = host.AudioContext || host.webkitAudioContext;
        let context, current = null;
        function prepare() {
            if (!Context) return Promise.reject(new Error('unsupportedOutput'));
            if (!context || context.state === 'closed') context = new Context();
            return context.state === 'suspended' ? context.resume() : Promise.resolve();
        }
        function stop() {
            const run = current; current = null;
            if (!run) return;
            clearTimeout(run.timer);
            for (const source of run.sources) { try { source.stop(); } catch (_) { /* ended */ } }
            for (const node of run.nodes) node.disconnect();
        }
        async function decode(data) { await prepare(); return context.decodeAudioData(data); }
        function play(buffer, settings = {}) {
            if (!context || context.state !== 'running') throw new Error('unsupportedOutput');
            stop();
            const run = { nodes: [], sources: [], timer: null }; current = run;
            const track = node => { run.nodes.push(node); return node; };
            try {
                const source = track(context.createBufferSource()); source.buffer = buffer; run.sources.push(source);
                const volume = track(context.createGain()); volume.gain.value = clamp(settings.volume, 0, 1, .8);
                const compressor = track(context.createDynamicsCompressor());
                compressor.threshold.value = -8; compressor.knee.value = 12; compressor.ratio.value = 4;
                compressor.connect(volume); volume.connect(context.destination);
                const amount = clamp(settings.amount, 0, 1, .65), preset = presets[settings.species];
                let tail = 0;
                if (preset && amount > 0) {
                    const dry = track(context.createGain()); dry.gain.value = 1 - amount * .55;
                    source.connect(dry); dry.connect(compressor);
                    const high = track(context.createBiquadFilter()); high.type = 'highpass'; high.frequency.value = preset.high;
                    const low = track(context.createBiquadFilter()); low.type = 'lowpass'; low.frequency.value = preset.low;
                    source.connect(high); high.connect(low);
                    let last = low;
                    if (preset.bass) {
                        const bass = track(context.createBiquadFilter()); bass.type = 'lowshelf';
                        bass.frequency.value = 260; bass.gain.value = preset.bass; last.connect(bass); last = bass;
                    }
                    if (preset.ring) {
                        const modulation = track(context.createGain()); modulation.gain.value = 1 - preset.depth;
                        const oscillator = track(context.createOscillator()); oscillator.frequency.value = preset.ring;
                        const depth = track(context.createGain()); depth.gain.value = preset.depth;
                        oscillator.connect(depth); depth.connect(modulation.gain); last.connect(modulation);
                        run.sources.push(oscillator); oscillator.start(); last = modulation;
                    }
                    const wet = track(context.createGain()); wet.gain.value = amount * .55;
                    last.connect(wet); wet.connect(compressor);
                    // Finite taps: no feedback loop; stopping also removes all echoes.
                    for (let i = 1; i <= 3; i++) {
                        const delay = track(context.createDelay(1)); delay.delayTime.value = preset.echo * i;
                        const gain = track(context.createGain()); gain.gain.value = amount * preset.wet / (i * i);
                        last.connect(delay); delay.connect(gain); gain.connect(compressor);
                    }
                    tail = preset.echo * 3;
                } else source.connect(compressor);
                source.start();
                run.timer = setTimeout(() => { if (current === run) stop(); }, (buffer.duration + tail + .1) * 1000);
                return { duration: buffer.duration + tail };
            } catch (error) { stop(); throw error; }
        }
        return { prepare, decode, play, stop, supported: !!Context };
    }
    return { create, presets };
});
