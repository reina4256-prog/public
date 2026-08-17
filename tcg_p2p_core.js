// ==========================================
// カジノTCG リアルタイムP2P対戦
// Firebase RTDBは待ち合わせだけに使い、開始後はWebRTCフルメッシュへ移行する。
// ==========================================
(function () {
    'use strict';

    const DATABASE_URL = 'https://ai-pet-game-default-rtdb.asia-southeast1.firebasedatabase.app';
    const DATABASE_MODULE_URL = 'https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js';
    const ROOM_ROOT = 'tcg_p2p_rooms';
    const PROTOCOL_VERSION = 1;
    const ROOM_TTL_MS = 20 * 60 * 1000;
    const TURN_LIMIT_MS = 60 * 1000;
    const INTERRUPT_LIMIT_MS = 15 * 1000;
    const CHUNK_SIZE = 4000;
    const ICE_SERVERS = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ];

    const net = {
        api: null,
        db: null,
        session: null,
        peerId: '',
        roomCode: '',
        roomRef: null,
        isCreator: false,
        hostPeerId: '',
        members: {},
        peers: new Map(),
        unsubs: [],
        lobby: null,
        started: false,
        signalingClosed: false,
        snapshotTimer: null,
        turnTimer: null,
        interruptTimer: null,
        clockTimer: null,
        lastStableSnapshot: null,
        chunks: new Map(),
        resultRecorded: false,
        closed: false
    };

    const esc = value => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    function alertGame(message) {
        if (typeof window.showGameAlert === 'function') window.showGameAlert(message);
        else alert(message);
    }

    function dealerMastered() {
        const apprentice = window.aiPet && window.aiPet.apprentice || {};
        return Number(apprentice.rank && apprentice.rank.dealer) >= 10 || !!(apprentice.retired && apprentice.retired.dealer);
    }

    function playableDeckIndexes() {
        if (typeof window.getCasinoTCGPlayableDeckIndexes === 'function') return window.getCasinoTCGPlayableDeckIndexes();
        return [0, 1, 2].filter(index => window.TCG && window.TCG.decks && typeof window.isTCGPlayableDeck === 'function' && window.isTCGPlayableDeck(window.TCG.decks[index] || []));
    }

    function deckPayload(index) {
        const ids = window.TCG && window.TCG.decks ? window.TCG.decks[index] || [] : [];
        const cards = ids.map(uid => window.TCG.myCollection.find(card => card && card.uid === uid)).filter(Boolean).map(card => JSON.parse(JSON.stringify(card)));
        return cards.length === 60 ? cards : [];
    }

    function cpuCandidates() {
        const list = typeof window.getCasinoTCGOnlineCpuCandidates === 'function' ? window.getCasinoTCGOnlineCpuCandidates() : [];
        if (list.length) return list;
        return [{ id: 'dealer', kind: 'master', masterType: 'dealer', name: 'ディーラー', isResidentDealer: true }];
    }

    function actorIds(mode) { return mode === 'single' ? ['player', 'enemy1'] : ['player', 'ally', 'enemy1', 'enemy2']; }
    function seatLabel(mode, actorId) {
        const labels = mode === 'single'
            ? { player: 'プレイヤー1', enemy1: 'プレイヤー2' }
            : { player: 'チームA・先鋒', ally: 'チームA・次鋒', enemy1: 'チームB・先鋒', enemy2: 'チームB・次鋒' };
        return labels[actorId] || actorId;
    }
    function roomPath(suffix) { return `${ROOM_ROOT}/${net.roomCode}${suffix ? `/${suffix}` : ''}`; }
    function memberName() { return localStorage.getItem('my_player_name') || (window.aiPet && window.aiPet.name) || 'ゲスト'; }
    function randomId(length) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const bytes = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
        else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
        return Array.from(bytes, value => chars[value % chars.length]).join('');
    }

    async function loadDatabase() {
        if (typeof window.ensureP2PMatchmakingSession !== 'function' || typeof window.getFirebaseAppForP2P !== 'function') {
            throw new Error('Firebase認証の初期化が完了していません。');
        }
        net.session = await window.ensureP2PMatchmakingSession();
        if (net.api && net.db) {
            net.api.goOnline(net.db);
            return net.api;
        }
        net.api = await import(DATABASE_MODULE_URL);
        net.db = net.api.getDatabase(window.getFirebaseAppForP2P(), DATABASE_URL);
        net.api.goOnline(net.db);
        if (!net.peerId) net.peerId = `${net.session.uid}_${randomId(6).toLowerCase()}`;
        return net.api;
    }

    function closeDialogs() {
        ['casino-tcg-online-menu', 'casino-tcg-online-lobby'].forEach(id => {
            const node = document.getElementById(id);
            if (node) node.remove();
        });
    }

    function style() {
        return `<style>
            .ctp-overlay{position:fixed;inset:0;z-index:46000;display:grid;place-items:center;padding:20px;box-sizing:border-box;background:rgba(0,0,0,.86);backdrop-filter:blur(6px);color:#fff;font-family:system-ui,sans-serif}.ctp-panel{width:min(960px,96vw);max-height:92vh;overflow:auto;padding:22px;box-sizing:border-box;border:2px solid #65d9e8;border-radius:18px;background:radial-gradient(circle at 50% 0,rgba(42,90,118,.5),transparent 45%),linear-gradient(145deg,#12182a,#080a10);box-shadow:0 25px 80px #000}.ctp-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid #31535d}.ctp-head h2{margin:0;color:#9ff5ff}.ctp-head small{display:block;color:#8aaab5;letter-spacing:.18em}.ctp-btn{border:1px solid #79dce8;border-radius:9px;padding:10px 15px;background:#183c49;color:#fff;font-weight:800;cursor:pointer}.ctp-btn:disabled{opacity:.35;cursor:not-allowed}.ctp-btn.is-main{background:linear-gradient(#0b9eb4,#075d70);font-size:16px}.ctp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:17px}.ctp-card{padding:18px;border:1px solid #345d68;border-radius:13px;background:rgba(16,35,46,.8)}.ctp-card h3{margin:0 0 9px;color:#bff8ff}.ctp-input,.ctp-select{width:100%;box-sizing:border-box;margin:7px 0;padding:10px;border:1px solid #517780;border-radius:7px;background:#080e14;color:#fff}.ctp-code{font:900 32px Georgia,serif;letter-spacing:.18em;color:#ffe37b}.ctp-status{margin:12px 0;padding:10px;border-left:3px solid #65d9e8;background:rgba(101,217,232,.08);color:#c5dce1;font-size:12px;line-height:1.6}.ctp-seats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:14px 0}.ctp-seat{padding:11px;border:1px solid #3d5968;border-radius:10px;background:rgba(8,18,27,.82)}.ctp-seat.is-local{border-color:#ffe174;box-shadow:0 0 12px rgba(255,225,116,.18)}.ctp-seat strong{display:block;color:#eafcff}.ctp-seat small{color:#7fa0ae}.ctp-ready{color:#7cf397}.ctp-wait{color:#ffcf77}.ctp-actions{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px}.ctp-error{color:#ff8989;white-space:pre-line}.ctp-mesh{display:flex;gap:6px;flex-wrap:wrap}.ctp-dot{padding:3px 7px;border-radius:999px;background:#372d20;color:#ffd38b;font-size:10px}.ctp-dot.is-open{background:#123e2c;color:#8ff3b6}@media(max-width:700px){.ctp-grid,.ctp-seats{grid-template-columns:1fr}.ctp-panel{padding:14px}.ctp-code{font-size:25px}}
        </style>`;
    }

    function createOverlay(id, html) {
        const old = document.getElementById(id); if (old) old.remove();
        const root = document.createElement('div'); root.id = id; root.className = 'ctp-overlay';
        root.innerHTML = `${style()}${html}`;
        document.body.appendChild(root);
        return root;
    }

    window.openCasinoTCGOnlineMenu = function () {
        if (!dealerMastered()) return false;
        if (!playableDeckIndexes().length) { alertGame('オンライン対戦には保存済みの60枚デッキが必要です。'); return false; }
        closeDialogs();
        createOverlay('casino-tcg-online-menu', `<div class="ctp-panel"><header class="ctp-head"><span><small>REALTIME CARD LOUNGE</small><h2>オンライン対戦</h2></span><button class="ctp-btn" onclick="window.closeCasinoTCGOnlineMenu()">× 閉じる</button></header><div class="ctp-grid"><section class="ctp-card"><h3>部屋を作る</h3><p>シングル戦またはタッグ戦を選び、ルームコードを友人へ伝えます。</p><select id="ctp-create-mode" class="ctp-select"><option value="single">シングル戦（1～2人）</option><option value="tag">タッグ戦（1～4人）</option></select><button class="ctp-btn is-main" onclick="window.createCasinoTCGOnlineRoom()">ルームを作成</button></section><section class="ctp-card"><h3>コードで参加</h3><p>フレンド登録や通常ログインは不要です。</p><input id="ctp-room-code" class="ctp-input" maxlength="6" autocomplete="off" placeholder="6文字のコード"><button class="ctp-btn is-main" onclick="window.joinCasinoTCGOnlineRoom()">参加する</button></section></div><div id="ctp-menu-status" class="ctp-status">接続操作を行うまでFirebase通信は開始しません。匿名認証を利用できます。</div></div>`);
        return true;
    };

    window.closeCasinoTCGOnlineMenu = async function () {
        await cleanupNetwork(true);
        closeDialogs();
        if (typeof window.openCasinoTCGMenu === 'function') window.openCasinoTCGMenu();
    };

    function setMenuStatus(message, error) {
        const node = document.getElementById('ctp-menu-status');
        if (node) { node.textContent = message; node.classList.toggle('ctp-error', !!error); }
    }

    function freshLobby(mode) {
        const fallback = cpuCandidates()[0];
        const seats = {};
        actorIds(mode).forEach(actorId => {
            seats[actorId] = { actorId, kind: 'cpu', name: fallback.name, masterType: fallback.masterType, fallbackCpu: fallback };
        });
        return { version: 1, mode, hostPeerId: net.peerId, seats, ready: {}, decks: {}, cpuCandidates: cpuCandidates(), revision: 1 };
    }

    async function registerMember() {
        const api = net.api;
        const memberRef = api.ref(net.db, roomPath(`members/${net.peerId}`));
        await api.set(memberRef, { name: memberName(), joinedAt: Date.now(), protocol: PROTOCOL_VERSION });
        try { await api.onDisconnect(memberRef).remove(); } catch (error) { console.warn('onDisconnect設定失敗', error); }
    }

    window.createCasinoTCGOnlineRoom = async function () {
        const modeNode = document.getElementById('ctp-create-mode');
        const mode = modeNode && modeNode.value === 'tag' ? 'tag' : 'single';
        setMenuStatus('匿名セッションと待ち合わせルームを準備しています…');
        try {
            await cleanupNetwork(false);
            await loadDatabase();
            net.closed = false;
            net.isCreator = true;
            net.hostPeerId = net.peerId;
            net.roomCode = randomId(6);
            net.roomRef = net.api.ref(net.db, roomPath());
            net.lobby = freshLobby(mode);
            await net.api.set(net.roomRef, { meta: { protocol: PROTOCOL_VERSION, mode, hostPeerId: net.peerId, status: 'lobby', createdAt: Date.now(), expiresAt: Date.now() + ROOM_TTL_MS } });
            try { await net.api.onDisconnect(net.roomRef).remove(); } catch (error) { console.warn('ルーム自動削除の設定失敗', error); }
            await registerMember();
            installRoomListeners();
            renderLobby();
        } catch (error) {
            console.error('P2Pルーム作成エラー', error);
            await cleanupNetwork(true);
            setMenuStatus(`ルームを作成できませんでした。\n${friendlyError(error)}`, true);
        }
    };

    window.joinCasinoTCGOnlineRoom = async function () {
        const input = document.getElementById('ctp-room-code');
        const code = String(input && input.value || '').trim().toUpperCase().replace(/[^A-Z2-9]/g, '');
        if (code.length !== 6) { setMenuStatus('6文字のルームコードを入力してください。', true); return; }
        setMenuStatus('ルームを確認しています…');
        try {
            await cleanupNetwork(false);
            await loadDatabase();
            net.closed = false;
            net.roomCode = code;
            net.roomRef = net.api.ref(net.db, roomPath());
            const snap = await net.api.get(net.roomRef);
            const room = snap.val();
            if (!room || !room.meta) throw new Error('ルームが見つかりません。');
            if (Number(room.meta.expiresAt || 0) < Date.now()) throw new Error('このルームは期限切れです。');
            if (room.meta.status !== 'lobby') throw new Error('このルームはすでに対戦を開始しています。');
            if (Number(room.meta.protocol) !== PROTOCOL_VERSION) throw new Error('ゲームの通信バージョンが一致しません。');
            if (!room.members || !room.members[room.meta.hostPeerId]) throw new Error('ルーム作成者が退出しています。');
            const memberCount = Object.keys(room.members || {}).length;
            const maximum = room.meta.mode === 'tag' ? 4 : 2;
            if (memberCount >= maximum) throw new Error('ルームは満員です。');
            net.isCreator = false;
            net.hostPeerId = room.meta.hostPeerId;
            net.lobby = freshLobby(room.meta.mode);
            net.lobby.hostPeerId = net.hostPeerId;
            await registerMember();
            installRoomListeners();
            renderLobby();
        } catch (error) {
            console.error('P2Pルーム参加エラー', error);
            await cleanupNetwork(true);
            setMenuStatus(friendlyError(error), true);
        }
    };

    function friendlyError(error) {
        const text = error && error.message ? error.message : String(error || '不明なエラー');
        if (/permission|PERMISSION_DENIED/i.test(text)) return 'Realtime Databaseの匿名認証またはルールを確認してください。';
        return text;
    }

    function installRoomListeners() {
        const api = net.api;
        net.unsubs.push(api.onValue(api.ref(net.db, roomPath('members')), snap => {
            if (net.signalingClosed) return;
            const previous = net.members;
            net.members = snap.val() || {};
            Object.keys(net.members).filter(id => id !== net.peerId).forEach(ensurePeerConnection);
            if (net.isCreator) syncHumanSeats();
            Object.keys(previous).filter(id => !net.members[id]).forEach(id => schedulePeerDisconnect(id));
            renderLobby();
        }));
        net.unsubs.push(api.onValue(api.ref(net.db, roomPath(`signals/${net.peerId}`)), snap => {
            if (!net.signalingClosed) processSignals(snap.val() || {});
        }));
    }

    function peerRecord(remoteId) {
        let record = net.peers.get(remoteId);
        if (record) return record;
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        record = { id: remoteId, pc, channel: null, open: false, offered: false, answered: false, seenCandidates: new Set(), remoteDescriptionSet: false, pendingCandidates: [] };
        net.peers.set(remoteId, record);
        pc.onicecandidate = event => {
            if (!event.candidate || net.signalingClosed || !net.api) return;
            const payload = { candidate: event.candidate.candidate, sdpMid: event.candidate.sdpMid, sdpMLineIndex: event.candidate.sdpMLineIndex };
            net.api.push(net.api.ref(net.db, roomPath(`signals/${remoteId}/${net.peerId}/candidates`)), payload).catch(console.warn);
        };
        pc.ondatachannel = event => attachChannel(record, event.channel);
        pc.onconnectionstatechange = () => {
            if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) schedulePeerDisconnect(remoteId);
        };
        return record;
    }

    async function ensurePeerConnection(remoteId) {
        if (!remoteId || remoteId === net.peerId || net.closed) return;
        const record = peerRecord(remoteId);
        if (net.peerId < remoteId && !record.offered) {
            record.offered = true;
            attachChannel(record, record.pc.createDataChannel('tcg', { ordered: true }));
            try {
                const offer = await record.pc.createOffer();
                await record.pc.setLocalDescription(offer);
                await net.api.set(net.api.ref(net.db, roomPath(`signals/${remoteId}/${net.peerId}/offer`)), { type: offer.type, sdp: offer.sdp });
            } catch (error) { console.error('WebRTC offer失敗', error); }
        }
    }

    function attachChannel(record, channel) {
        record.channel = channel;
        channel.binaryType = 'arraybuffer';
        channel.onopen = () => {
            record.open = true;
            sendTo(record.id, { type: 'hello', peerId: net.peerId, name: memberName(), joinedAt: net.members[net.peerId] && net.members[net.peerId].joinedAt || Date.now(), deckIndex: playableDeckIndexes()[0], deck: deckPayload(playableDeckIndexes()[0]) });
            sendMeshStatus();
            if (net.isCreator) broadcastLobby();
            renderLobby();
        };
        channel.onmessage = event => receiveWire(record.id, String(event.data || ''));
        channel.onclose = () => { record.open = false; schedulePeerDisconnect(record.id); renderLobby(); };
        channel.onerror = error => console.warn('DataChannel error', error);
    }

    async function processSignals(signals) {
        for (const [senderId, signal] of Object.entries(signals)) {
            if (!senderId || senderId === net.peerId || !signal) continue;
            const record = peerRecord(senderId);
            try {
                if (signal.offer && !record.remoteDescriptionSet) {
                    record.remoteDescriptionSet = true;
                    await record.pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
                    for (const candidate of record.pendingCandidates.splice(0)) await record.pc.addIceCandidate(new RTCIceCandidate(candidate));
                    const answer = await record.pc.createAnswer();
                    await record.pc.setLocalDescription(answer);
                    await net.api.set(net.api.ref(net.db, roomPath(`signals/${senderId}/${net.peerId}/answer`)), { type: answer.type, sdp: answer.sdp });
                }
                if (signal.answer && !record.remoteDescriptionSet) {
                    record.remoteDescriptionSet = true;
                    await record.pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
                    for (const candidate of record.pendingCandidates.splice(0)) await record.pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                for (const [candidateId, candidate] of Object.entries(signal.candidates || {})) {
                    if (record.seenCandidates.has(candidateId)) continue;
                    record.seenCandidates.add(candidateId);
                    const iceCandidate = new RTCIceCandidate(candidate);
                    if (record.pc.remoteDescription) await record.pc.addIceCandidate(iceCandidate);
                    else record.pendingCandidates.push(iceCandidate);
                }
            } catch (error) { console.error('WebRTC signalingエラー:', senderId, error); }
        }
    }

    function encodeAndSend(channel, message) {
        if (!channel || channel.readyState !== 'open') return false;
        const json = JSON.stringify(message);
        try {
            if (json.length <= CHUNK_SIZE) { channel.send(json); return true; }
            const id = `${net.peerId}_${Date.now()}_${randomId(4)}`;
            const total = Math.ceil(json.length / CHUNK_SIZE);
            for (let index = 0; index < total; index++) channel.send(JSON.stringify({ type: '__chunk', id, index, total, data: json.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE) }));
            return true;
        } catch (error) {
            console.warn('DataChannel送信失敗', error);
            return false;
        }
    }

    function sendTo(peerId, message) {
        const record = net.peers.get(peerId);
        return !!(record && encodeAndSend(record.channel, message));
    }

    function broadcast(message, exceptId) {
        net.peers.forEach((record, peerId) => { if (peerId !== exceptId && record.open) encodeAndSend(record.channel, message); });
    }

    function receiveWire(fromId, wire) {
        let message;
        try { message = JSON.parse(wire); } catch (error) { return; }
        if (message.type === '__chunk') {
            const key = `${fromId}:${message.id}`;
            let holder = net.chunks.get(key);
            if (!holder) { holder = { parts: new Array(message.total), received: 0, createdAt: Date.now() }; net.chunks.set(key, holder); }
            if (holder.parts[message.index] == null) { holder.parts[message.index] = message.data; holder.received++; }
            if (holder.received === holder.parts.length) {
                net.chunks.delete(key);
                receiveWire(fromId, holder.parts.join(''));
            }
            return;
        }
        handleMessage(fromId, message);
    }

    function handleMessage(fromId, message) {
        if (!message || !message.type) return;
        if (message.type === 'hello') {
            if (net.isCreator || net.hostPeerId === net.peerId) {
                acceptHumanHello(fromId, message);
            }
            sendMeshStatus();
        } else if (message.type === 'mesh_status') {
            if (net.hostPeerId === net.peerId) {
                if (!net.lobby.mesh) net.lobby.mesh = {};
                net.lobby.mesh[fromId] = message.openPeers || [];
                broadcastLobby(); // 追加：参加者全員の画面を「接続完了」に更新させる
                renderLobby();
            }
        } else if (message.type === 'lobby') {
            if (fromId !== net.hostPeerId) return;
            net.lobby = message.lobby;
            renderLobby();
        } else if (message.type === 'ready') {
            if (net.hostPeerId !== net.peerId) return;
            const seat = seatForPeer(fromId);
            if (!seat || !Array.isArray(message.deck) || message.deck.length !== 60) return;
            net.lobby.decks[fromId] = message.deck;
            net.lobby.ready[fromId] = !!message.ready;
            net.lobby.revision++;
            broadcastLobby();
            renderLobby();
        } else if (message.type === 'start') {
            if (fromId !== net.hostPeerId) return;
            startReceivedBattle(message.setup, false);
        } else if (message.type === 'snapshot') {
            if (fromId !== net.hostPeerId || !message.snapshot) return;
            const localSeat = seatForPeer(net.peerId);
            if (!localSeat) return;
            closeDialogs();
            window.installCasinoTCGNetworkSnapshot(message.snapshot, localSeat.actorId, false);
            if (message.snapshot.isEnded) recordPvpResult(message.snapshot);
            if (!message.snapshot.isAnimating && !message.snapshot.networkDefense) net.lastStableSnapshot = message.snapshot;
            ensureClock();
        } else if (message.type === 'intent') {
            if (net.hostPeerId !== net.peerId) return;
            const seat = seatForPeer(fromId);
            if (!seat) return;
            window.applyCasinoTCGNetworkIntent(seat.actorId, Object.assign({}, message.intent, { controllerId: fromId }));
        } else if (message.type === 'host_migrated') {
            net.hostPeerId = message.hostPeerId;
            if (message.snapshot) {
                const localSeat = seatForPeer(net.peerId);
                if (localSeat) window.installCasinoTCGNetworkSnapshot(message.snapshot, localSeat.actorId, net.hostPeerId === net.peerId);
            }
        } else if (message.type === 'rematch_request') {
            if (net.hostPeerId === net.peerId) returnToLobby();
        } else if (message.type === 'return_lobby') {
            if (fromId !== net.hostPeerId) return;
            net.lobby = message.lobby;
            showLobbyFromBattle();
        } else if (message.type === 'close_match') {
            alertGame('対戦相手がオンライン対戦を終了しました。');
            cleanupNetwork(true).then(() => { if (typeof window.openCasinoTCGMenu === 'function') window.openCasinoTCGMenu(); });
        }
    }

    function acceptHumanHello(peerId, hello) {
        if (!net.lobby) return;
        let seat = seatForPeer(peerId);
        if (!seat) {
            seat = actorIds(net.lobby.mode).map(id => net.lobby.seats[id]).find(entry => entry.kind !== 'human');
            if (!seat) return;
            seat.kind = 'human'; seat.peerId = peerId; seat.name = hello.name || 'ゲスト'; seat.controllerId = peerId;
        }
        if (Array.isArray(hello.deck) && hello.deck.length === 60) net.lobby.decks[peerId] = hello.deck;
        net.lobby.ready[peerId] = false;
        net.lobby.revision++;
        broadcastLobby();
        renderLobby();
    }

    function syncHumanSeats() {
        if (!net.lobby || net.hostPeerId !== net.peerId) return;
        const ids = Object.keys(net.members).sort((a, b) => Number(net.members[a].joinedAt || 0) - Number(net.members[b].joinedAt || 0) || a.localeCompare(b));
        ids.forEach(peerId => {
            if (seatForPeer(peerId)) return;
            const empty = actorIds(net.lobby.mode).map(id => net.lobby.seats[id]).find(seat => seat.kind !== 'human');
            if (!empty) return;
            empty.kind = 'human'; empty.peerId = peerId; empty.controllerId = peerId; empty.name = net.members[peerId].name || 'ゲスト';
            net.lobby.ready[peerId] = false;
        });
        if (!net.lobby.decks[net.peerId]) net.lobby.decks[net.peerId] = deckPayload(playableDeckIndexes()[0]);
        net.lobby.revision++;
        broadcastLobby();
    }

    function seatForPeer(peerId) {
        return net.lobby && Object.values(net.lobby.seats || {}).find(seat => seat.kind === 'human' && seat.peerId === peerId) || null;
    }

    function broadcastLobby() {
        if (!net.lobby || net.hostPeerId !== net.peerId) return;
        broadcast({ type: 'lobby', lobby: net.lobby });
    }

    function sendMeshStatus() {
        if (!net.hostPeerId) return;
        const openPeers = [net.peerId].concat(Array.from(net.peers.entries()).filter(([, record]) => record.open).map(([id]) => id));
        if (net.hostPeerId === net.peerId) {
            if (net.lobby) {
                if (!net.lobby.mesh) net.lobby.mesh = {};
                net.lobby.mesh[net.peerId] = openPeers;
                broadcastLobby(); // 追加：他の参加者に接続完了を伝える
                renderLobby();    // 追加：ホスト自身の対戦開始ボタンを有効化する
            }
        } else sendTo(net.hostPeerId, { type: 'mesh_status', openPeers });
    }

    function meshComplete() {
        const humans = net.lobby ? Object.values(net.lobby.seats).filter(seat => seat.kind === 'human').map(seat => seat.peerId) : [];
        if (!humans.length) return false;
        const expected = new Set(humans);
        return humans.every(peerId => {
            const reported = peerId === net.peerId
                ? [net.peerId].concat(Array.from(net.peers.entries()).filter(([, record]) => record.open).map(([id]) => id))
                : net.lobby.mesh && net.lobby.mesh[peerId] || [];
            return Array.from(expected).every(id => reported.includes(id));
        });
    }

    function renderLobby() {
        if (!net.lobby) return;
        closeDialogs();
        const ids = actorIds(net.lobby.mode);
        const candidates = Array.isArray(net.lobby.cpuCandidates) && net.lobby.cpuCandidates.length ? net.lobby.cpuCandidates : cpuCandidates();
        const localSeat = seatForPeer(net.peerId);
        const deckIndexes = playableDeckIndexes();
        const deckOptions = deckIndexes.map(index => `<option value="${index}">${esc(window.TCG.deckNames && window.TCG.deckNames[index] || `デッキ ${index + 1}`)}</option>`).join('');
        const seats = ids.map((actorId, index) => {
            const seat = net.lobby.seats[actorId];
            const label = seatLabel(net.lobby.mode, actorId);
            if (seat.kind === 'human') {
                const ready = !!net.lobby.ready[seat.peerId];
                const fallback = seat.fallbackCpu || candidates[0];
                const fallbackSelect = net.hostPeerId === net.peerId ? `<select class="ctp-select" onchange="window.setCasinoTCGFallbackCpu('${actorId}',this.value)">${candidates.map(item => `<option value="${esc(item.masterType)}" ${item.masterType === fallback.masterType ? 'selected' : ''}>切断時: ${esc(item.name)}</option>`).join('')}</select>` : `<small>切断時CPU: ${esc(fallback.name)}</small>`;
                const seatSelect = net.hostPeerId === net.peerId ? `<select class="ctp-select" onchange="window.moveCasinoTCGHumanSeat('${esc(seat.peerId)}',this.value)">${ids.map(id => `<option value="${id}" ${id === actorId ? 'selected' : ''}>席: ${esc(seatLabel(net.lobby.mode, id))}</option>`).join('')}</select>` : '';
                return `<div class="ctp-seat${seat.peerId === net.peerId ? ' is-local' : ''}"><small>${label}</small><strong>👤 ${esc(seat.name)}</strong><span class="${ready ? 'ctp-ready' : 'ctp-wait'}">${ready ? '準備完了' : '準備中'}</span>${seatSelect}${fallbackSelect}</div>`;
            }
            const select = `<select class="ctp-select" ${net.hostPeerId === net.peerId ? `onchange="window.setCasinoTCGCpuSeat('${actorId}',this.value)"` : 'disabled'}>${candidates.map(item => `<option value="${esc(item.masterType)}" ${item.masterType === seat.masterType ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select>`;
            return `<div class="ctp-seat"><small>${label}</small><strong>🤖 CPU</strong>${select}</div>`;
        }).join('');
        const humans = Object.values(net.lobby.seats).filter(seat => seat.kind === 'human');
        const ready = humans.length > 0 && humans.every(seat => net.lobby.ready[seat.peerId] && Array.isArray(net.lobby.decks[seat.peerId]) && net.lobby.decks[seat.peerId].length === 60);
        const mesh = meshComplete();
        const meshDots = humans.map(seat => `<span class="ctp-dot${net.peers.get(seat.peerId) && net.peers.get(seat.peerId).open || seat.peerId === net.peerId ? ' is-open' : ''}">${esc(seat.name)}</span>`).join('');
        const hostControls = net.hostPeerId === net.peerId ? `<button class="ctp-btn is-main" ${ready && mesh ? 'onclick="window.startCasinoTCGOnlineBattle()"' : 'disabled'}>対戦開始</button>` : '<span class="ctp-status">ホストの開始を待っています。</span>';
        createOverlay('casino-tcg-online-lobby', `<div class="ctp-panel"><header class="ctp-head"><span><small>${net.lobby.mode === 'single' ? 'ONLINE SINGLE' : 'ONLINE TAG'}</small><h2>ルーム <span class="ctp-code">${esc(net.roomCode || '再戦')}</span></h2></span><button class="ctp-btn" onclick="window.closeCasinoTCGNetworkMatch()">× 退出</button></header><div class="ctp-status">WebRTC: ${mesh ? '全員のフルメッシュ接続が完了しました' : '参加者同士を接続中です'}<div class="ctp-mesh">${meshDots}</div></div><div class="ctp-seats">${seats}</div>${localSeat ? `<section class="ctp-card"><h3>自分のデッキ</h3><select id="ctp-local-deck" class="ctp-select">${deckOptions}</select><button class="ctp-btn" onclick="window.toggleCasinoTCGOnlineReady()">${net.lobby.ready[net.peerId] ? '準備を取り消す' : 'このデッキで準備完了'}</button></section>` : ''}<div class="ctp-actions"><span>${ready ? '全員準備完了' : '人間プレイヤーの準備を待っています'}</span>${hostControls}</div></div>`);
        ensureClock();
    }

    window.setCasinoTCGCpuSeat = function (actorId, masterType) {
        if (net.hostPeerId !== net.peerId || !net.lobby) return;
        const candidate = (net.lobby.cpuCandidates || cpuCandidates()).find(item => item.masterType === masterType); if (!candidate) return;
        net.lobby.seats[actorId] = Object.assign({ actorId, kind: 'cpu', fallbackCpu: candidate }, candidate);
        net.lobby.revision++; broadcastLobby(); renderLobby();
    };

    window.moveCasinoTCGHumanSeat = function (peerId, targetActorId) {
        if (net.hostPeerId !== net.peerId || !net.lobby) return;
        const source = seatForPeer(peerId);
        const target = net.lobby.seats[targetActorId];
        if (!source || !target || source.actorId === targetActorId) return;
        const sourceActorId = source.actorId;
        if (target.kind === 'human') {
            net.lobby.seats[sourceActorId] = Object.assign({}, target, { actorId: sourceActorId });
        } else {
            const fallback = source.fallbackCpu || (net.lobby.cpuCandidates || cpuCandidates())[0];
            net.lobby.seats[sourceActorId] = Object.assign({ actorId: sourceActorId, kind: 'cpu', fallbackCpu: fallback }, fallback);
        }
        net.lobby.seats[targetActorId] = Object.assign({}, source, { actorId: targetActorId });
        net.lobby.revision++;
        broadcastLobby();
        renderLobby();
    };

    window.setCasinoTCGFallbackCpu = function (actorId, masterType) {
        if (net.hostPeerId !== net.peerId || !net.lobby) return;
        const candidate = (net.lobby.cpuCandidates || cpuCandidates()).find(item => item.masterType === masterType); if (!candidate) return;
        net.lobby.seats[actorId].fallbackCpu = candidate;
        net.lobby.revision++; broadcastLobby(); renderLobby();
    };

    window.toggleCasinoTCGOnlineReady = function () {
        if (!net.lobby) return;
        const current = !!net.lobby.ready[net.peerId];
        const select = document.getElementById('ctp-local-deck');
        const index = Number(select && select.value != null ? select.value : playableDeckIndexes()[0]);
        const deck = deckPayload(index);
        if (!current && deck.length !== 60) { alertGame('60枚の保存済みデッキを選択してください。'); return; }
        if (net.hostPeerId === net.peerId) {
            net.lobby.decks[net.peerId] = deck;
            net.lobby.ready[net.peerId] = !current;
            net.lobby.revision++; broadcastLobby(); renderLobby();
        } else sendTo(net.hostPeerId, { type: 'ready', ready: !current, deck });
    };

    function buildBattleSetup() {
        const seats = actorIds(net.lobby.mode).map(actorId => {
            const seat = net.lobby.seats[actorId];
            if (seat.kind === 'human') return Object.assign({}, seat, { actorId, isHuman: true, controllerId: seat.peerId, deck: net.lobby.decks[seat.peerId] });
            const deck = typeof window.createMasterFixedTCGDeck === 'function' ? window.createMasterFixedTCGDeck(seat.masterType) : [];
            return Object.assign({}, seat, { actorId, isHuman: false, controllerId: '', deck });
        });
        return { mode: net.lobby.mode, roomCode: net.roomCode, seats, localActorId: seatForPeer(net.peerId).actorId };
    }

    window.startCasinoTCGOnlineBattle = async function () {
        if (net.hostPeerId !== net.peerId || !meshComplete()) return false;
        const humans = Object.values(net.lobby.seats).filter(seat => seat.kind === 'human');
        if (!humans.every(seat => net.lobby.ready[seat.peerId] && (net.lobby.decks[seat.peerId] || []).length === 60)) return false;
        const setup = buildBattleSetup();
        if (setup.seats.some(seat => !Array.isArray(seat.deck) || seat.deck.length !== 60)) { alertGame('対戦用デッキを準備できませんでした。'); return false; }
        broadcast({ type: 'start', setup });
        startReceivedBattle(setup, true);
        await closeSignalingRoom();
        return true;
    };

    function startReceivedBattle(setup, authority) {
        closeDialogs();
        net.started = true;
        net.resultRecorded = false;
        const local = setup.seats.find(seat => seat.controllerId === net.peerId);
        setup = JSON.parse(JSON.stringify(setup));
        setup.localActorId = local ? local.actorId : setup.localActorId;
        if (authority) window.startCasinoTCGNetworkBattleEngine(setup);
        ensureClock();
        if (!authority) {
            const wait = createOverlay('casino-tcg-online-lobby', `<div class="ctp-panel"><h2>対戦データを同期中…</h2><div class="ctp-status">ホストから最初の盤面を受信しています。</div></div>`);
            setTimeout(() => { if (wait && wait.isConnected && window.TCG_TAG_BATTLE) wait.remove(); }, 3000);
        }
        if (!authority) closeSignalingRoom();
    }

    async function closeSignalingRoom() {
        if (net.signalingClosed) return;
        net.signalingClosed = true;
        net.unsubs.splice(0).forEach(unsub => { try { unsub(); } catch (error) {} });
        if (net.isCreator && net.api && net.roomRef) {
            try { await net.api.remove(net.roomRef); } catch (error) { console.warn('シグナリングルーム削除失敗', error); }
        }
        if (net.api && net.db) net.api.goOffline(net.db);
        if (net.session && net.session.isAnonymous && typeof window.endP2PMatchmakingSession === 'function') {
            try { await window.endP2PMatchmakingSession(); } catch (error) { console.warn('匿名セッション終了失敗', error); }
        }
    }

    window.sendCasinoTCGNetworkIntent = function (intent) {
        if (!net.started || !intent) return false;
        if (net.hostPeerId === net.peerId) {
            const seat = seatForPeer(net.peerId);
            return !!(seat && window.applyCasinoTCGNetworkIntent(seat.actorId, Object.assign({}, intent, { controllerId: net.peerId })));
        }
        return sendTo(net.hostPeerId, { type: 'intent', intent });
    };

    window.onCasinoTCGNetworkStateChanged = function () {
        if (!net.started || net.hostPeerId !== net.peerId) return;
        clearTimeout(net.snapshotTimer);
        net.snapshotTimer = setTimeout(() => {
            const snapshot = window.exportCasinoTCGNetworkSnapshot && window.exportCasinoTCGNetworkSnapshot();
            if (!snapshot) return;
            if (!snapshot.isAnimating && !snapshot.networkDefense) net.lastStableSnapshot = snapshot;
            broadcast({ type: 'snapshot', snapshot });
        }, 80);
    };

    window.onCasinoTCGNetworkTurnReady = function (unit, battle) {
        if (net.hostPeerId !== net.peerId || !unit || !battle) return;
        clearTimeout(net.turnTimer);
        battle.networkDeadline = Date.now() + TURN_LIMIT_MS;
        window.onCasinoTCGNetworkStateChanged();
        net.turnTimer = setTimeout(() => {
            const current = window.TCG_TAG_BATTLE;
            if (!current || current.isEnded || current.actors[current.order[current.cursor]].id !== unit.id) return;
            window.applyCasinoTCGNetworkIntent(unit.id, { type: 'end_turn', controllerId: unit.controllerId });
        }, TURN_LIMIT_MS + 50);
    };

    window.onCasinoTCGNetworkTurnStarting = function (unit, battle) {
        if (net.hostPeerId !== net.peerId) return;
        clearTimeout(net.turnTimer);
        clearTimeout(net.interruptTimer);
        if (battle) battle.networkDeadline = 0;
    };

    window.onCasinoTCGNetworkDefenseRequested = function (unit, battle) {
        if (net.hostPeerId !== net.peerId || !unit || !battle) return;
        clearTimeout(net.interruptTimer);
        clearTimeout(net.turnTimer);
        battle.networkDeadline = Date.now() + INTERRUPT_LIMIT_MS;
        window.onCasinoTCGNetworkStateChanged();
        net.interruptTimer = setTimeout(() => {
            if (window.TCG_TAG_BATTLE && window.TCG_TAG_BATTLE.networkDefense && window.TCG_TAG_BATTLE.networkDefense.actorId === unit.id) {
                window.applyCasinoTCGNetworkIntent(unit.id, { type: 'defense', index: -1, controllerId: unit.controllerId });
            }
        }, INTERRUPT_LIMIT_MS + 50);
    };

    window.onCasinoTCGNetworkDefenseResolved = function (unit, battle) {
        if (net.hostPeerId !== net.peerId || !unit || !battle || battle.isEnded) return;
        window.onCasinoTCGNetworkTurnReady(unit, battle);
    };

    window.onCasinoTCGNetworkBattleEnded = function () {
        clearTimeout(net.turnTimer); clearTimeout(net.interruptTimer);
        const snapshot = window.exportCasinoTCGNetworkSnapshot && window.exportCasinoTCGNetworkSnapshot();
        if (snapshot) {
            recordPvpResult(snapshot);
            broadcast({ type: 'snapshot', snapshot });
        }
    };

    function recordPvpResult(snapshot) {
        if (net.resultRecorded || !snapshot || !snapshot.isEnded || !window.aiPet || typeof window.ensureDealerCasinoState !== 'function') return;
        const localSeat = seatForPeer(net.peerId);
        const localActor = localSeat && snapshot.actors && snapshot.actors[localSeat.actorId];
        if (!localActor) return;
        net.resultRecorded = true;
        const result = snapshot.winnerTeam === 'draw' ? 'draw' : snapshot.winnerTeam === localActor.team ? 'win' : 'loss';
        const progress = window.ensureDealerCasinoState(window.aiPet);
        const tcg = progress.stats && progress.stats.tcg;
        if (!tcg) return;
        if (!tcg.pvp || typeof tcg.pvp !== 'object') tcg.pvp = {};
        const key = snapshot.networkMode === 'single' ? 'single' : 'tag';
        if (!tcg.pvp[key]) tcg.pvp[key] = { plays: 0, wins: 0, losses: 0, draws: 0, lastPlayedAt: 0 };
        const record = tcg.pvp[key];
        record.plays = Math.max(0, Number(record.plays) || 0) + 1;
        const resultCounter = result === 'win' ? 'wins' : result === 'draw' ? 'draws' : 'losses';
        record[resultCounter] = Math.max(0, Number(record[resultCounter]) || 0) + 1;
        record.lastPlayedAt = Date.now();
        if (typeof window.saveGameData === 'function') window.saveGameData();
    }

    function ensureClock() {
        if (net.clockTimer) return;
        net.clockTimer = setInterval(() => {
            const battle = window.TCG_TAG_BATTLE;
            const node = document.querySelector('.ctgb-network-timer');
            if (node && battle && battle.networkDeadline) node.textContent = `${Math.max(0, Math.ceil((battle.networkDeadline - Date.now()) / 1000))}秒`;
            sendMeshStatus();
            const now = Date.now();
            net.chunks.forEach((holder, key) => { if (now - holder.createdAt > 60000) net.chunks.delete(key); });
        }, 1000);
    }

    function schedulePeerDisconnect(peerId) {
        setTimeout(() => {
            const record = net.peers.get(peerId);
            if (record && record.open) return;
            handlePeerDisconnect(peerId);
        }, 3000);
    }

    function connectedHumanPeerIds() {
        const ids = [net.peerId];
        net.peers.forEach((record, id) => { if (record.open) ids.push(id); });
        return ids.filter(id => !!seatForPeer(id));
    }

    function handlePeerDisconnect(peerId) {
        if (!net.lobby) return;
        const seat = seatForPeer(peerId);
        if (!seat) return;
        if (!net.started) {
            if (peerId === net.hostPeerId) {
                alertGame('ルーム作成者が退出したため、待ち合わせを終了します。');
                cleanupNetwork(true);
                return;
            }
            if (net.hostPeerId === net.peerId) convertLobbySeatToCpu(seat.actorId);
            renderLobby();
            return;
        }
        if (peerId === net.hostPeerId) {
            electNewHost(peerId);
            return;
        }
        if (net.hostPeerId === net.peerId) {
            window.replaceCasinoTCGNetworkSeatWithCpu(seat.actorId, seat.fallbackCpu);
            seat.kind = 'cpu'; seat.peerId = ''; seat.controllerId = '';
            window.onCasinoTCGNetworkStateChanged();
        }
    }

    function convertLobbySeatToCpu(actorId) {
        const seat = net.lobby.seats[actorId];
        const fallback = seat.fallbackCpu || (net.lobby.cpuCandidates || cpuCandidates())[0];
        net.lobby.seats[actorId] = Object.assign({ actorId, kind: 'cpu', fallbackCpu: fallback }, fallback);
        delete net.lobby.ready[seat.peerId]; delete net.lobby.decks[seat.peerId];
        net.lobby.revision++; broadcastLobby();
    }

    function electNewHost(disconnectedHostId) {
        const candidates = connectedHumanPeerIds().sort((a, b) => {
            const am = net.members[a] || {}; const bm = net.members[b] || {};
            return Number(am.joinedAt || 0) - Number(bm.joinedAt || 0) || a.localeCompare(b);
        });
        const elected = candidates[0];
        if (!elected) { alertGame('全プレイヤーとの接続が切れたため、対戦を終了します。'); cleanupNetwork(true); return; }
        const hostSeat = seatForPeer(disconnectedHostId);
        if (hostSeat) {
            if (net.lastStableSnapshot) {
                const localSeat = seatForPeer(net.peerId);
                if (localSeat) window.installCasinoTCGNetworkSnapshot(net.lastStableSnapshot, localSeat.actorId, false);
            }
            window.replaceCasinoTCGNetworkSeatWithCpu(hostSeat.actorId, hostSeat.fallbackCpu);
            hostSeat.kind = 'cpu'; hostSeat.peerId = ''; hostSeat.controllerId = '';
        }
        net.hostPeerId = elected;
        net.lobby.hostPeerId = elected;
        if (elected === net.peerId) {
            const localSeat = seatForPeer(net.peerId);
            window.promoteCasinoTCGNetworkAuthority(localSeat && localSeat.actorId);
            const snapshot = window.exportCasinoTCGNetworkSnapshot();
            if (snapshot) broadcast({ type: 'host_migrated', hostPeerId: elected, snapshot });
        }
    }

    window.requestCasinoTCGNetworkRematch = function () {
        if (net.hostPeerId === net.peerId) returnToLobby();
        else sendTo(net.hostPeerId, { type: 'rematch_request' });
    };

    function returnToLobby() {
        if (!net.lobby || net.hostPeerId !== net.peerId) return;
        Object.keys(net.lobby.ready).forEach(id => { net.lobby.ready[id] = false; });
        net.started = false;
        net.resultRecorded = false;
        net.lobby.revision++;
        broadcast({ type: 'return_lobby', lobby: net.lobby });
        showLobbyFromBattle();
    }

    function showLobbyFromBattle() {
        net.started = false;
        clearTimeout(net.turnTimer); clearTimeout(net.interruptTimer);
        const ui = document.getElementById('tcg-tag-battle-ui'); if (ui) ui.remove();
        window.TCG_TAG_BATTLE = null;
        renderLobby();
    }

    window.closeCasinoTCGNetworkMatch = async function () {
        broadcast({ type: 'close_match' });
        await cleanupNetwork(true);
        const battle = document.getElementById('tcg-tag-battle-ui'); if (battle) battle.remove();
        closeDialogs();
        window.TCG_TAG_BATTLE = null;
        if (typeof window.openCasinoTCGMenu === 'function') window.openCasinoTCGMenu();
    };

    async function cleanupNetwork(endAnonymous) {
        net.closed = true;
        clearTimeout(net.snapshotTimer); clearTimeout(net.turnTimer); clearTimeout(net.interruptTimer);
        if (net.clockTimer) clearInterval(net.clockTimer);
        net.clockTimer = null;
        net.unsubs.splice(0).forEach(unsub => { try { unsub(); } catch (error) {} });
        net.peers.forEach(record => {
            try { if (record.channel) record.channel.close(); } catch (error) {}
            try { record.pc.close(); } catch (error) {}
        });
        net.peers.clear();
        if (net.isCreator && net.api && net.roomRef && !net.signalingClosed) {
            try { await net.api.remove(net.roomRef); } catch (error) {}
        }
        if (net.api && net.db) net.api.goOffline(net.db);
        if (endAnonymous && typeof window.endP2PMatchmakingSession === 'function') {
            try { await window.endP2PMatchmakingSession(); } catch (error) {}
        }
        Object.assign(net, { session: null, peerId: '', roomCode: '', roomRef: null, isCreator: false, hostPeerId: '', members: {}, lobby: null, started: false, signalingClosed: false, lastStableSnapshot: null, chunks: new Map(), resultRecorded: false });
    }

    window.addEventListener('beforeunload', () => {
        net.peers.forEach(record => { try { record.pc.close(); } catch (error) {} });
    });
})();
