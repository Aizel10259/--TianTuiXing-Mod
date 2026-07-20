//=============================================================================
// Mod_TianTuiXing_zh_CN.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 天退星刀 Mod (武器、状态、技能与专属BGM) [全动态浮动与音乐整合版]
 * @author 
 * 
 * @param BgmName
 * @text 专属 BGM 部署打包依赖
 * @desc 为了让游戏输出时正确打包音乐，请确保此处的文件名与下方脚本 TIAN_MOD 设置相同。
 * @type file
 * @dir audio/bgm/
 * @default Mod_Lei_Heng_Theme
 * 
 * @help
 * 采用动态注册的方式，不需要修改原本的 json 文件。
 * 直接在插件管理器启用即可生效。
 * 
 * ==========================================
 * 玩家自定义指南：
 * ==========================================
 * 请向下滑动，找到 【模组核心设定区 (TIAN_MOD)】。
 * 所有的数值（攻击力、伤害、图标、ID、弹药数量、专属音乐）都在那里！
 * 只要修改里面的数字或文字，存档后进游戏就会直接生效，
 * 所有技能与状态的说明文字都会自动转为百分比并即时联动浮动！
 * 
 * ★ BGM 切换机制：
 * 进入战斗时，若队伍中有成员装备指定武器，将自动切换为专属 BGM。
 * 支持战斗中动态换装：装上武器立刻变更 BGM，卸下武器则切回默认战斗 BGM。
 */

(() => {
    // =====================================================================
    // =====================================================================
    // 【模组核心设定区 (TIAN_MOD)】
    // 所有的客制化内容都在这里！请安心在这里修改数值。
    // =====================================================================
    // =====================================================================
    const TIAN_MOD = {
        
        // -----------------------------------------------------------------
        // 1. 占用的 ID 设置 (如果在游戏中与其他模组冲突，可以在这里改)
        // -----------------------------------------------------------------
        ids: {
            weapon: 530,       // 天退星刀的武器 ID
            skills: {
                sk_2slash: 530, // 二连斩-爆 ID
                sk_3slash: 531, // 三连击-爆 ID
                sk_knot: 532,   // 快刀乱麻 ID
                sk_blood: 533,  // 令人热血沸腾 ID
                sk_super: 535   // 超绝猛虎杀击乱斩 ID
            },
            states: {
                tiger: 530,     // 虎标弹 ID
                winged: 531,    // 插翅虎 ID
                leap: 532,      // 猛虎暴跃 ID
                fierce: 533,    // 猛虎标弹 ID
                heart: 534,     // 心-天退星 ID
                heaven: 535,    // 天退星 ID
                overheat: 536,  // 过热 ID
                burn: 537,      // 烧伤 ID
                tremor: 538,    // 震颤 ID
                scorch: 539,    // 震颤-灼热 ID
                counter: 540    // 反击状态 ID
            }
        },

        // -----------------------------------------------------------------
        // 2. 图标与动画设置
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
            sk_blood: 51,      sk_super: [69, 23] // 数组代表连续播放多个特效
        },

        // -----------------------------------------------------------------
        // 3. 战斗专属 BGM 设置 (音频设置)
        // -----------------------------------------------------------------
        bgm: {
            name: "Mod_Lei_Heng_Theme", // 音乐文件名称 (需放置于 audio/bgm/ 下，不含扩展名)
            volume: 90,                 // 若系统未设定默认战斗音量，则使用此默认音量
            pitch: 100                  // 音调 (默认 100)
        },

        // -----------------------------------------------------------------
        // 4. 战斗数值与平衡设置 (最重要的区域)
        // -----------------------------------------------------------------
        params: {
            // [武器本身能力值] 
            // 顺序: [最大HP, 最大MP, 攻击力, 防御力, 魔法攻击, 魔法防御, 敏捷, 幸运]
            weaponStats: [0, 0, 200, 0, 0, 0, 100, 0], 
            
            // [技能伤害与数值] 
            // repeats = 攻击次数, tpGain = 获得TP, cooldown = 冷却回合
            // formula = 伤害公式 (a.atk 代表攻击者攻击力，b.def 代表目标防御力)
            skills: {
                sk_2slash: { repeats: 2, tpGain: 0, formula: "a.atk * 2 - b.def" },
                sk_3slash: { repeats: 3, tpGain: 0, formula: "a.atk * 2.5 - b.def", cooldown: 2 },
                sk_knot:   { repeats: 3, tpGain: 0, formula: "a.atk * 3 - b.def", cooldown: 3 },
                sk_super:  { repeats: 5, tpGain: 0, formula: "a.atk * 3.5 - b.def" }
            },

            // [状态加成倍率] (1.1 代表 110%，1.2 代表 120%)
            states: {
                tiger:  { atkRate: 1.1 }, // 虎标弹: 攻击力 110%
                leap:   { atkRate: 1.1 }, // 猛虎暴跃: 攻击力 110%
                fierce: { atkRate: 1.2 }, // 猛虎标弹: 攻击力 120%
                heaven: { atkRate: 1.2, agiRate: 1.1 }, // 天退星: 攻击120%, 敏捷110%
                heart:  { atkRate: 1.4, agiRate: 1.3 }, // 心-天退星: 攻击140%, 敏捷130%
                
                // 过热的 3 个阶段设置
                overheat: {
                    threshold1: 8,  dmgTakenRate: 0.5, // 第一阶: 累积8颗，受伤减半(50%)
                    threshold2: 14, atkRate2: 2.5,     // 第二阶: 累积14颗，攻击力 250%
                    threshold3: 20, atkRate3: 1.5      // 第三阶: 累积20颗，攻击力 150%
                }
            },

            // [核心机制设置]
            mechanics: {
                startTigerAmmo: 12,    // 战斗开始时给予几颗“虎标弹”
                fierceAmmoGain: 8,     // 虎标弹耗尽后，给予几颗“猛虎标弹”
                transformReq: 8,       // 消耗几颗弹药后，“天退星”会进化成“心-天退星”
                tremorBaseDmg: 100     // “震颤”被引爆时，每一层造成的固定伤害
            }
        },

        // -----------------------------------------------------------------
        // 5. 文本叙述设置 (动态标签说明：系统会自动抓取上方自订数值转为 % 或数字)
        // -----------------------------------------------------------------
        texts: {
            weapon: { 
                name: "天退星刀", 
                desc: "\\C[14]可使用「二连斩-爆」、「三连击-爆」、「快刀乱麻」\\C[14]\n「令人热血沸腾」、「超绝猛虎杀击乱斩」\\C[0]\n虽然必须隐瞒这把天退星刀的名号略微有些可惜……\\C[0]\n但既然它能如插翅之虎一般咆哮，那如此倒也足够。" 
            },
            skills: {
                sk_2slash: { name: "二连斩-爆", desc: "武器技能\n\\C[14]对单体敌人发动 %REPEATS% 次攻击，并赋予敌方「烧伤」、「震颤」\n\\C[14]消耗1颗「虎标弹」或「猛虎标弹」\\C[0]\n接一招试试吧？" },
                sk_3slash: { name: "三连击-爆", desc: "武器技能\n\\C[14]对单体敌人发动 %REPEATS% 次攻击，并赋予敌方「烧伤」、「震颤」\n\\C[14]消耗2顆「虎標彈」或「猛虎標彈」\\C[0]\n\\C[2]*%COOLDOWN% 回合后可再次使用\\C[0]\n再那样呆站着，脑袋可要落地了。" },
                sk_knot:   { name: "快刀乱麻", desc: "武器技能\n\\C[14]对单体敌人发动 %REPEATS% 次攻击，并赋予敌方「烧伤」、「震颤」\n\\C[14]消耗3颗「虎标弹」或剩余弹药 (忽视回避与反击)\\C[0]\n\\C[2]*%COOLDOWN% 回合后可再次使用\\C[0]\n全弹发射！" },
                sk_blood:  { name: "令人热血沸腾", desc: "武器技能\n\\C[14]直到下次行动，反击率100%\n\\C[14]如果持有「虎标弹」则在使用技能后清零\\C[0]\n猎物吗。令人……热血沸腾啊。" },
                sk_super:  { name: "超绝猛虎杀击乱斩", desc: "武器技能\n\\C[14]对全体敌人发动 %REPEATS% 次攻击，并赋予敌方「烧伤」、「震颤」\n\\C[14]消耗最多3颗「猛虎标弹」 (忽视回避与反击)\\C[2]\n想擒虎吗。那就做好被咬死的觉悟吧。\\C[0]\n我，雷克西斯。拇指的指挥官，东部十剑之一。将全力与你战斗。" }
            },
            states: {
                tiger:    { name: "虎标弹", note: "<说明:\\C[14]攻击力 %ATK%\\C[0]\n战斗开始时，有装填 %START_AMMO% 颗虎标弹。>" },
                winged:   { name: "插翅虎", note: "<说明:\\C[0]若消耗了自身所有虎标弹，使自身装填 %FIERCE_AMMO% 颗猛虎标弹并获得天退星。\n\\C[14]若累积消耗弹药达 %TRANS_REQ% 颗，则转化为心-天退星。\n\\C[2]消耗最后的猛虎标弹时，获得过热。>" },
                leap:     { name: "猛虎暴跃", note: "<说明:\\C[14]攻击力 %ATK%>" },
                fierce:   { name: "猛虎标弹", note: "<说明:\\C[14]攻击力 %ATK%>" },
                heart:    { name: "心-天退星", note: "<说明:\\C[14]攻击力 %ATK%, 敏捷性 %AGI%>" },
                heaven:   { name: "天退星", note: "<说明:\\C[14]攻击力 %ATK%, 敏捷性 %AGI%>" },
                overheat: { name: "过热", note: "<说明:\\C[0]当前累积消耗：\\C[2]0\\C[0] 颗弹药\n\\C[0]当累积消耗总和不小于 %THRES1% 时，受到的伤害 %DMG_TAKEN%\n\\C[14]当累积消耗总和不小于 %THRES2% 时，攻击力 %ATK2%\n\\C[2]当累积消耗总和不小于 %THRES3% 时，攻击力 %ATK3%\n\\C[0](三条效果不互斥)>" },
                burn:     { name: "烧伤", note: "<说明:\\C[14]每叠加N层，使自身HP再生率-N%>" },
                tremor:   { name: "震颤", note: "<说明:\\C[14]受到引爆时，每层造成 %BASE_DMG% 点固定伤害。>" },
                scorch:   { name: "震颤-灼热", note: "<说明:\\C[14]每叠加N层，使自身HP再生率-N%>" },
                counter:  { name: "令人热血沸腾(反击)", note: "<说明:\\C[14]使自身反击率100%>" }
            }
        }
    };
    // =====================================================================
    // =设置区结束= 以下为程式码逻辑区
    // =====================================================================

    // 取得所有设置的快捷变量 (方便下面代码调用)
    const IDS = TIAN_MOD.ids;
    const ICONS = TIAN_MOD.icons;
    const ANIMATIONS = TIAN_MOD.animations;
    const PARAMS = TIAN_MOD.params;
    const TEXTS = TIAN_MOD.texts;
    const BGM = TIAN_MOD.bgm;

    //=============================================================================
    // 0. 全自动动态文字渲染置换引擎 (将数值即时转化为百分比与数字)
    //=============================================================================
    (() => {
        const toPct = (val) => Math.round(val * 100) + "%";
        
        // 状态描述动态注入
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

        // 技能描述动态注入
        TEXTS.skills.sk_2slash.desc = TEXTS.skills.sk_2slash.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_2slash.repeats);
        TEXTS.skills.sk_3slash.desc = TEXTS.skills.sk_3slash.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_3slash.repeats).replace(/%COOLDOWN%/g, PARAMS.skills.sk_3slash.cooldown);
        TEXTS.skills.sk_knot.desc = TEXTS.skills.sk_knot.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_knot.repeats).replace(/%COOLDOWN%/g, PARAMS.skills.sk_knot.cooldown);
        TEXTS.skills.sk_super.desc = TEXTS.skills.sk_super.desc.replace(/%REPEATS%/g, PARAMS.skills.sk_super.repeats);
    })();

    //=============================================================================
    // 1. 数据库动态注入 (自动帮你把技能、武器、状态写入游戏中)
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

        // --- States 状态注册 ---
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

        // --- Skills 技能注册模块化函数 ---
        const createBaseSkill = (id, name, desc, iconId, animId, scope, repeats, formula, tpGain, effects = []) => ({
            id: id, name: name, description: desc, iconIndex: iconId, stypeId: 1, scope: scope, occasion: 1, speed: 0,
            successRate: 100, repeats: repeats, tpGain: tpGain, hitType: formula ? 1 : 0, animationId: animId,
            damage: { type: formula ? 1 : 0, elementId: -1, formula: formula || "0", variance: 20, critical: !!formula },
            effects: effects, note: "", meta: {}, mpCost: 0, tpCost: 0,
            requiredWtypeId1: 0, requiredWtypeId2: 0, messageType: 1, message1: "释放了 %2！", message2: ""
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

        // --- Weapon 武器注册 ---
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
    // 2. 战斗核心变量初始化与状态更新 (包含战斗中动态弹药追踪与说明更新)
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

        // --- 实时战斗中动态同步追踪弹药量与倍率 ---
        if ($dataStates[IDS.states.tiger] && $dataStates[IDS.states.tiger].meta) {
            $dataStates[IDS.states.tiger].meta.说明 = `\\C[14]攻击力 ${Math.round(PARAMS.states.tiger.atkRate * 100)}%\\C[0]\n当前剩余：\\C[2]${this._tianTui.tiger}\\C[0] 颗虎标弹`;
        }
        if ($dataStates[IDS.states.fierce] && $dataStates[IDS.states.fierce].meta) {
            $dataStates[IDS.states.fierce].meta.说明 = `\\C[14]攻击力 ${Math.round(PARAMS.states.fierce.atkRate * 100)}%\\C[0]\n当前剩余：\\C[2]${this._tianTui.fierce}\\C[0] 颗猛虎标弹`;
        }
        if ($dataStates[IDS.states.overheat] && $dataStates[IDS.states.overheat].meta) {
            let ov = PARAMS.states.overheat;
            $dataStates[IDS.states.overheat].meta.说明 = `\\C[0]当前累积消耗：\\C[2]${this._tianTui.consumed}\\C[0] 颗弹药\n\\C[0]当累积消耗总和不小于 ${ov.threshold1} 时，受到的伤害降低为 ${Math.round(ov.dmgTakenRate * 100)}%\n\\C[14]当累积消耗总和不小于 ${ov.threshold2} 时，攻击力 ${Math.round(ov.atkRate2 * 100)}%\n\\C[2]当累积消耗总和不小于 ${ov.threshold3} 时，攻击力 ${Math.round(ov.atkRate3 * 100)}%\n\\C[0](三条效果不互斥)`;
        }
    };

    const _Game_Battler_refresh = Game_Battler.prototype.refresh;
    Game_Battler.prototype.refresh = function() {
        _Game_Battler_refresh.call(this);
        if (this.hp === 0) this.checkTianTuiStates();
    };

    //=============================================================================
    // 3. 技能判定、替换与消耗逻辑
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
    // 4. 层数系统与引爆系统 (Burn, Tremor, Detonate)
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
    // 5. 属性倍率覆盖 (过热加攻击力与恢复衰减)
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
    // 6. 支持复数特效连续播放 (数组解析)
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
    // 7. 新游戏与载入游戏自动发放武器判定
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
    // 8. 战斗专属 BGM 变更与动态换装系统
    //=============================================================================
    
    // 检查当前队伍战斗成员是否有人装备天退星刀
    const isWeaponEquipped = function() {
        if (!$gameParty) return false;
        return $gameParty.battleMembers().some(actor => {
            return actor.weapons().some(weapon => weapon && weapon.id === IDS.weapon);
        });
    };

    // 检查并动态更新战斗 BGM
    const checkAndUpdateBattleBgm = function() {
        if (!$gameParty.inBattle()) return; // 确保只在战斗场景中触发切换

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

    // 拦截战斗开始时的 BGM 播放
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

    // 拦截战斗中菜单“换装”事件
    const _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        if ($gameParty.inBattle()) {
            checkAndUpdateBattleBgm();
        }
    };

    // 拦截战斗中“强制换装”事件
    const _Game_Actor_forceChangeEquip = Game_Actor.prototype.forceChangeEquip;
    Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
        _Game_Actor_forceChangeEquip.call(this, slotId, item);
        if ($gameParty.inBattle()) {
            checkAndUpdateBattleBgm();
        }
    };

})();
