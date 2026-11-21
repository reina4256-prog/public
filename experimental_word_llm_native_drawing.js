'use strict';
// Reuse only the accepted pencil drawing helper; no authored diary fixtures.
    function draw(canvas, kind) {
        const c = canvas.getContext('2d');
        c.scale(2, 2); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 2.4;
        // Deterministic uneven pencil paths; rereading never redraws a different subject.
        function line(points, color = '#75654c') {
            c.strokeStyle = color; c.beginPath();
            points.forEach(([x, y], i) => {
                if (!i) { c.moveTo(x, y); return; }
                const [px, py] = points[i - 1], steps = Math.max(2, Math.ceil(Math.hypot(x - px, y - py) / 7));
                for (let j = 1; j <= steps; j++) {
                    const f = j / steps, wobble = Math.sin((i * 11 + j) * 1.7) * .9;
                    c.lineTo(px + (x - px) * f + wobble, py + (y - py) * f + wobble);
                }
            }); c.stroke();
        }
        function oval(x, y, rx, ry, color, fill) {
            const points = Array.from({ length: 45 }, (_, i) => {
                const a = i * Math.PI / 22; return [x + Math.cos(a) * (rx + Math.sin(i * 2.3)), y + Math.sin(a) * (ry + Math.cos(i * 1.9))];
            });
            if (fill) { c.fillStyle = fill; c.beginPath(); points.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.fill(); }
            line(points, color);
        }
        function robot(x, y, scale = 1) {
            c.save(); c.translate(x, y); c.scale(scale, scale);
            const blue = '#708f9c';
            line([[-31, -45], [-30, -84], [29, -86], [32, -45], [-31, -45]], blue);
            line([[-27, -86], [-31, -104]], blue); oval(-31, -108, 3, 3, blue);
            line([[24, -86], [29, -104]], blue); oval(29, -108, 3, 3, blue);
            oval(-13, -65, 5, 6, blue, '#a9c6cf60'); oval(13, -65, 5, 6, blue, '#a9c6cf60');
            line([[-12, -51], [13, -51]], blue);
            line([[-24, -41], [26, -41], [26, 10], [-25, 10], [-24, -41]], blue);
            line([[-13, -29], [13, -29], [12, -8], [-13, -8], [-13, -29]], blue);
            line([[-25, -31], [-39, -11], [-36, 4]], blue); oval(-36, 7, 5, 6, blue);
            line([[26, -30], [39, -11], [38, 5]], blue); oval(38, 8, 5, 6, blue);
            line([[-15, 11], [-17, 31], [-30, 32], [-30, 37], [-8, 38]], blue);
            line([[14, 11], [17, 31], [29, 32], [30, 37], [9, 38]], blue);
            c.restore();
        }
        function farmer(x, y) {
            c.save(); c.translate(x, y);
            oval(0, -62, 23, 26, '#a98667', '#e5c7a260');
            // Existing master's straw hat, blue overalls and hoe; no encounter-state lookup.
            line([[-24, -82], [-17, -102], [17, -102], [25, -81]], '#b79852');
            oval(0, -81, 39, 7, '#b79852', '#dfcc8650');
            line([[-22, -87], [22, -87]], '#ba7051');
            line([[-18, -74], [-8, -79], [0, -75], [8, -79], [19, -73]], '#746450');
            oval(-9, -62, 1.2, 2, '#746450'); oval(9, -62, 1.2, 2, '#746450');
            line([[-7, -46], [1, -44], [8, -47]], '#746450');
            line([[-20, -35], [-27, 21], [27, 21], [20, -35]], '#aa8b6b');
            line([[-14, -34], [-12, -14], [12, -14], [15, -34]], '#73909c');
            line([[-13, -14], [-15, 20], [15, 20], [13, -14]], '#73909c');
            line([[-20, -28], [-39, -4], [-51, -7]], '#aa8b6b');
            line([[20, -28], [38, -9], [34, 9]], '#aa8b6b');
            line([[-12, 22], [-16, 46], [-26, 48], [-5, 48]], '#746450');
            line([[12, 22], [16, 46], [27, 48], [5, 48]], '#746450');
            line([[-51, -71], [-53, 51]], '#aa8052');
            line([[-55, -73], [-76, -65], [-72, -57], [-52, -65]], '#839094');
            c.restore();
        }
        if (kind === 'berry') {
            line([[190, 161], [218, 104], [247, 70], [276, 53]], '#678350');
            line([[219, 105], [182, 89], [159, 63]], '#678350');
            oval(191, 66, 25, 12, '#6c8851', '#d5dea780');
            oval(258, 87, 27, 11, '#6c8851', '#d5dea780');
            [[171, 115, 23, 26], [212, 141, 24, 23], [259, 119, 21, 25]].forEach(([x, y, rx, ry]) => {
                oval(x, y, rx, ry, '#b55f51', '#e0a18b70');
                [[-6, -7], [8, -3], [-2, 9]].forEach(([dx, dy]) => oval(x + dx, y + dy, 1.1, 1.6, '#aa6650'));
            });
            line([[139, 173], [192, 175], [247, 172], [292, 177]], '#adac83');
        } else if (kind === 'net') {
            for (let i = 0; i < 6; i++) {
                line([[133 + i * 24, 47], [155 + i * 24, 150]], '#84979a');
                line([[128, 52 + i * 19], [278, 48 + i * 20]], '#84979a');
            }
            line([[192, 91], [213, 102], [204, 122], [185, 117], [194, 101], [222, 130], [245, 161]], '#aa8052');
            line([[190, 105], [171, 138], [145, 145], [130, 138]], '#aa8052');
            line([[240, 164], [259, 172], [277, 165]], '#aa8052');
        } else if (kind === 'robot') {
            robot(210, 144);
        } else if (kind === 'meeting') {
            robot(139, 152, .78); farmer(286, 134);
            line([[103, 188], [205, 185], [340, 187]], '#adac83');
        } else if (kind === 'dragon') {
            const grey = '#879097', gold = '#ba9b50';
            line([[181, 99], [132, 61], [124, 103], [143, 90], [151, 115], [174, 101]], gold);
            line([[245, 100], [284, 68], [305, 101], [278, 94], [272, 121], [250, 104]], gold);
            line([[181, 143], [152, 160], [124, 151], [140, 174], [178, 169], [192, 157]], grey);
            oval(216, 124, 34, 43, grey, '#e0ddca50'); oval(222, 127, 17, 31, gold, '#dfcc8650');
            oval(216, 66, 36, 29, grey, '#e0ddca50');
            line([[190, 43], [178, 18], [205, 38]], gold);
            line([[229, 37], [239, 14], [248, 47]], gold);
            oval(205, 64, 3, 5, '#6e929a'); oval(234, 64, 3, 5, '#6e929a');
            line([[210, 80], [222, 83], [236, 79]], grey);
            line([[186, 105], [177, 127], [189, 129]], grey);
            line([[246, 103], [256, 125], [245, 132]], grey);
            line([[200, 158], [191, 182], [214, 182]], grey);
            line([[237, 158], [240, 181], [260, 180]], grey);
        }
    }

window.NativeDiaryDraw=draw;
