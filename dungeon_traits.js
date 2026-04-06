// 進化ツリーの系譜（スタック）を解決する関数
window.getPlayerDungeonTraits = function(skin) {
    let traits = [];
    if (!skin || (!skin.includes('robot') && !skin.includes('spirit'))) return traits; 

    const addTrait = (id) => { if (window.DUNGEON_TRAIT_DICT[id] && window.DUNGEON_TRAIT_DICT[id].player) traits.push(window.DUNGEON_TRAIT_DICT[id].player); };

    // ==========================================
    // ★ ロボット系の系譜
    // ==========================================
    if (skin.includes('robot')) {
        addTrait('robot'); // Base

        // Gen 1
        if (skin === 'robot_type3') { addTrait('robot_type3'); }
        else if (skin === 'robot_type3_2') { addTrait('robot_type3_2'); }
        else if (skin === 'robot_type2') { addTrait('robot_type2'); }
        else if (skin === 'robot_type4') { addTrait('robot_type4'); }
        else if (skin === 'robot_type4_2') { addTrait('robot_type4_2'); }
        else if (skin === 'robot_type1') { addTrait('robot_type1'); }
        else if (skin === 'robot_type5') { addTrait('robot_type5'); }
        
        // Gen 2 (ダイヤモンド進化の履歴解決)
        else {
            // ★ 過去の経由ルート(Gen1)を特定する
            // ※今後 aiPet 等に pastSkins（過去の姿の配列）などを実装した場合、ここが自動で機能します
            let pastGen1 = null; 
            if (window.aiPet && window.aiPet.pastSkins) {
                // 履歴の中に 'robot_type3_2' や 'robot_type4_2' があればそれを優先
                pastGen1 = window.aiPet.pastSkins.find(s => s === 'robot_type3_2' || s === 'robot_type4_2');
            }

            if (skin === 'robot_type3_3' || skin === 'robot_type3_4' || skin === 'robot_type3_5') { 
                addTrait(pastGen1 === 'robot_type3_2' ? 'robot_type3_2' : 'robot_type3'); 
                addTrait(skin); 
            }
            else if (skin === 'robot_type2_2' || skin === 'robot_type2_3' || skin === 'robot_type2_4') { 
                addTrait('robot_type2'); addTrait(skin); 
            }
            else if (skin === 'robot_type4_3' || skin === 'robot_type4_4') { 
                addTrait(pastGen1 === 'robot_type4_2' ? 'robot_type4_2' : 'robot_type4'); 
                addTrait(skin); 
            }
            else if (skin === 'robot_type1_2' || skin === 'robot_type1_3') { 
                addTrait('robot_type1'); addTrait(skin); 
            }
            else if (skin === 'robot_type5_2' || skin === 'robot_type5_3' || skin === 'robot_type5_4') { 
                addTrait('robot_type5'); addTrait(skin); 
            }
        }

        // 重装甲がある場合、頑丈な装甲を上書きする
        let hasHeavy = traits.find(t => t.name === '重装甲');
        if (hasHeavy) traits = traits.filter(t => t.name !== '頑丈な装甲');
    }

    // ==========================================
    // ★ 精霊系の系譜
    // ==========================================
    if (skin.includes('spirit')) {
        addTrait('spirit');

        // Gen 1
        if (skin === 'spirit_type2') { addTrait('spirit_type2'); }
        else if (skin === 'spirit_type4') { addTrait('spirit_type4'); }
        else if (skin === 'spirit_type5') { addTrait('spirit_type5'); }
        else if (skin === 'spirit_type1') { addTrait('spirit_type1'); }
        else if (skin === 'spirit_type3') { addTrait('spirit_type3'); }

        // Gen 2
        else if (skin === 'spirit_type2_2') { addTrait('spirit_type2'); addTrait('spirit_type2_2'); }
        else if (skin === 'spirit_type2_3') { addTrait('spirit_type2'); addTrait('spirit_type2_3'); }
        else if (skin === 'spirit_type4_2') { addTrait('spirit_type4'); addTrait('spirit_type4_2'); }
        else if (skin === 'spirit_type4_3') { addTrait('spirit_type4'); addTrait('spirit_type4_3'); }
        else if (skin === 'spirit_type5_2') { addTrait('spirit_type5'); addTrait('spirit_type5_2'); }
        else if (skin === 'spirit_type5_3') { addTrait('spirit_type5'); addTrait('spirit_type5_3'); }
        else if (skin === 'spirit_type1_2') { addTrait('spirit_type1'); addTrait('spirit_type1_2'); }
        else if (skin === 'spirit_type3_2') { addTrait('spirit_type3'); addTrait('spirit_type3_2'); }
    }

    return traits;
};