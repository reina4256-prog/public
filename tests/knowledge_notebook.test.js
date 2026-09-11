const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'ui_controller.js'), 'utf8');
const start = source.indexOf('// 📔 知識の手帳UI');
const end = source.indexOf('// 🏥 薬局専用ショップUI', start);
assert(start >= 0 && end > start, 'the Knowledge Notebook implementation section should be discoverable');

const context = {
    console,
    Object,
    Array,
    Number,
    String,
    aiPet: {
        apprentice: { rank: {}, retired: {} },
        blacksmithRecipeNotebookUnlocked: false,
        blacksmithTutorialCompleted: false
    },
    BLACKSMITH_RECIPE_CATALOG: {
        eq_sword: { category: 'weapon', materials: { iron: 5 }, equipment: ['basic_forge'] },
        rod_old: { category: 'goods', materials: { wood: 3 }, equipment: ['basic_forge'] }
    },
    BLACKSMITH_EQUIPMENT_CATALOG: {
        basic_forge: { name: '基本鍛冶設備', unlockLevel: 1 }
    },
    itemCatalog: {
        eq_sword: { name: '鉄の剣' },
        rod_old: { name: '古い釣り竿' },
        iron: { name: '鉄' },
        wood: { name: '木材' }
    }
};
context.window = context;
vm.createContext(context);
vm.runInContext(source.slice(start, end), context, { filename: 'knowledge_notebook_section.js' });

assert.strictEqual(context.isBlacksmithRecipeNotebookUnlocked(), false, 'the Blacksmith bookmark should not exist at game start');
context.aiPet.blacksmithRecipeNotebookUnlocked = true;
assert.strictEqual(context.isBlacksmithRecipeNotebookUnlocked(), true, 'first owned-shop entry should unlock the Blacksmith bookmark');

context.currentBlacksmithBuilding = {
    blacksmithBusiness: {
        recipes: {
            eq_sword: { discovered: true, mastery: 25 },
            rod_old: { discovered: false, mastery: 0 }
        },
        stock: { eq_sword: 2 }
    }
};
const html = context.renderBlacksmithRecipeListHtml();
assert(html.includes('鉄の剣'), 'a discovered Blacksmith recipe should appear in the Notebook');
assert(html.includes('基本鍛冶設備'), 'the Notebook should show required equipment');
assert(html.includes('在庫：<strong>2個'), 'the Notebook should show current shelf stock');
assert(!html.includes('古い釣り竿'), 'undiscovered recipe names and requirements must remain hidden');

context.currentBlacksmithBuilding = null;
context.aiPet.savedBlacksmithRecipes = { eq_sword: { discovered: true, mastery: 100 } };
assert(context.getNotebookBlacksmithState().recipes.eq_sword, 'foreclosure-preserved recipes should remain readable');

assert(source.includes('class="nb-book-spread"'), 'the Notebook should use a two-page book spread');
assert(source.includes('class="nb-bookmark'), 'the Notebook should use edge bookmarks instead of top tabs');
assert(!source.includes('class="nb-tab'), 'the obsolete rectangular tab markup should be removed');

console.log('knowledge notebook tests passed');
