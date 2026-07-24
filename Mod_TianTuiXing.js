//=============================================================================
// Mod_TianTuiXing.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 天退星刀 Mod (武器、狀態、技能與專屬BGM) [全動態浮動與音樂整合版]
 * @author 
 * 
 * @param BgmName
 * @text 專屬 BGM 佈署打包依賴
 * @desc 為了讓遊戲輸出時正確打包音樂，請確保此處的檔名與下方腳本 TIAN_MOD 設定相同。
 * @type file
 * @dir audio/bgm/
 * @default Mod_Lei_Heng_Theme
 * 
 * @param TremorSeName
 * @text 震顫音效打包依賴
 * @desc 為了讓遊戲輸出時正確打包音效，請確保此處的檔名與下方 TIAN_MOD 設定相同。
 * @type file
 * @dir audio/se/
 * @default Mod_TremorBurst
 * 
 * @help
 * 採用動態註冊的方式，不需修改原本的 json 檔案。
 * 直接在插件管理器啟用即可生效。
 * 
 * ==========================================
 * 玩家自訂指南：
 * ==========================================
 * 請向下滑動，找到 【模組核心設定區 (TIAN_MOD)】。
 * 所有的數值、文字、音效都在那裡！
 * 只要修改裡面的數字或文字，存檔後進遊戲就會直接生效。
 */

(() => {
    // =====================================================================
    // =====================================================================
    // 【模組核心設定區 (TIAN_MOD) - 簡易客製化專區】
    // =====================================================================
    // 在這裡你可以輕易修改所有數值，不需要去動下方的複雜程式碼。
    // =====================================================================
    const TIAN_MOD = {
        
        // ----------------------------------------------------
        // 1. 遊戲資料 ID 設定 (若與其他插件衝突可修改)
        // ----------------------------------------------------
        ids: {
            weapon: 530,
            skills: {
                sk_2slash: 530, sk_3slash: 531, sk_knot: 532, sk_blood: 533, sk_super: 535   
            },
            states: {
                tiger: 530, winged: 531, leap: 532, fierce: 533, heart: 534, 
                heaven: 535, overheat: 536, burn: 537, tremor: 538, scorch: 539, counter: 540    
            }
        },

        // ----------------------------------------------------
        // 2. 圖示與動畫 ID 設定
        // ----------------------------------------------------
        icons: {
            weapon: 112,       sk_2slash: 76,     sk_3slash: 78,
            sk_knot: 77,       sk_blood: 81,      sk_super: 64,
            tiger: 118,        winged: 72,        leap: 42,
            fierce: 83,        heart: 84,         heaven: 87,
            overheat: 64,      burn: 64,          tremor: 6,
            scorch: 64,        counter: 80
        },
        animations: {
            sk_2slash: 8,      sk_3slash: 8,      sk_knot: 23,
            sk_blood: 51,      sk_super: [69, 23] 
        },

        // ----------------------------------------------------
        // 3. 音樂與音效設定 (BGM 與 SE)
        // ----------------------------------------------------
        bgm: { name: "Mod_Lei_Heng_Theme", volume: 90, pitch: 100 },
        se: { 
            // 震顫爆發音效設定
            tremorBurst: { name: "Mod_TremorBurst", volume: 200, pitch: 100 }
        },

        // ----------------------------------------------------
        // 4. 戰鬥數值與條件設定 (客製化主力區)
        // ----------------------------------------------------
        params: {
            // 武器基本屬性：[MHP, MMP, ATK, DEF, MAT, MDF, AGI, LUK]
            weaponStats: [0, 0, 200, 0, 0, 0, 100, 0], 
            
            // 技能參數
            skills: {
                sk_2slash: { repeats: 2, tpGain: 0, formula: "a.atk * 2 - b.def" },
                sk_3slash: { repeats: 3, tpGain: 0, formula: "a.atk * 2.5 - b.def", cooldown: 2 },
                sk_knot:   { repeats: 3, tpGain: 0, formula: "a.atk * 3 - b.def", cooldown: 3 },
                sk_super:  { repeats: 5, tpGain: 0, formula: "a.atk * 3.5 - b.def" }
            },
            
            // 狀態加成 (小數點代表比例，1.2 = 120%)
            states: {
                tiger:  { atkRate: 1.2 }, 
                leap:   { atkRate: 1.15 }, 
                fierce: { atkRate: 1.5 }, 
                heaven: { agiRate: 1.1 }, 
                heart:  { agiRate: 1.3 }, 
                
                // 過熱機制參數設定
                overheat: {
                    threshold1: 8,   // 閾值 1：達成減傷的彈藥消耗數
                    threshold2: 14,  // 閾值 2：達成增傷的彈藥消耗數
                    threshold3: 20,  // 閾值 3：達成額外增傷的彈藥消耗數
                    
                    // 以下為過熱的效果上限值 (小數點代表百分比)
                    t1_damageReductionMax: 0.5, // 閾值 1：最大減傷 (50%)
                    t2_damageBoostBase: 0.75,   // 閾值 2：基礎傷害增加 (75%)
                    t2_damageBoostMax: 1.5,     // 閾值 2：最大傷害增加 (150%)
                    t3_damageBoostMax: 0.5      // 閾值 3：最大傷害增加 (50%)
                }
            },
            
            // 核心機制參數
            mechanics: {
                startTigerAmmo: 12,    // 開場獲得虎標彈數量
                fierceAmmoGain: 8,     // 轉換時獲得猛虎標彈數量
                transformReq: 8,       // 天退星轉化為心-天退星的要求消耗數
                tremorBaseDmg: 100     // 每層震顫引爆的基礎真實傷害
            }
        },

        // ----------------------------------------------------
        // 5. 文字敘述設定 (說明標籤)
        // ----------------------------------------------------
        texts: {
            weapon: { 
                name: "天退星刀", 
                desc: "\\C[14]可使用「二連斬-爆」、「三連擊-爆」、「快刀亂麻」\\C[14]\n「令人熱血沸騰」、「超絕猛虎殺擊亂斬」\\C[0]\n雖然必須隱瞞這把天退星刀的名號略微有些可惜……\\C[0]\n但既然它能如插翅之虎一般咆哮，那如此倒也足夠。" 
            },
            skills: {
                sk_2slash: { name: "二連斬-爆", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予「燒傷」、「震顫」\n\\C[14]消耗1顆「虎標彈」或「猛虎標彈」\\C[0]\n接一招試試吧？" },
                sk_3slash: { name: "三連擊-爆", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予「燒傷」、「震顫」\n\\C[14]消耗2顆「虎標彈」或「猛虎標彈」\\C[0]\n\\C[2]*%COOLDOWN% 回合後可再次使用\\C[0]\n再那樣呆站著，腦袋可要落地了。" },
                sk_knot:   { name: "快刀亂麻", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予「燒傷」、「震顫」\n\\C[14]消耗3顆「虎標彈」或剩餘彈藥 (無視迴避與反擊)\\C[0]\n\\C[2]*%COOLDOWN% 回合後可再次使用\\C[0]\n全彈發射！" },
                sk_blood:  { name: "令人熱血沸騰", desc: "武器技能\n\\C[14]直到下次行動，反擊率100%\n\\C[14]消耗30MP，如果持有「虎標彈」則在回合結束時清零\\C[0]\n獵物嗎。令人……熱血沸騰啊。" },
                sk_super:  { name: "超絕猛虎殺擊亂斬", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予「燒傷」、「震顫」\n\\C[14]消耗最多3顆「猛虎標彈」 (無視迴避與反擊)\\C[2]\n想擒虎嗎。那就做好被咬死的覺悟吧。\\C[0]\n我，雷克西斯。拇指的指揮官，東部十劍之一。將全力與你戰鬥。" }
            },
            states: {
                tiger:    { name: "虎標彈", note: "<説明:\\C[14]攻擊力 %ATK%\\C[0]\n戰鬥開始時，有裝填 %START_AMMO% 顆虎標彈。>" },
                winged:   { name: "插翅虎", note: "<説明:\\C[0]若消耗了自身所有虎標彈，使自身裝填 %FIERCE_AMMO% 顆猛虎標彈並獲得天退星。\n\\C[14]若累積消耗彈藥達 %TRANS_REQ% 顆，則轉化為心-天退星。\n\\C[2]消耗最後的猛虎標彈時，獲得過熱。>" },
                leap:     { name: "猛虎暴躍", note: "<説明:\\C[14]攻擊力 %ATK%>" },
                fierce:   { name: "猛虎標彈", note: "<説明:\\C[14]攻擊力 %ATK%>" },
                heart:    { name: "心-天退星", note: "<説明:\\C[14]敏捷性 %AGI%\\C[0]\n傷害增加(與目標敏捷差×5)%(最多40%)\n賦予敵人震顫時，層數額外+2>" },
                heaven:   { name: "天退星", note: "<説明:\\C[14]敏捷性 %AGI%\\C[0]\n傷害增加(與目標敏捷差×2.5)%(最多20%)\n賦予敵人震顫時，層數額外+1>" },
                overheat: { name: "過熱", note: "<説明:動態狀態描述>" }, // 在程式碼中動態生成
                burn:     { name: "燒傷", note: "<説明:\\C[14]每疊加N層，回合結束時受到自身最大HP N%的傷害(與震顫-灼熱共用15%上限)>" },
                tremor:   { name: "震顫", note: "<説明:\\C[14]受到引爆時，每層造成 %BASE_DMG% 點固定傷害。>" },
                scorch:   { name: "震顫-灼熱", note: "<説明:\\C[14]每疊加N層，回合結束時受到自身最大HP N%的傷害(與燒傷共用15%上限)>" },
                counter:  { name: "令人熱血沸騰(反擊)", note: "<説明:\\C[14]直到下一次自身回合，使自身反擊率100%>" }
            }
        }
    };
    
    // =====================================================================
    // =====================================================================
    // 以下為程式碼邏輯區 (除非熟悉程式碼，否則不建議隨意修改)
    // =====================================================================
    // =====================================================================

    const IDS = TIAN_MOD.ids;
    const ICONS = TIAN_MOD.icons;
    const ANIMATIONS = TIAN_MOD.animations;
    const PARAMS = TIAN_MOD.params;
    const TEXTS = TIAN_MOD.texts;
    const BGM = TIAN_MOD.bgm;

    // === 初始化文字替換 ===
    (() => {
        const toPct = (val) => Math.round(val * 100) + "%";
        TEXTS.states.tiger.note = TEXTS.states.tiger.note.replace(/%ATK%/g, toPct(PARAMS.states.tiger.atkRate)).replace(/%START_AMMO%/g, PARAMS.mechanics.startTigerAmmo);
        TEXTS.states.leap.note = TEXTS.states.leap.note.replace(/%ATK%/g, toPct(PARAMS.states.leap.atkRate));
        TEXTS.states.fierce.note = TEXTS.states.fierce.note.replace(/%ATK%/g, toPct(PARAMS.states.fierce.atkRate));
        TEXTS.states.heaven.note = TEXTS.states.heaven.note.replace(/%AGI%/g, toPct(PARAMS.states.heaven.agiRate));
        TEXTS.states.heart.note = TEXTS.states.heart.note.replace(/%AGI%/g, toPct(PARAMS.states.heart.agiRate));
        TEXTS.states.winged.note = TEXTS.states.winged.note.replace(/%FIERCE_AMMO%/g, PARAMS.mechanics.fierceAmmoGain).replace(/%TRANS_REQ%/g, PARAMS.mechanics.transformReq);
        TEXTS.states.tremor.note = TEXTS.states.tremor.note.replace(/%BASE_DMG%/g, PARAMS.mechanics.tremorBaseDmg);
        TEXTS.skills.sk_2slash.desc = TEXTS.skills.sk_2slash.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_2slash.repeats);
        TEXTS.skills.sk_3slash.desc = TEXTS.skills.sk_3slash.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_3slash.repeats).replace(/%COOLDOWN%/g, PARAMS.skills.sk_3slash.cooldown);
        TEXTS.skills.sk_knot.desc = TEXTS.skills.sk_knot.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_knot.repeats).replace(/%COOLDOWN%/g, PARAMS.skills.sk_knot.cooldown);
        TEXTS.skills.sk_super.desc = TEXTS.skills.sk_super.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_super.repeats);
    })();

    // === 資料庫動態注入 ===
    const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        if (!this._modTianTuiXingLoaded) {
            this.loadModTianTuiXing();
            this._modTianTuiXingLoaded = true;
        }
        return true;
    };

    DataManager.loadModTianTuiXing = function() {
        const maxStateId = Math.max(...Object.values(IDS.states));
        const maxSkillId = Math.max(...Object.values(IDS.skills));
        
        const fillGaps = (array, maxId) => {
            for (let i = 0; i <= maxId; i++) {
                if (array[i] === undefined) array[i] = null;
            }
        };

        fillGaps($dataStates, maxStateId);
        fillGaps($dataSkills, maxSkillId);
        fillGaps($dataWeapons, IDS.weapon);

        $dataStates[IDS.states.tiger]  = { id: IDS.states.tiger, name: TEXTS.states.tiger.name, iconIndex: ICONS.tiger, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 2, value: PARAMS.states.tiger.atkRate}], note: TEXTS.states.tiger.note, meta: {} };
        $dataStates[IDS.states.winged] = { id: IDS.states.winged, name: TEXTS.states.winged.name, iconIndex: ICONS.winged, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.winged.note, meta: {} };
        $dataStates[IDS.states.leap]   = { id: IDS.states.leap, name: TEXTS.states.leap.name, iconIndex: ICONS.leap, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 2, value: PARAMS.states.leap.atkRate}], note: TEXTS.states.leap.note, meta: {} };
        $dataStates[IDS.states.fierce] = { id: IDS.states.fierce, name: TEXTS.states.fierce.name, iconIndex: ICONS.fierce, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 2, value: PARAMS.states.fierce.atkRate}], note: TEXTS.states.fierce.note, meta: {} };
        $dataStates[IDS.states.heart]  = { id: IDS.states.heart, name: TEXTS.states.heart.name, iconIndex: ICONS.heart, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 6, value: PARAMS.states.heart.agiRate}], note: TEXTS.states.heart.note, meta: {} };
        $dataStates[IDS.states.heaven] = { id: IDS.states.heaven, name: TEXTS.states.heaven.name, iconIndex: ICONS.heaven, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 6, value: PARAMS.states.heaven.agiRate}], note: TEXTS.states.heaven.note, meta: {} };
        $dataStates[IDS.states.overheat] = { id: IDS.states.overheat, name: TEXTS.states.overheat.name, iconIndex: ICONS.overheat, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.overheat.note, meta: {} };
        $dataStates[IDS.states.burn]   = { id: IDS.states.burn, name: TEXTS.states.burn.name, iconIndex: ICONS.burn, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.burn.note, meta: {} };
        $dataStates[IDS.states.tremor] = { id: IDS.states.tremor, name: TEXTS.states.tremor.name, iconIndex: ICONS.tremor, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.tremor.note, meta: {} };
        $dataStates[IDS.states.scorch] = { id: IDS.states.scorch, name: TEXTS.states.scorch.name, iconIndex: ICONS.scorch, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.scorch.note, meta: {} };
        $dataStates[IDS.states.counter] = { id: IDS.states.counter, name: TEXTS.states.counter.name, iconIndex: ICONS.counter, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 2, minTurns: 0, maxTurns: 0, traits: [{code: 22, dataId: 6, value: 1.0}], note: TEXTS.states.counter.note, meta: {} };

        const createBaseSkill = (id, name, desc, iconId, animId, scope, repeats, formula, tpGain, effects = []) => ({
            id: id, name: name, description: desc, iconIndex: iconId, stypeId: 1, scope: scope, occasion: 1, speed: 0,
            successRate: 100, repeats: repeats, tpGain: tpGain, hitType: formula ? 1 : 0, animationId: animId,
            damage: { type: formula ? 1 : 0, elementId: -1, formula: formula || "0", variance: 20, critical: !!formula },
            effects: effects, note: "", meta: {}, mpCost: 0, tpCost: 0,
            requiredWtypeId1: 0, requiredWtypeId2: 0, messageType: 1, message1: "施放了 %2！", message2: ""
        });

        $dataSkills[IDS.skills.sk_2slash] = createBaseSkill(IDS.skills.sk_2slash, TEXTS.skills.sk_2slash.name, TEXTS.skills.sk_2slash.desc, ICONS.sk_2slash, ANIMATIONS.sk_2slash, 1, PARAMS.skills.sk_2slash.repeats, PARAMS.skills.sk_2slash.formula, PARAMS.skills.sk_2slash.tpGain);
        $dataSkills[IDS.skills.sk_3slash] = createBaseSkill(IDS.skills.sk_3slash, TEXTS.skills.sk_3slash.name, TEXTS.skills.sk_3slash.desc, ICONS.sk_3slash, ANIMATIONS.sk_3slash, 1, PARAMS.skills.sk_3slash.repeats, PARAMS.skills.sk_3slash.formula, PARAMS.skills.sk_3slash.tpGain);
        $dataSkills[IDS.skills.sk_knot]   = createBaseSkill(IDS.skills.sk_knot, TEXTS.skills.sk_knot.name, TEXTS.skills.sk_knot.desc, ICONS.sk_knot, ANIMATIONS.sk_knot, 1, PARAMS.skills.sk_knot.repeats, PARAMS.skills.sk_knot.formula, PARAMS.skills.sk_knot.tpGain);
        $dataSkills[IDS.skills.sk_blood]  = createBaseSkill(IDS.skills.sk_blood, TEXTS.skills.sk_blood.name, TEXTS.skills.sk_blood.desc, ICONS.sk_blood, ANIMATIONS.sk_blood, 11, 1, null, 10, [{code: 21, dataId: IDS.states.counter, value1: 1, value2: 0}]);
        $dataSkills[IDS.skills.sk_super]  = createBaseSkill(IDS.skills.sk_super, TEXTS.skills.sk_super.name, TEXTS.skills.sk_super.desc, ICONS.sk_super, ANIMATIONS.sk_super, 1, PARAMS.skills.sk_super.repeats, PARAMS.skills.sk_super.formula, PARAMS.skills.sk_super.tpGain);
        
        $dataSkills[IDS.skills.sk_blood].speed = 1000; 
        $dataSkills[IDS.skills.sk_blood].mpCost = 30; // 賦予熱血沸騰 30 MP 消耗

        $dataSkills[IDS.skills.sk_knot].hitType = 0;
        if ($dataSkills[IDS.skills.sk_knot].damage) $dataSkills[IDS.skills.sk_knot].damage.type = 1;

        $dataSkills[IDS.skills.sk_super].hitType = 0;
        if ($dataSkills[IDS.skills.sk_super].damage) $dataSkills[IDS.skills.sk_super].damage.type = 1;

        $dataWeapons[IDS.weapon] = {
            id: IDS.weapon, name: TEXTS.weapon.name, description: TEXTS.weapon.desc, iconIndex: ICONS.weapon, 
            wtypeId: 13, etypeId: 1, price: 0, params: PARAMS.weaponStats,
            animationId: 0, 
            traits: [
                {code: 41, dataId: 1, value: 1}, 
                {code: 43, dataId: IDS.skills.sk_2slash, value: 1},
                {code: 43, dataId: IDS.skills.sk_3slash, value: 1},
                {code: 43, dataId: IDS.skills.sk_knot, value: 1},
                {code: 43, dataId: IDS.skills.sk_blood, value: 1},
                {code: 43, dataId: IDS.skills.sk_super, value: 1}
            ], note: "", meta: {}
        };

        const extractModMeta = (item) => {
            if (item && item.note) DataManager.extractMetadata(item);
        };

        for (let i = IDS.states.tiger; i <= maxStateId; i++) if ($dataStates[i]) extractModMeta($dataStates[i]);
        for (let i = IDS.skills.sk_2slash; i <= maxSkillId; i++) if ($dataSkills[i]) extractModMeta($dataSkills[i]);
        extractModMeta($dataWeapons[IDS.weapon]);
    };

    // === 技能目標判定輔助 ===
    // 修正：虎標彈狀態絕對單體；猛虎標彈狀態下，當 0 < 猛虎標彈數量 <= 技能消耗數時，才觸發全體攻擊
    const checkAmmoForTargetAll = function(actor, skillId) {
        if (!actor || !actor._tianTui) return false;

        // 虎標彈狀態或猛虎標彈歸零時：絕對單體
        if (actor._tianTui.fierce <= 0) return false;

        let requiredAmmo = -1;
        if (skillId === IDS.skills.sk_2slash) requiredAmmo = 1;
        else if (skillId === IDS.skills.sk_3slash) requiredAmmo = 2;
        else if (skillId === IDS.skills.sk_knot) requiredAmmo = 3;
        else if (skillId === IDS.skills.sk_super) requiredAmmo = 3;

        if (requiredAmmo === -1) return false;

        // 猛虎標彈時：正常為單體。當 0 < 猛虎標彈數量 <= 技能需要的子彈數 時，變為全體攻擊
        return actor._tianTui.fierce > 0 && actor._tianTui.fierce <= requiredAmmo;
    };

    const _Window_Help_setItem = Window_Help.prototype.setItem;
    Window_Help.prototype.setItem = function(item) {
        if (item && DataManager.isSkill(item)) {
            let desc = item.description;
            let sId = item.id;
            if (sId === IDS.skills.sk_2slash || sId === IDS.skills.sk_3slash || 
                sId === IDS.skills.sk_knot || sId === IDS.skills.sk_super) {
                let actor = BattleManager.actor() || ($gameParty ? $gameParty.menuActor() : null);
                if (actor && actor._tianTui) {
                    if (checkAmmoForTargetAll(actor, sId)) {
                        desc = desc.replace("對單體敵人發動", "對全體敵人發動");
                    } else {
                        desc = desc.replace("對全體敵人發動", "對單體敵人發動");
                    }
                }
            }
            const tempItem = Object.assign({}, item, { description: desc });
            _Window_Help_setItem.call(this, tempItem);
            return;
        }
        _Window_Help_setItem.call(this, item);
    };

    // === 戰鬥初始化與回合結束處理 ===
    const _Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
    Game_Battler.prototype.onBattleStart = function() {
        _Game_Battler_onBattleStart.call(this);
        this._tianTuiStacks = {};
        this._tianTuiStacks[IDS.states.burn] = 0;
        this._tianTuiStacks[IDS.states.tremor] = 0;
        this._tianTuiStacks[IDS.states.scorch] = 0;

        if (this.isActor() && this.hasWeapon($dataWeapons[IDS.weapon])) {
            this._tianTui = { tiger: PARAMS.mechanics.startTigerAmmo, fierce: 0, consumed: 0, cooldowns: {}, pendingTigerClear: false };
            this.addState(IDS.states.tiger); 
            this.addState(IDS.states.winged);
            this.addState(IDS.states.leap);  
            this.checkTianTuiStates();
        }
    };

    const _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
    Game_Battler.prototype.onTurnEnd = function() {
        _Game_Battler_onTurnEnd.call(this);
        
        if (this._tianTui && this._tianTui.pendingTigerClear) {
            let count = this._tianTui.tiger;
            if (count > 0) {
                this._tianTui.tiger = 0;
                if (BattleManager._logWindow) {
                    BattleManager._logWindow.push('addText', `\\C[16]熱血沸騰！捨棄了剩餘的 \\C[2]${count}\\C[16] 顆「虎標彈」\\C[0]`);
                }
            }
            this._tianTui.pendingTigerClear = false;
        }

        // 虎標彈歸零後，直到回合結束才裝填猛虎標彈並轉化為天退星
        if (this._tianTui && this.isStateAffected(IDS.states.winged)) {
            if (this._tianTui.tiger === 0 && this.hp > 0) {
                this.removeState(IDS.states.winged);
                this._tianTui.fierce = PARAMS.mechanics.fierceAmmoGain;
                this.addState(IDS.states.heaven);
                if (BattleManager._logWindow) {
                    BattleManager._logWindow.push('addText', `\\C[16]虎標彈用盡！裝填了 \\C[2]${PARAMS.mechanics.fierceAmmoGain}\\C[16] 顆「猛虎標彈」並獲得「天退星」\\C[0]`);
                }
            }
        }

        this.checkTianTuiStates();

        if (this.hp > 0 && this._tianTuiStacks) {
            let burn = this._tianTuiStacks[IDS.states.burn] || 0;
            let scorch = this._tianTuiStacks[IDS.states.scorch] || 0;
            if (burn > 0 || scorch > 0) {
                let totalPct = (burn + scorch) * 0.01;
                totalPct = Math.min(totalPct, 0.15); // 限制總扣除比例最高 15%
                let dmg = Math.floor(this.mhp * totalPct);
                if (dmg > 0) {
                    let names = [];
                    if (burn > 0) names.push("燒傷");
                    if (scorch > 0) names.push("震顫-灼熱");
                    let causeName = names.join("與");

                    if (BattleManager._logWindow) {
                        BattleManager._logWindow.push('addText', `\\C[14]${causeName}\\C[0]造成 \\C[2]${dmg}\\C[0] 點傷害`);
                        BattleManager._logWindow.push('performCustomDamage', this, dmg);
                    } else {
                        this.gainHp(-dmg);
                        if (this.hp <= 0) this.performCollapse();
                    }
                }
            }
        }

        if (this._tianTui && this._tianTui.cooldowns) {
            for (let id in this._tianTui.cooldowns) {
                if (this._tianTui.cooldowns[id] > 0) this._tianTui.cooldowns[id]--;
            }
        }
    };

    const _Game_Battler_makeActions = Game_Battler.prototype.makeActions;
    Game_Battler.prototype.makeActions = function() {
        _Game_Battler_makeActions.call(this);
        if (this.isStateAffected(IDS.states.counter)) this.removeState(IDS.states.counter);
    };

    // === 狀態連動與動態說明生成區 ===
    Game_Battler.prototype.checkTianTuiStates = function() {
        if (!this._tianTui) return;
        
        if (this._tianTui.tiger > 0) { if (!this.isStateAffected(IDS.states.tiger)) this.addState(IDS.states.tiger); }
        else { if (this.isStateAffected(IDS.states.tiger)) this.removeState(IDS.states.tiger); }

        if (this._tianTui.fierce > 0) { if (!this.isStateAffected(IDS.states.fierce)) this.addState(IDS.states.fierce); }
        else { if (this.isStateAffected(IDS.states.fierce)) this.removeState(IDS.states.fierce); }

        this._tianTuiStacks = this._tianTuiStacks || {};
        this._tianTuiStacks[IDS.states.tiger] = this._tianTui.tiger;
        this._tianTuiStacks[IDS.states.fierce] = this._tianTui.fierce;
        
        if (this.hp === 0 && this.isStateAffected(IDS.states.winged)) {
            this.removeState(IDS.states.winged);
        }

        if (this.isStateAffected(IDS.states.heaven) && this._tianTui.consumed >= PARAMS.mechanics.transformReq) {
            this.removeState(IDS.states.heaven);
            this.addState(IDS.states.heart);
        }

        if (this._tianTui.fierce === 0 && !this.isStateAffected(IDS.states.winged) && this._tianTui.consumed > 0) {
            if (!this.isStateAffected(IDS.states.overheat)) this.addState(IDS.states.overheat);
        }

        if ($dataStates[IDS.states.tiger] && $dataStates[IDS.states.tiger].meta) {
            $dataStates[IDS.states.tiger].meta.説明 = `\\C[14]攻擊力 ${Math.round(PARAMS.states.tiger.atkRate * 100)}%\\C[0]\n當前剩餘：\\C[2]${this._tianTui.tiger}\\C[0] 顆虎標彈`;
        }
        if ($dataStates[IDS.states.fierce] && $dataStates[IDS.states.fierce].meta) {
            $dataStates[IDS.states.fierce].meta.説明 = `\\C[14]攻擊力 ${Math.round(PARAMS.states.fierce.atkRate * 100)}%\\C[0]\n當前剩餘：\\C[2]${this._tianTui.fierce}\\C[0] 顆猛虎標彈`;
        }
        
        // --- 過熱狀態動態文字生成 ---
        if ($dataStates[IDS.states.overheat] && $dataStates[IDS.states.overheat].meta) {
            let ov = PARAMS.states.overheat;
            let consumed = this._tianTui.consumed;
            let desc = `\\C[0]當前累積消耗：\\C[2]${consumed}\\C[0] 顆彈藥\n`;
            
            if (consumed >= ov.threshold1) {
                let maxReduc = Math.round(ov.t1_damageReductionMax * 100);
                desc += `\\C[0]已損失體力每10%增加5%減傷(最多${maxReduc}%)\n`;
            }
            if (consumed >= ov.threshold2) {
                let baseBoost = Math.round(ov.t2_damageBoostBase * 100);
                let maxBoost = Math.round(ov.t2_damageBoostMax * 100);
                desc += `\\C[14]造成傷害提升+(${baseBoost}+已損失體力比例)%(最多${maxBoost}%)\n`;
            }
            if (consumed >= ov.threshold3) {
                let maxDmgBoost = Math.round(ov.t3_damageBoostMax * 100);
                desc += `\\C[2]對剩餘體力比例高於自身的目標造成的傷害+(體力比例差)%(最多+${maxDmgBoost}%)\n`;
            }
            
            if (consumed >= ov.threshold1) {
                desc += `\\C[0](多條效果不互斥)`;
            }
            
            $dataStates[IDS.states.overheat].meta.説明 = desc;
        }
    };

    const _Game_Battler_refresh = Game_Battler.prototype.refresh;
    Game_Battler.prototype.refresh = function() {
        _Game_Battler_refresh.call(this);
        if (this.hp === 0) this.checkTianTuiStates();
    };

    // ==========================================
    // 修正：在攔截技能發動範圍時，排除對自身施放的技能
    // ==========================================
    const _Game_Action_checkItemScope = Game_Action.prototype.checkItemScope;
    Game_Action.prototype.checkItemScope = function(list) {
        if (this.isSkill() && this.subject() && this.subject()._tianTui) {
            let subject = this.subject();
            let sId = this.item().id;
            
            // 修正點：只有這四招攻擊技能才需要判斷「單體/全體」的變化，排除針對自己的技能 (如 sk_blood)
            if (sId === IDS.skills.sk_2slash || sId === IDS.skills.sk_3slash || 
                sId === IDS.skills.sk_knot || sId === IDS.skills.sk_super) {
                
                if (checkAmmoForTargetAll(subject, sId)) {
                    return list.includes(2);
                } else {
                    return list.includes(1);
                }
            }
        }
        return _Game_Action_checkItemScope.call(this, list);
    };

    const _Game_Actor_skills = Game_Actor.prototype.skills;
    Game_Actor.prototype.skills = function() {
        let list = _Game_Actor_skills.call(this);
        if (this._tianTui) {
            if (this._tianTui.fierce > 0) {
                list = list.filter(s => s && s.id !== IDS.skills.sk_knot);
                if (!list.find(s => s && s.id === IDS.skills.sk_super)) list.push($dataSkills[IDS.skills.sk_super]);
            } else {
                list = list.filter(s => s && s.id !== IDS.skills.sk_super);
                if (!list.find(s => s && s.id === IDS.skills.sk_knot)) list.push($dataSkills[IDS.skills.sk_knot]);
            }
        }
        return list;
    };

    const _Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
    Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
        if (!_Game_BattlerBase_meetsSkillConditions.call(this, skill)) return false;
        if (this._tianTui && skill) {
            if (this._tianTui.cooldowns[skill.id] > 0) return false;
        }
        return true;
    };

    // === 技能發動判定區 ===
    const _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        const subject = this._subject;
        const action = subject ? subject.currentAction() : null;
        if (subject && subject._tianTui && action && action.isSkill()) {
            const sId = action.item().id;
            if (sId === IDS.skills.sk_knot) {
                if (subject._tianTui.tiger > 0) {
                    action._hadTigerForKnot = true;
                }
            }
            if (sId === IDS.skills.sk_super) { 
                if (subject._tianTui.fierce === 0) { 
                    action.setSkill(IDS.skills.sk_knot);
                    if (!action._targetIndex || action._targetIndex < 0) action._targetIndex = 0;
                    if (subject._tianTui.tiger > 0) {
                        action._hadTigerForKnot = true;
                    }
                } else {
                    if (subject._tianTui.fierce > 0) {
                        action._hadFierceForSuper = true;
                    }
                }
            }
        }
        _BattleManager_startAction.call(this);
    };

    const _Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        _Game_Battler_useItem.call(this, item);
        if (DataManager.isSkill(item) && this._tianTui) {
            let sId = item.id;
            if (sId === IDS.skills.sk_3slash) { 
                this._tianTui.cooldowns[sId] = PARAMS.skills.sk_3slash.cooldown; 
            } else if (sId === IDS.skills.sk_knot) { 
                this._tianTui.cooldowns[sId] = PARAMS.skills.sk_knot.cooldown; 
            } else if (sId === IDS.skills.sk_blood) { 
                this._tianTui.pendingTigerClear = true;
            }
        }
    };

    Game_Battler.prototype.addTianTuiStack = function(stateId, amount) {
        if (!this._tianTuiStacks) this._tianTuiStacks = {};
        this._tianTuiStacks[stateId] = (this._tianTuiStacks[stateId] || 0) + amount;
        if (this._tianTuiStacks[stateId] < 0) this._tianTuiStacks[stateId] = 0;
        
        if (this._tianTuiStacks[stateId] > 0) {
            if (!this.isStateAffected(stateId)) this.addState(stateId);
        } else {
            if (this.isStateAffected(stateId)) this.removeState(stateId);
        }
    };

    Game_Battler.prototype.getTianTuiStack = function(stateId) {
        if (!this._tianTuiStacks) this._tianTuiStacks = {};
        return this._tianTuiStacks[stateId] || 0;
    };

    Game_Battler.prototype.detonateTremor = function(times) {
        let totalDamage = 0;
        let baseDamage = PARAMS.mechanics.tremorBaseDmg; 
        for (let i = 0; i < times; i++) {
            let tremor = this.getTianTuiStack(IDS.states.tremor);
            let scorch = this.getTianTuiStack(IDS.states.scorch);
            let totalStacks = tremor + scorch;
            
            if (totalStacks > 0) {
                totalDamage += totalStacks * baseDamage;
                if (tremor > 0) this.addTianTuiStack(IDS.states.tremor, -1);
                else if (scorch > 0) this.addTianTuiStack(IDS.states.scorch, -1);
            }
        }
        return totalDamage;
    };

    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        if (!this._tianTuiHitCounts) this._tianTuiHitCounts = {};
        let tId = target.isActor() ? "actor" + target.actorId() : "enemy" + target.index();
        this._tianTuiHitCounts[tId] = (this._tianTuiHitCounts[tId] || 0) + 1;
        
        let hitIndex = this._tianTuiHitCounts[tId];
        this._tianTuiIsLastHit = (hitIndex === this.numRepeats());

        let subject = this.subject();
        if (this.isSkill() && subject && subject._tianTui && target.isAlive() && target.hp > 0) {
            let sId = this.item().id;
            if (!this._consumedBulletsForHit) this._consumedBulletsForHit = new Set();
            
            if (!this._consumedBulletsForHit.has(hitIndex)) {
                let cost = 0;
                if (sId === IDS.skills.sk_2slash && hitIndex === 2) cost = 1;
                if (sId === IDS.skills.sk_3slash && (hitIndex === 2 || hitIndex === 3)) cost = 1;
                if (sId === IDS.skills.sk_knot) cost = 1; 
                if (sId === IDS.skills.sk_super && (hitIndex >= 3 && hitIndex <= 5)) cost = 1;
                
                if (cost > 0) {
                    let actualConsumed = 0;
                    let ammoName = "";
                    if (sId === IDS.skills.sk_super) {
                        if (subject._tianTui.fierce > 0) {
                            subject._tianTui.fierce--;
                            actualConsumed = 1;
                            ammoName = "猛虎標彈";
                            this._hadFierceForSuper = true;
                        }
                    } else {
                        if (subject._tianTui.tiger > 0) {
                            subject._tianTui.tiger--;
                            actualConsumed = 1;
                            ammoName = "虎標彈";
                            this._hadTigerForKnot = true;
                        } else if (subject._tianTui.fierce > 0) {
                            subject._tianTui.fierce--;
                            actualConsumed = 1;
                            ammoName = "猛虎標彈";
                        }
                    }
                    
                    if (actualConsumed > 0) {
                        subject._tianTui.consumed += actualConsumed;
                        subject.checkTianTuiStates();
                        if (BattleManager._logWindow) {
                            BattleManager._logWindow.push('addText', `\\C[16]消耗了 \\C[2]${actualConsumed}\\C[16] 顆「${ammoName}」\\C[0]`);
                        }
                    }
                }
                this._consumedBulletsForHit.add(hitIndex);
            }
        }
        _Game_Action_apply.call(this, target);
    };

    // === 傷害計算邏輯區 ===
    const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        let value = _Game_Action_makeDamageValue.call(this, target, critical);
        if (this.isSkill() && value > 0) {
            let subject = this.subject();
            let sId = this.item().id;
            let mult = 1.0;
            
            // 快刀亂麻 & 超絕猛虎殺擊亂斬：目標燒傷+震顫+震顫-灼熱 >= 8 額外 +20% 傷害
            if (sId === IDS.skills.sk_knot || sId === IDS.skills.sk_super) {
                let burn = target.getTianTuiStack(IDS.states.burn);
                let tremor = target.getTianTuiStack(IDS.states.tremor);
                let scorch = target.getTianTuiStack(IDS.states.scorch);
                if ((burn + tremor + scorch) >= 8) {
                    mult *= 1.20;
                }
            }
            
            // 快刀亂麻：持有虎標彈時，第三段攻擊傷害 +50%
            if (sId === IDS.skills.sk_knot) {
                let tId = target.isActor() ? "actor" + target.actorId() : "enemy" + target.index();
                let hitIndex = (this._tianTuiHitCounts && this._tianTuiHitCounts[tId]) || 1;
                if (hitIndex === 3) {
                    if (this._hadTigerForKnot) {
                        mult *= 1.50;
                    }
                }
            }

            // 過熱層數閾值 2 與 3，改為提供「最終傷害乘區」
            if (subject.isStateAffected(IDS.states.overheat) && subject._tianTui) {
                let ov = PARAMS.states.overheat;
                let consumed = subject._tianTui.consumed;
                
                // 閾值 2：依照已損失生命比例增加傷害
                if (consumed >= ov.threshold2) {
                    let lostHpPct = 1.0 - (subject.hp / subject.mhp);
                    let bonus2 = Math.min(ov.t2_damageBoostMax, ov.t2_damageBoostBase + lostHpPct);
                    mult *= (1.0 + bonus2);
                }

                // 閾值 3：現有生命比對方低時增加傷害
                if (consumed >= ov.threshold3) {
                    let subHpPct = subject.hp / subject.mhp;
                    let tarHpPct = target.hp / target.mhp;
                    if (tarHpPct > subHpPct) {
                        let diff = tarHpPct - subHpPct;
                        let bonus3 = Math.min(ov.t3_damageBoostMax, diff);
                        mult *= (1.0 + bonus3);
                    }
                }
            }

            // 心-天退星 與 天退星 敏捷差傷害加成 (兩者互斥，心-天退星優先)
            if (subject.isStateAffected(IDS.states.heart)) {
                let agiDiff = Math.max(0, subject.agi - target.agi);
                let bonus = Math.min(0.40, agiDiff * 0.05); // 每點 5%，最高 40%
                mult *= (1.0 + bonus);
            } else if (subject.isStateAffected(IDS.states.heaven)) {
                let agiDiff = Math.max(0, subject.agi - target.agi);
                let bonus = Math.min(0.20, agiDiff * 0.025); // 每點 2.5%，最高 20%
                mult *= (1.0 + bonus);
            }
            
            value = Math.floor(value * mult);
        }
        return value;
    };

    const _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
    Game_Action.prototype.executeDamage = function(target, value) {
        let ov = PARAMS.states.overheat;
        let subject = this.subject();
        
        // 過熱層數閾值 1：依照損失血量比例提供動態減傷
        if (target.isStateAffected(IDS.states.overheat) && target._tianTui && target._tianTui.consumed >= ov.threshold1) {
            let lostHpPct = 1.0 - (target.hp / target.mhp);
            let reduction = Math.min(ov.t1_damageReductionMax, lostHpPct * 0.5); // 現有生命每減少10%增加5%減傷，受限於自定義的最大值
            value = Math.floor(value * (1.0 - reduction));
        }

        let detCount = 0;
        if (this.isSkill() && this._tianTuiIsLastHit) {
            let skillId = this.item().id;
            
            // 計算 天退星 / 心-天退星 賦予震顫的額外層數
            let extraTremor = 0;
            if (subject.isStateAffected(IDS.states.heart)) {
                extraTremor = 2;
            } else if (subject.isStateAffected(IDS.states.heaven)) {
                extraTremor = 1;
            }

            if (skillId === IDS.skills.sk_2slash) {
                target.addTianTuiStack(IDS.states.burn, 2);
                target.addTianTuiStack(IDS.states.tremor, 3 + extraTremor);
            } else if (skillId === IDS.skills.sk_3slash) {
                target.addTianTuiStack(IDS.states.burn, 4);
                target.addTianTuiStack(IDS.states.tremor, 5 + extraTremor);
                if (target.getTianTuiStack(IDS.states.tremor) + target.getTianTuiStack(IDS.states.scorch) >= 3) {
                    detCount = 1;
                }
            } else if (skillId === IDS.skills.sk_knot) {
                target.addTianTuiStack(IDS.states.burn, 6);
                target.addTianTuiStack(IDS.states.tremor, 6 + extraTremor);
                let curTremor = target.getTianTuiStack(IDS.states.tremor);
                if (curTremor > 0) {
                    target.addTianTuiStack(IDS.states.scorch, curTremor);
                    target.addTianTuiStack(IDS.states.tremor, -curTremor);
                }
                detCount = this._hadTigerForKnot ? 2 : 1;
            } else if (skillId === IDS.skills.sk_super) {
                target.addTianTuiStack(IDS.states.burn, 6);
                target.addTianTuiStack(IDS.states.tremor, 6 + extraTremor);
                let curTremor = target.getTianTuiStack(IDS.states.tremor);
                if (curTremor > 0) {
                    target.addTianTuiStack(IDS.states.scorch, curTremor);
                    target.addTianTuiStack(IDS.states.tremor, -curTremor);
                }
                detCount = this._hadFierceForSuper ? 2 : 1;
            }
        }
        
        _Game_Action_executeDamage.call(this, target, value);

        // 震顫引爆與自定義專屬音效
        if (detCount > 0) {
            if (BattleManager._logWindow) {
                BattleManager._logWindow.push('performTremorSound');
            }
            for (let i = 0; i < detCount; i++) {
                let detDmg = target.detonateTremor(1);
                if (detDmg > 0 && BattleManager._logWindow) {
                    BattleManager._logWindow.push('addText', `\\C[14]震顫引爆！！！\\C[0]造成 \\C[2]${detDmg}\\C[0] 點傷害`);
                    BattleManager._logWindow.push('performCustomDamage', target, detDmg);
                    BattleManager._logWindow.push('wait');
                }
            }
        }
    };

    if (typeof Window_BattleLog !== "undefined") {
        Window_BattleLog.prototype.performCustomDamage = function(target, damage) {
            if (!target.isDead()) {
                target.clearResult();
                target.gainHp(-damage);
                target.startDamagePopup();
                if (target.hp <= 0) {
                    target.addState(target.deathStateId());
                    target.performCollapse();
                }
            }
        };
        Window_BattleLog.prototype.performTremorSound = function() {
            AudioManager.playSe({ 
                name: TIAN_MOD.se.tremorBurst.name, 
                volume: TIAN_MOD.se.tremorBurst.volume, 
                pitch: TIAN_MOD.se.tremorBurst.pitch, 
                pan: 0 
            });
        };
    }

    const _Game_BattlerBase_paramRate = Game_BattlerBase.prototype.paramRate;
    Game_BattlerBase.prototype.paramRate = function(paramId) {
        let rate = _Game_BattlerBase_paramRate.call(this, paramId);
        return rate;
    };

    // === 動畫與 BGM 處理區 ===
    const _Window_BattleLog_showAnimation = Window_BattleLog.prototype.showAnimation;
    Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId) {
        if (Array.isArray(animationId)) { 
            for (const animId of animationId) {
                this.showNormalAnimation(targets, animId, false);
                this.push("waitForEffect"); 
            }
        } else {
            _Window_BattleLog_showAnimation.call(this, subject, targets, animationId);
        }
    };

    const checkAndGrantTianTuiXing = () => {
        const weaponId = IDS.weapon;
        const weapon = $dataWeapons[weaponId];
        if (!$gameParty || !weapon) return;

        if ($gameParty.numItems(weapon) > 0) return;

        if ($gameActors && $gameActors._data) {
            for (const actor of $gameActors._data) {
                if (actor && actor.hasWeapon(weapon)) {
                    return;
                }
            }
        }
        $gameParty.gainItem(weapon, 1);
    };

    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.call(this);
        checkAndGrantTianTuiXing();
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        checkAndGrantTianTuiXing();
    };

    const isWeaponEquipped = function() {
        if (!$gameParty) return false;
        return $gameParty.battleMembers().some(actor => {
            return actor.weapons().some(weapon => weapon && weapon.id === IDS.weapon);
        });
    };

    const checkAndUpdateBattleBgm = function() {
        if (!$gameParty.inBattle()) return;

        const isEquipped = isWeaponEquipped();
        const currentBgm = AudioManager._currentBgm;
        const systemBattleBgm = $gameSystem.battleBgm();

        if (isEquipped) {
            if (!currentBgm || currentBgm.name !== BGM.name) {
                const customBgm = {
                    name: BGM.name,
                    volume: systemBattleBgm ? systemBattleBgm.volume : BGM.volume,
                    pitch: BGM.pitch,
                    pan: 0
                };
                AudioManager.playBgm(customBgm);
            }
        } else {
            if (currentBgm && currentBgm.name === BGM.name) {
                AudioManager.playBgm(systemBattleBgm);
            }
        }
    };

    const _BattleManager_playBattleBgm = BattleManager.playBattleBgm;
    BattleManager.playBattleBgm = function() {
        if (isWeaponEquipped()) {
            const systemBattleBgm = $gameSystem.battleBgm();
            const customBgm = {
                name: BGM.name,
                volume: systemBattleBgm ? systemBattleBgm.volume : BGM.volume,
                pitch: BGM.pitch,
                pan: 0
            };
            AudioManager.playBgm(customBgm);
        } else {
            _BattleManager_playBattleBgm.call(this);
        }
    };

    const _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        if ($gameParty.inBattle()) checkAndUpdateBattleBgm();
    };

    const _Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
    Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
        _Game_Actor_forceChangeEquip.call(this, slotId, item);
        if ($gameParty.inBattle()) checkAndUpdateBattleBgm();
    };

})();
