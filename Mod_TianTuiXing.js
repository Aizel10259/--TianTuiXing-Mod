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
 * @help
 * 採用動態註冊的方式，不需修改原本的 json 檔案。
 * 直接在插件管理器啟用即可生效。
 * 
 * ==========================================
 * 玩家自訂指南：
 * ==========================================
 * 請向下滑動，找到 【模組核心設定區 (TIAN_MOD)】。
 * 所有的數值（攻擊力、傷害、圖示、ID、彈藥數量、專屬音樂）都在那裡！
 * 只要修改裡面的數字或文字，存檔後進遊戲就會直接生效，
 * 所有技能與狀態的說明文字都會自動轉為百分比並即時連動浮動！
 * 
 * ★ BGM 切換機制：
 * 進入戰鬥時，若隊伍中有成員裝備指定武器，將自動切換為專屬 BGM。
 * 支援戰鬥中動態換裝：裝上武器立刻變更 BGM，卸下武器則切回預設戰鬥 BGM。
 */

(() => {
    // =====================================================================
    // =====================================================================
    // 【模組核心設定區 (TIAN_MOD)】
    // 所有的客製化內容都在這裡！請安心在這裡修改數值。
    // =====================================================================
    // =====================================================================
    const TIAN_MOD = {
        
        // -----------------------------------------------------------------
        // 1. 佔用的 ID 設定 (如果在遊戲中與其他模組衝突，可以在這裡改)
        // -----------------------------------------------------------------
        ids: {
            weapon: 530,       // 天退星刀的武器 ID
            skills: {
                sk_2slash: 530, // 二連斬-爆 ID
                sk_3slash: 531, // 三連擊-爆 ID
                sk_knot: 532,   // 快刀亂麻 ID
                sk_blood: 533,  // 令人熱血沸騰 ID
                sk_super: 535   // 超絕猛虎殺擊亂斬 ID
            },
            states: {
                tiger: 530,     // 虎標彈 ID
                winged: 531,    // 插翅虎 ID
                leap: 532,      // 猛虎暴躍 ID
                fierce: 533,    // 猛虎標彈 ID
                heart: 534,     // 心-天退星 ID
                heaven: 535,    // 天退星 ID
                overheat: 536,  // 過熱 ID
                burn: 537,      // 燒傷 ID
                tremor: 538,    // 震顫 ID
                scorch: 539,    // 震顫-灼熱 ID
                counter: 540    // 反擊狀態 ID
            }
        },

        // -----------------------------------------------------------------
        // 2. 圖示與動畫設定
        // -----------------------------------------------------------------
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
            sk_blood: 51,      sk_super: [69, 23] // 陣列代表連續播放多個特效
        },

        // -----------------------------------------------------------------
        // 3. 戰鬥專屬 BGM 設定 (音頻設定)
        // -----------------------------------------------------------------
        bgm: {
            name: "Mod_Lei_Heng_Theme", // 音樂檔案名稱 (需放置於 audio/bgm/ 下，不含副檔名)
            volume: 90,                 // 若系統未設定預設戰鬥音量，則使用此預設音量
            pitch: 100                  // 音調 (預設 100)
        },

        // -----------------------------------------------------------------
        // 4. 戰鬥數值與平衡設定 (最重要的區域)
        // -----------------------------------------------------------------
        params: {
            // [武器本身能力值] 
            // 順序: [最大HP, 最大MP, 攻擊力, 防禦力, 魔法攻擊, 魔法防禦, 敏捷, 幸運]
            weaponStats: [0, 0, 200, 0, 0, 0, 100, 0], 
            
            // [技能傷害與數值] 
            // repeats = 攻擊次數, tpGain = 獲得TP, cooldown = 冷卻回合
            // formula = 傷害公式 (a.atk 代表攻擊者攻擊力，b.def 代表目標防禦力)
            skills: {
                sk_2slash: { repeats: 2, tpGain: 0, formula: "a.atk * 2 - b.def" },
                sk_3slash: { repeats: 3, tpGain: 0, formula: "a.atk * 2.5 - b.def", cooldown: 2 },
                sk_knot:   { repeats: 3, tpGain: 0, formula: "a.atk * 3 - b.def", cooldown: 3 },
                sk_super:  { repeats: 5, tpGain: 0, formula: "a.atk * 3.5 - b.def" }
            },

            // [狀態加成倍率] (1.1 代表 110%，1.2 代表 120%)
            states: {
                tiger:  { atkRate: 1.1 }, // 虎標彈: 攻擊力 110%
                leap:   { atkRate: 1.1 }, // 猛虎暴躍: 攻擊力 110%
                fierce: { atkRate: 1.2 }, // 猛虎標彈: 攻擊力 120%
                heaven: { atkRate: 1.2, agiRate: 1.1 }, // 天退星: 攻擊120%, 敏捷110%
                heart:  { atkRate: 1.4, agiRate: 1.3 }, // 心-天退星: 攻擊140%, 敏捷130%
                
                // 過熱的 3 個階段設定
                overheat: {
                    threshold1: 8,  dmgTakenRate: 0.5, // 第一階: 累積8顆，受傷減半(50%)
                    threshold2: 14, atkRate2: 2.5,     // 第二階: 累積14顆，攻擊力 250%
                    threshold3: 20, atkRate3: 1.5      // 第三階: 累積20顆，攻擊力 150%
                }
            },

            // [核心機制設定]
            mechanics: {
                startTigerAmmo: 12,    // 戰鬥開始時給予幾顆「虎標彈」
                fierceAmmoGain: 8,     // 虎標彈耗盡後，給予幾顆「猛虎標彈」
                transformReq: 8,       // 消耗幾顆彈藥後，「天退星」會進化成「心-天退星」
                tremorBaseDmg: 100     // 「震顫」被引爆時，每一層造成的固定傷害
            }
        },

        // -----------------------------------------------------------------
        // 5. 文本敘述設定 (動態標籤說明：系統會自動抓取上方自訂數值轉為 % 或數字)
        // -----------------------------------------------------------------
        texts: {
            weapon: { 
                name: "天退星刀", 
                desc: "\\C[14]可使用「二連斬-爆」、「三連擊-爆」、「快刀亂麻」\\C[14]\n「令人熱血沸騰」、「超絕猛虎殺擊亂斬」\\C[0]\n雖然必須隱瞞這把天退星刀的名號略微有些可惜……\\C[0]\n但既然它能如插翅之虎一般咆哮，那如此倒也足夠。" 
            },
            skills: {
                sk_2slash: { name: "二連斬-爆", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予敵方「燒傷」、「震顫」\n\\C[14]消耗1顆「虎標彈」或「猛虎標彈」\\C[0]\n接一招試試吧？" },
                sk_3slash: { name: "三連擊-爆", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予敵方「燒傷」、「震顫」\n\\C[14]消耗2顆「虎標彈」或「猛虎標彈」\\C[0]\n\\C[2]*%COOLDOWN% 回合後可再次使用\\C[0]\n再那樣呆站著，腦袋可要落地了。" },
                sk_knot:   { name: "快刀亂麻", desc: "武器技能\n\\C[14]對單體敵人發動 %REPEATS% 次攻擊，並賦予敵方「燒傷」、「震顫」\n\\C[14]消耗3顆「虎標彈」或剩餘彈藥 (無視迴避與反擊)\\C[0]\n\\C[2]*%COOLDOWN% 回合後可再次使用\\C[0]\n全彈發射！" },
                sk_blood:  { name: "令人熱血沸騰", desc: "武器技能\n\\C[14]直到下次行動，反擊率100%\n\\C[14]如果持有「虎標彈」則在使用技能後清零\\C[0]\n獵物嗎。令人……熱血沸騰啊。" },
                sk_super:  { name: "超絕猛虎殺擊亂斬", desc: "武器技能\n\\C[14]對全體敵人發動 %REPEATS% 次攻擊，並賦予敵方「燒傷」、「震顫」\n\\C[14]消耗最多3顆「猛虎標彈」 (無視迴避與反擊)\\C[2]\n想擒虎嗎。那就做好被咬死的覺悟吧。\\C[0]\n我，雷克西斯。拇指的指揮官，東部十劍之一。將全力與你戰鬥。" }
            },
            states: {
                tiger:    { name: "虎標彈", note: "<説明:\\C[14]攻擊力 %ATK%\\C[0]\n戰鬥開始時，有裝填 %START_AMMO% 顆虎標彈。>" },
                winged:   { name: "插翅虎", note: "<説明:\\C[0]若消耗了自身所有虎標彈，使自身裝填 %FIERCE_AMMO% 顆猛虎標彈並獲得天退星。\n\\C[14]若累積消耗彈藥達 %TRANS_REQ% 顆，則轉化為心-天退星。\n\\C[2]消耗最後的猛虎標彈時，獲得過熱。>" },
                leap:     { name: "猛虎暴躍", note: "<説明:\\C[14]攻擊力 %ATK%>" },
                fierce:   { name: "猛虎標彈", note: "<説明:\\C[14]攻擊力 %ATK%>" },
                heart:    { name: "心-天退星", note: "<説明:\\C[14]攻擊力 %ATK%, 敏捷性 %AGI%>" },
                heaven:   { name: "天退星", note: "<説明:\\C[14]攻擊力 %ATK%, 敏捷性 %AGI%>" },
                overheat: { name: "過熱", note: "<説明:\\C[0]當前累積消耗：\\C[2]0\\C[0] 顆彈藥\n\\C[0]當累積消耗總和不小於 %THRES1% 時，受到的傷害 %DMG_TAKEN%\n\\C[14]當累積消耗總和不小於 %THRES2% 時，攻擊力 %ATK2%\n\\C[2]當累積消耗總和不小於 %THRES3% 時，攻擊力 %ATK3%\n\\C[0](三條效果不互斥)>" },
                burn:     { name: "燒傷", note: "<説明:\\C[14]每疊加N層，使自身HP再生率-N%>" },
                tremor:   { name: "震顫", note: "<説明:\\C[14]受到引爆時，每層造成 %BASE_DMG% 點固定傷害。>" },
                scorch:   { name: "震顫-灼熱", note: "<説明:\\C[14]每疊加N層，使自身HP再生率-N%>" },
                counter:  { name: "令人熱血沸騰(反擊)", note: "<説明:\\C[14]使自身反擊率100%>" }
            }
        }
    };
    // =====================================================================
    // =設定區結束= 以下為程式碼邏輯區
    // =====================================================================

    // 取得所有設定的快捷變數 (方便下面程式碼調用)
    const IDS = TIAN_MOD.ids;
    const ICONS = TIAN_MOD.icons;
    const ANIMATIONS = TIAN_MOD.animations;
    const PARAMS = TIAN_MOD.params;
    const TEXTS = TIAN_MOD.texts;
    const BGM = TIAN_MOD.bgm;

    //=============================================================================
    // 0. 全自動動態文字渲染置換引擎 (將數值即時轉化為百分比與數字)
    //=============================================================================
    (() => {
        const toPct = (val) => Math.round(val * 100) + "%";
        
        // 狀態描述動態注入
        TEXTS.states.tiger.note = TEXTS.states.tiger.note.replace(/%ATK%/g, toPct(PARAMS.states.tiger.atkRate)).replace(/%START_AMMO%/g, PARAMS.mechanics.startTigerAmmo);
        TEXTS.states.leap.note = TEXTS.states.leap.note.replace(/%ATK%/g, toPct(PARAMS.states.leap.atkRate));
        TEXTS.states.fierce.note = TEXTS.states.fierce.note.replace(/%ATK%/g, toPct(PARAMS.states.fierce.atkRate));
        TEXTS.states.heaven.note = TEXTS.states.heaven.note.replace(/%ATK%/g, toPct(PARAMS.states.heaven.atkRate)).replace(/%AGI%/g, toPct(PARAMS.states.heaven.agiRate));
        TEXTS.states.heart.note = TEXTS.states.heart.note.replace(/%ATK%/g, toPct(PARAMS.states.heart.atkRate)).replace(/%AGI%/g, toPct(PARAMS.states.heart.agiRate));
        TEXTS.states.winged.note = TEXTS.states.winged.note.replace(/%FIERCE_AMMO%/g, PARAMS.mechanics.fierceAmmoGain).replace(/%TRANS_REQ%/g, PARAMS.mechanics.transformReq);
        TEXTS.states.overheat.note = TEXTS.states.overheat.note
            .replace(/%THRES1%/g, PARAMS.states.overheat.threshold1).replace(/%DMG_TAKEN%/g, toPct(PARAMS.states.overheat.dmgTakenRate))
            .replace(/%THRES2%/g, PARAMS.states.overheat.threshold2).replace(/%ATK2%/g, toPct(PARAMS.states.overheat.atkRate2))
            .replace(/%THRES3%/g, PARAMS.states.overheat.threshold3).replace(/%ATK3%/g, toPct(PARAMS.states.overheat.atkRate3));
        TEXTS.states.tremor.note = TEXTS.states.tremor.note.replace(/%BASE_DMG%/g, PARAMS.mechanics.tremorBaseDmg);

        // 技能描述動態注入
        TEXTS.skills.sk_2slash.desc = TEXTS.skills.sk_2slash.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_2slash.repeats);
        TEXTS.skills.sk_3slash.desc = TEXTS.skills.sk_3slash.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_3slash.repeats).replace(/%COOLDOWN%/g, PARAMS.skills.sk_3slash.cooldown);
        TEXTS.skills.sk_knot.desc = TEXTS.skills.sk_knot.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_knot.repeats).replace(/%COOLDOWN%/g, PARAMS.skills.sk_knot.cooldown);
        TEXTS.skills.sk_super.desc = TEXTS.skills.sk_super.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_super.repeats);
    })();

    //=============================================================================
    // 1. 資料庫動態注入 (自動幫你把技能、武器、狀態寫入遊戲中)
    //=============================================================================
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

        // --- States 狀態註冊 ---
        $dataStates[IDS.states.tiger]  = { id: IDS.states.tiger, name: TEXTS.states.tiger.name, iconIndex: ICONS.tiger, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 2, value: PARAMS.states.tiger.atkRate}], note: TEXTS.states.tiger.note, meta: {} };
        $dataStates[IDS.states.winged] = { id: IDS.states.winged, name: TEXTS.states.winged.name, iconIndex: ICONS.winged, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.winged.note, meta: {} };
        $dataStates[IDS.states.leap]   = { id: IDS.states.leap, name: TEXTS.states.leap.name, iconIndex: ICONS.leap, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 2, value: PARAMS.states.leap.atkRate}], note: TEXTS.states.leap.note, meta: {} };
        $dataStates[IDS.states.fierce] = { id: IDS.states.fierce, name: TEXTS.states.fierce.name, iconIndex: ICONS.fierce, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 2, value: PARAMS.states.fierce.atkRate}], note: TEXTS.states.fierce.note, meta: {} };
        $dataStates[IDS.states.heart]  = { id: IDS.states.heart, name: TEXTS.states.heart.name, iconIndex: ICONS.heart, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 6, value: PARAMS.states.heart.agiRate}, {code: 21, dataId: 2, value: PARAMS.states.heart.atkRate}], note: TEXTS.states.heart.note, meta: {} };
        $dataStates[IDS.states.heaven] = { id: IDS.states.heaven, name: TEXTS.states.heaven.name, iconIndex: ICONS.heaven, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [{code: 21, dataId: 6, value: PARAMS.states.heaven.agiRate}, {code: 21, dataId: 2, value: PARAMS.states.heaven.atkRate}], note: TEXTS.states.heaven.note, meta: {} };
        $dataStates[IDS.states.overheat] = { id: IDS.states.overheat, name: TEXTS.states.overheat.name, iconIndex: ICONS.overheat, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.overheat.note, meta: {} };
        $dataStates[IDS.states.burn]   = { id: IDS.states.burn, name: TEXTS.states.burn.name, iconIndex: ICONS.burn, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.burn.note, meta: {} };
        $dataStates[IDS.states.tremor] = { id: IDS.states.tremor, name: TEXTS.states.tremor.name, iconIndex: ICONS.tremor, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.tremor.note, meta: {} };
        $dataStates[IDS.states.scorch] = { id: IDS.states.scorch, name: TEXTS.states.scorch.name, iconIndex: ICONS.scorch, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 0, minTurns: 1, maxTurns: 1, traits: [], note: TEXTS.states.scorch.note, meta: {} };
        $dataStates[IDS.states.counter] = { id: IDS.states.counter, name: TEXTS.states.counter.name, iconIndex: ICONS.counter, restriction: 0, priority: 50, motion: 0, overlay: 0, removeAtBattleEnd: true, autoRemovalTiming: 1, minTurns: 1, maxTurns: 1, traits: [{code: 22, dataId: 6, value: 1.0}], note: TEXTS.states.counter.note, meta: {} };

        // --- Skills 技能註冊模組化函式 ---
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
        $dataSkills[IDS.skills.sk_super]  = createBaseSkill(IDS.skills.sk_super, TEXTS.skills.sk_super.name, TEXTS.skills.sk_super.desc, ICONS.sk_super, ANIMATIONS.sk_super, 2, PARAMS.skills.sk_super.repeats, PARAMS.skills.sk_super.formula, PARAMS.skills.sk_super.tpGain);
        
        $dataSkills[IDS.skills.sk_blood].speed = 1000; 

        $dataSkills[IDS.skills.sk_knot].hitType = 0;
        if ($dataSkills[IDS.skills.sk_knot].damage) $dataSkills[IDS.skills.sk_knot].damage.type = 1;

        $dataSkills[IDS.skills.sk_super].hitType = 0;
        if ($dataSkills[IDS.skills.sk_super].damage) $dataSkills[IDS.skills.sk_super].damage.type = 1;

        // --- Weapon 武器註冊 ---
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
            if (item && item.note) {
                DataManager.extractMetadata(item);
            }
        };

        for (let i = IDS.states.tiger; i <= maxStateId; i++) if ($dataStates[i]) extractModMeta($dataStates[i]);
        for (let i = IDS.skills.sk_2slash; i <= maxSkillId; i++) if ($dataSkills[i]) extractModMeta($dataSkills[i]);
        extractModMeta($dataWeapons[IDS.weapon]);
    };

    //=============================================================================
    // 2. 戰鬥核心變數初始化與狀態更新 (包含戰鬥中動態彈藥追蹤與說明更新)
    //=============================================================================
    const _Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
    Game_Battler.prototype.onBattleStart = function() {
        _Game_Battler_onBattleStart.call(this);
        this._tianTuiStacks = {};
        this._tianTuiStacks[IDS.states.burn] = 0;
        this._tianTuiStacks[IDS.states.tremor] = 0;
        this._tianTuiStacks[IDS.states.scorch] = 0;

        if (this.isActor() && this.hasWeapon($dataWeapons[IDS.weapon])) {
            this._tianTui = { tiger: PARAMS.mechanics.startTigerAmmo, fierce: 0, consumed: 0, cooldowns: {} };
            this.addState(IDS.states.tiger); 
            this.addState(IDS.states.winged);
            this.addState(IDS.states.leap);  
            this.checkTianTuiStates();
        }
    };

    const _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
    Game_Battler.prototype.onTurnEnd = function() {
        _Game_Battler_onTurnEnd.call(this);
        if (this._tianTui && this._tianTui.cooldowns) {
            for (let id in this._tianTui.cooldowns) {
                if (this._tianTui.cooldowns[id] > 0) this._tianTui.cooldowns[id]--;
            }
        }
    };

    Game_Battler.prototype.checkTianTuiStates = function() {
        if (!this._tianTui) return;
        
        if (this._tianTui.tiger > 0) { if (!this.isStateAffected(IDS.states.tiger)) this.addState(IDS.states.tiger); }
        else { if (this.isStateAffected(IDS.states.tiger)) this.removeState(IDS.states.tiger); }

        if (this._tianTui.fierce > 0) { if (!this.isStateAffected(IDS.states.fierce)) this.addState(IDS.states.fierce); }
        else { if (this.isStateAffected(IDS.states.fierce)) this.removeState(IDS.states.fierce); }

        this._tianTuiStacks = this._tianTuiStacks || {};
        this._tianTuiStacks[IDS.states.tiger] = this._tianTui.tiger;
        this._tianTuiStacks[IDS.states.fierce] = this._tianTui.fierce;
        
        if (this.isStateAffected(IDS.states.winged)) {
            if (this._tianTui.tiger === 0 || this.hp === 0) {
                this._tianTui.tiger = 0;
                this.removeState(IDS.states.winged);
                this._tianTui.fierce = PARAMS.mechanics.fierceAmmoGain;
                this.addState(IDS.states.heaven); 
                this.checkTianTuiStates(); 
                return;
            }
        }

        if (this.isStateAffected(IDS.states.heaven) && this._tianTui.consumed >= PARAMS.mechanics.transformReq) {
            this.removeState(IDS.states.heaven);
            this.addState(IDS.states.heart);
        }

        if (this._tianTui.fierce === 0 && !this.isStateAffected(IDS.states.winged) && this._tianTui.consumed > 0) {
            if (!this.isStateAffected(IDS.states.overheat)) this.addState(IDS.states.overheat);
        }

        // --- 實時戰鬥中動態同步追蹤彈藥量與倍率 ---
        if ($dataStates[IDS.states.tiger] && $dataStates[IDS.states.tiger].meta) {
            $dataStates[IDS.states.tiger].meta.説明 = `\\C[14]攻擊力 ${Math.round(PARAMS.states.tiger.atkRate * 100)}%\\C[0]\n當前剩餘：\\C[2]${this._tianTui.tiger}\\C[0] 顆虎標彈`;
        }
        if ($dataStates[IDS.states.fierce] && $dataStates[IDS.states.fierce].meta) {
            $dataStates[IDS.states.fierce].meta.説明 = `\\C[14]攻擊力 ${Math.round(PARAMS.states.fierce.atkRate * 100)}%\\C[0]\n當前剩餘：\\C[2]${this._tianTui.fierce}\\C[0] 顆猛虎標彈`;
        }
        if ($dataStates[IDS.states.overheat] && $dataStates[IDS.states.overheat].meta) {
            let ov = PARAMS.states.overheat;
            $dataStates[IDS.states.overheat].meta.説明 = `\\C[0]當前累積消耗：\\C[2]${this._tianTui.consumed}\\C[0] 顆彈藥\n\\C[0]當累積消耗總和不小於 ${ov.threshold1} 時，受到的傷害降低為 ${Math.round(ov.dmgTakenRate * 100)}%\n\\C[14]當累積消耗總和不小於 ${ov.threshold2} 時，攻擊力 ${Math.round(ov.atkRate2 * 100)}%\n\\C[2]當累積消耗總和不小於 ${ov.threshold3} 時，攻擊力 ${Math.round(ov.atkRate3 * 100)}%\n\\C[0](三條效果不互斥)`;
        }
    };

    const _Game_Battler_refresh = Game_Battler.prototype.refresh;
    Game_Battler.prototype.refresh = function() {
        _Game_Battler_refresh.call(this);
        if (this.hp === 0) this.checkTianTuiStates();
    };

    //=============================================================================
    // 3. 技能判定、替換與消耗邏輯
    //=============================================================================
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

    const _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        const subject = this._subject;
        const action = subject ? subject.currentAction() : null;
        if (subject && subject._tianTui && action && action.isSkill()) {
            if (action.item().id === IDS.skills.sk_super) { 
                if (subject._tianTui.fierce === 0) { 
                    action.setSkill(IDS.skills.sk_knot);
                    if (!action._targetIndex || action._targetIndex < 0) action._targetIndex = 0;
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
            let consumed = 0;
            
            if (sId === IDS.skills.sk_2slash) { 
                if (this._tianTui.tiger > 0) { this._tianTui.tiger--; consumed++; }
                else if (this._tianTui.fierce > 0) { this._tianTui.fierce--; consumed++; }

            } else if (sId === IDS.skills.sk_3slash) { 
                let needed = 2;
                while (needed > 0 && this._tianTui.tiger > 0) { this._tianTui.tiger--; needed--; consumed++; }
                while (needed > 0 && this._tianTui.fierce > 0) { this._tianTui.fierce--; needed--; consumed++; }
                this._tianTui.cooldowns[sId] = PARAMS.skills.sk_3slash.cooldown; 

            } else if (sId === IDS.skills.sk_knot) { 
                let actual = 0;
                if (this._tianTui.tiger > 0) {
                    actual = Math.min(3, this._tianTui.tiger);
                    this._tianTui.tiger -= actual;
                } else if (this._tianTui.fierce > 0) {
                    actual = this._tianTui.fierce; 
                    this._tianTui.fierce = 0;
                }
                consumed = actual; 
                this._tianTui.cooldowns[sId] = PARAMS.skills.sk_knot.cooldown; 

            } else if (sId === IDS.skills.sk_blood) { 
                if (this._tianTui.tiger > 0) this._tianTui.tiger = 0; 

            } else if (sId === IDS.skills.sk_super) { 
                let actual = Math.min(3, this._tianTui.fierce);
                this._tianTui.fierce -= actual;
                consumed = actual;
            }
            
            if (consumed > 0) this._tianTui.consumed += consumed;
            this.checkTianTuiStates(); 
        }
    };

    //=============================================================================
    // 4. 層數系統與引爆系統 (Burn, Tremor, Detonate)
    //=============================================================================
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
        this._tianTuiIsLastHit = (this._tianTuiHitCounts[tId] === this.numRepeats());
        
        _Game_Action_apply.call(this, target);
    };

    const _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
    Game_Action.prototype.executeDamage = function(target, value) {
        let ov = PARAMS.states.overheat;
        
        if (target.isStateAffected(IDS.states.overheat) && target._tianTui && target._tianTui.consumed >= ov.threshold1) {
            value = Math.floor(value * ov.dmgTakenRate);
        }

        let detDamage = 0;
        if (this.isSkill() && this._tianTuiIsLastHit) {
            let skillId = this.item().id;
            if (skillId === IDS.skills.sk_2slash) {
                target.addTianTuiStack(IDS.states.burn, 2);
                target.addTianTuiStack(IDS.states.tremor, 3);
            } else if (skillId === IDS.skills.sk_3slash) {
                target.addTianTuiStack(IDS.states.burn, 4);
                target.addTianTuiStack(IDS.states.tremor, 5);
                if (target.getTianTuiStack(IDS.states.tremor) + target.getTianTuiStack(IDS.states.scorch) >= 3) {
                    detDamage = target.detonateTremor(1);
                }
            } else if (skillId === IDS.skills.sk_knot || skillId === IDS.skills.sk_super) {
                target.addTianTuiStack(IDS.states.burn, 6);
                target.addTianTuiStack(IDS.states.tremor, 6);
                let curTremor = target.getTianTuiStack(IDS.states.tremor);
                if (curTremor > 0) {
                    target.addTianTuiStack(IDS.states.scorch, curTremor);
                    target.addTianTuiStack(IDS.states.tremor, -curTremor);
                }
                detDamage = target.detonateTremor(2);
            }
        }
        
        value += detDamage; 
        _Game_Action_executeDamage.call(this, target, value);
    };

    //=============================================================================
    // 5. 屬性倍率覆蓋 (過熱加攻擊力與恢復衰減)
    //=============================================================================
    const _Game_BattlerBase_paramRate = Game_BattlerBase.prototype.paramRate;
    Game_BattlerBase.prototype.paramRate = function(paramId) {
        let rate = _Game_BattlerBase_paramRate.call(this, paramId);
        if (paramId === 2) { 
            if (this.isStateAffected(IDS.states.overheat) && this._tianTui) {
                let ov = PARAMS.states.overheat;
                if (this._tianTui.consumed >= ov.threshold2) rate *= ov.atkRate2;
                if (this._tianTui.consumed >= ov.threshold3) rate *= ov.atkRate3;
            }
        }
        return rate;
    };

    const _Game_BattlerBase_traitsSum = Game_BattlerBase.prototype.traitsSum;
    Game_BattlerBase.prototype.traitsSum = function(code, id) {
        let val = _Game_BattlerBase_traitsSum.call(this, code, id);
        if (code === 22 && id === 7 && this._tianTuiStacks) { 
            let burn = this._tianTuiStacks[IDS.states.burn] || 0;
            let scorch = this._tianTuiStacks[IDS.states.scorch] || 0;
            val -= (burn * 0.01);
            val -= (scorch * 0.01);
        }
        return val;
    };

    //=============================================================================
    // 6. 支援複數特效連續播放 (陣列解析)
    //=============================================================================
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

    //=============================================================================
    // 7. 新遊戲與載入遊戲自動發放武器判定
    //=============================================================================
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

    //=============================================================================
    // 8. 戰鬥專屬 BGM 變更與動態換裝系統
    //=============================================================================
    
    // 檢查當前隊伍戰鬥成員是否有人裝備天退星刀
    const isWeaponEquipped = function() {
        if (!$gameParty) return false;
        return $gameParty.battleMembers().some(actor => {
            return actor.weapons().some(weapon => weapon && weapon.id === IDS.weapon);
        });
    };

    // 檢查並動態更新戰鬥 BGM
    const checkAndUpdateBattleBgm = function() {
        if (!$gameParty.inBattle()) return; // 確保只在戰鬥場景中觸發切換

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

    // 攔截戰鬥開始時的 BGM 播放
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

    // 攔截戰鬥中選單「換裝」事件
    const _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        if ($gameParty.inBattle()) {
            checkAndUpdateBattleBgm();
        }
    };

    // 攔截戰鬥中「強制換裝」事件
    const _Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
    Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
        _Game_Actor_forceChangeEquip.call(this, slotId, item);
        if ($gameParty.inBattle()) {
            checkAndUpdateBattleBgm();
        }
    };

})();