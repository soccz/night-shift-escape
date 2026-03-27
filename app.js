"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const stageEl = document.getElementById("gameStage");

const statsEl = document.getElementById("stats");
const metaEl = document.getElementById("meta");
const logEl = document.getElementById("log");
const objectiveEl = document.getElementById("objectiveText");
const promptEl = document.getElementById("promptText");
const restartButton = document.getElementById("restartButton");
const titleOverlay = document.getElementById("titleOverlay");
const startButton = document.getElementById("startButton");
const subtitleText = document.getElementById("subtitleText");
const themeChip = document.getElementById("themeChip");
const alarmStrip = document.getElementById("alarmStrip");
const titleKicker = document.getElementById("titleKicker");
const titleOverlayHeading = document.getElementById("titleOverlayHeading");
const titleOverlayCopy = document.getElementById("titleOverlayCopy");
const missionHeading = document.getElementById("missionHeading");
const runHeading = document.getElementById("runHeading");
const controlsHeading = document.getElementById("controlsHeading");
const controlsList = document.getElementById("controlsList");
const logHeading = document.getElementById("logHeading");
const metaHeading = document.getElementById("metaHeading");
const languageButton = document.getElementById("languageButton");
const performanceButton = document.getElementById("performanceButton");
const hudToggleButton = document.getElementById("hudToggleButton");
const muteButton = document.getElementById("muteButton");
const pauseButton = document.getElementById("pauseButton");
const guideButton = document.getElementById("guideButton");
const guideOverlay = document.getElementById("guideOverlay");
const guideCloseButton = document.getElementById("guideCloseButton");
const dockModeButton = document.getElementById("dockModeButton");
const dockInteractButton = document.getElementById("dockInteractButton");
const dockReinforceButton = document.getElementById("dockReinforceButton");
const helpHeading = document.getElementById("helpHeading");
const helpText = document.getElementById("helpText");
const pauseOverlay = document.getElementById("pauseOverlay");
const pauseKicker = document.getElementById("pauseKicker");
const pauseHeading = document.getElementById("pauseHeading");
const pauseCopy = document.getElementById("pauseCopy");
const resumeButton = document.getElementById("resumeButton");
const pauseMuteButton = document.getElementById("pauseMuteButton");
const mobileStick = document.getElementById("mobileStick");
const mobileStickThumb = document.getElementById("mobileStickThumb");
const sidebar = document.getElementById("sidebar");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const STAGE_RATIO = WIDTH / HEIGHT;

// Pre-rendered backdrop cache — gradients are static, no need to recreate each frame
// Pre-rendered shadow ellipse — replaces per-call createRadialGradient in drawShadow
const _shadowCanvas = (() => {
  const sz = 128;
  const oc = document.createElement("canvas");
  oc.width = sz;
  oc.height = sz;
  const octx = oc.getContext("2d");
  const g = octx.createRadialGradient(sz / 2, sz / 2, sz * 0.075, sz / 2, sz / 2, sz / 2);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  octx.fillStyle = g;
  octx.beginPath();
  octx.ellipse(sz / 2, sz / 2, sz / 2, sz * 0.21, 0, 0, Math.PI * 2);
  octx.fill();
  return oc;
})();

// Pre-rendered radial glow — replaces per-call createRadialGradient in drawCelOrb
const _glowCanvas = (() => {
  const sz = 128;
  const oc = document.createElement("canvas");
  oc.width = sz;
  oc.height = sz;
  const octx = oc.getContext("2d");
  const g = octx.createRadialGradient(sz / 2, sz / 2, sz * 0.065, sz / 2, sz / 2, sz / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  octx.fillStyle = g;
  octx.beginPath();
  octx.arc(sz / 2, sz / 2, sz / 2, 0, Math.PI * 2);
  octx.fill();
  return oc;
})();

const _backdropCache = (() => {
  const offscreen = document.createElement("canvas");
  offscreen.width = WIDTH;
  offscreen.height = HEIGHT;
  const octx = offscreen.getContext("2d", { alpha: false });
  const g = octx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  g.addColorStop(0, "#140d1c");
  g.addColorStop(0.45, "#08111d");
  g.addColorStop(1, "#04070c");
  octx.fillStyle = g;
  octx.fillRect(0, 0, WIDTH, HEIGHT);
  const bloom = octx.createRadialGradient(WIDTH * 0.74, HEIGHT * 0.1, 20, WIDTH * 0.74, HEIGHT * 0.1, 340);
  bloom.addColorStop(0, "rgba(255, 74, 126, 0.2)");
  bloom.addColorStop(1, "rgba(255, 74, 126, 0)");
  octx.fillStyle = bloom;
  octx.fillRect(0, 0, WIDTH, HEIGHT);
  const blueBloom = octx.createRadialGradient(WIDTH * 0.2, HEIGHT * 0.85, 20, WIDTH * 0.2, HEIGHT * 0.85, 420);
  blueBloom.addColorStop(0, "rgba(91, 186, 255, 0.16)");
  blueBloom.addColorStop(1, "rgba(91, 186, 255, 0)");
  octx.fillStyle = blueBloom;
  octx.fillRect(0, 0, WIDTH, HEIGHT);
  return offscreen;
})();

const I18N = {
  ko: {
    subtitle: "브라우저용 애니 호러 솔로 디펜스 런.",
    themeChip: "셀 호러 HUD",
    performance_on: "간소화 ON",
    performance_off: "간소화 OFF",
    hud_show: "HUD 열기",
    hud_hide: "HUD 닫기",
    mute: "사운드",
    mute_on: "사운드 켬",
    mute_off: "사운드 끔",
    pause: "일시정지",
    resume: "계속",
    restart: "다시 시작",
    alarm: "구역 상태 불안정. 확률이 곧 법칙이다.",
    titleKicker: "Night Protocol",
    titleOverlayHeading: "격리 구역 진입",
    titleOverlayCopy:
      "① 빈 방 진입 후 E 눌러 점거\n② 침대(BED) 위에 서면 골드 획득 + 체력 회복\n③ 단말기(TERMINAL)에서 지도 조각 구입 (골드 소모)\n④ 조각 6개 + 시질 2개 모으면 탈출구 개방\n\n조작: WASD 이동  |  E 상호작용  |  R 문 강화",
    start: "작전 시작",
    missionHeading: "임무 피드",
    runHeading: "현재 런",
    controlsHeading: "조작",
    logHeading: "이벤트 로그",
    metaHeading: "기록",
    helpHeading: "빠른 도움말",
    helpText:
      "빈 방에 들어가 E를 눌러 점거하세요. 내 방 안에 있으면 돈이 돌고, 침대 위에 있으면 더 빨리 벌면서 회복합니다. 제단은 소환, 단말은 지도 조각입니다.",
    pauseKicker: "System Hold",
    pauseHeading: "일시 정지",
    pauseCopy: "정비하고 다시 들어가세요.",
    dock_mode: "이동 전환",
    dock_interact: "상호작용",
    dock_reinforce: "문 강화",
    controls: [
      ["이동", "PC: WASD / 모바일: 터치"],
      ["상호작용", "E"],
      ["문 강화", "R"],
      ["이동 방식 전환", "Tab"],
      ["일시정지", "Esc / P"],
      ["운영자 모드", "F1 / Q"],
      ["운영자 자금", "Insert"],
      ["갓 모드 (운영자)", "G"],
      ["헌터 처치 (운영자)", "K"],
      ["조각 수집 (운영자)", "F"],
      ["즉시 정전 (운영자)", "N"],
    ],
    stat_health: "체력",
    stat_gold: "골드",
    stat_time: "시간",
    stat_movement: "이동",
    stat_admin: "운영자",
    stat_room: "방",
    stat_floor: "층",
    stat_fragments: "지도 조각",
    stat_sigils: "시질",
    stat_blackout: "정전",
    stat_hunter: "술래 유형",
    stat_boon: "가호",
    stat_omen: "흉조",
    stat_contract: "계약",
    stat_anomaly: "이상현상",
    meta_runs: "플레이 수",
    meta_escapes: "탈출 수",
    meta_bestTime: "최고 시간",
    meta_shards: "잔재",
    meta_unlock: "기록 단계",
    meta_loadout: "장착 트리",
    meta_slots: "장착 슬롯",
    meta_next_run: "선택 변경은 다음 런부터 적용됩니다.",
    meta_unlock_action: "해금",
    meta_select_action: "장착",
    meta_deselect_action: "해제",
    meta_locked: "잠김",
    meta_active: "활성",
    meta_inactive: "대기",
    meta_need_parent: "상위 노드 필요",
    meta_need_shards: "잔재 부족",
    room_none: "없음",
    movement_wasd: "키보드",
    movement_click: "포인트",
    objective_findRoom: "빈 방에 들어가 E를 눌러 점거하세요. 방을 내 것으로 만들면 돈이 돌기 시작합니다.",
    objective_fragments: "내 방 안에 머물며 돈을 벌고, 침대 위에 서면 더 빨리 벌고 회복합니다. 그 돈으로 소환과 지도 조각을 사세요.",
    objective_sigils: "두 개의 시질을 회수해 서비스 게이트를 강제로 여세요.",
    objective_escape: "복도가 널 삼키기 전에 서비스 게이트로 달리세요.",
    prompt_none: "지금 당장 할 상호작용이 없습니다.",
    prompt_generator: "E를 누르고 유지해 발전기를 수리하세요.",
    prompt_escape: "탈출구: E 유지 (3초)",
    prompt_claim: "E를 눌러 이 방을 점거하세요. 점거하면 돈이 생산됩니다.",
    prompt_summon: "E를 눌러 랜덤 수호자를 소환하세요.",
    prompt_intel: "E를 눌러 지도 정보를 도박처럼 구매하세요.",
    prompt_door: "E로 문 개폐, R로 문 강화.",
    start_banner_title: "작전 시작",
    start_banner_subtitle: "추격자가 고정되기 전에 방을 점거하세요.",
    outcome_escape: "서비스 게이트가 닫히기 전에 간신히 빠져나왔습니다.",
    save_unavailable: "이 브라우저 세션에서는 저장소를 사용할 수 없습니다.",
    player_tag: "나",
  },
  en: {
    subtitle: "Anime-horror solo defense run for the browser.",
    themeChip: "Cel Horror HUD",
    performance_on: "Lite FX On",
    performance_off: "Lite FX Off",
    hud_show: "Show HUD",
    hud_hide: "Hide HUD",
    mute: "Sound",
    mute_on: "Sound On",
    mute_off: "Sound Off",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart Run",
    alarm: "Ward state unstable. Probability is law.",
    titleKicker: "Night Protocol",
    titleOverlayHeading: "Enter The Ward",
    titleOverlayCopy:
      "① Enter a vacant room and press E to claim it\n② Stand on the BED to earn gold + heal\n③ Use the TERMINAL to buy map fragments (costs gold)\n④ Collect 6 fragments + 2 sigils to open the exit\n\nWASD: Move  |  E: Interact  |  R: Reinforce door",
    start: "Start Operation",
    missionHeading: "Mission Feed",
    runHeading: "Run",
    controlsHeading: "Controls",
    logHeading: "Event Log",
    metaHeading: "Meta",
    helpHeading: "Quick Help",
    helpText:
      "Enter a vacant room and press E to claim it. Your room generates gold, and the bed boosts gold plus healing. The altar summons, and the terminal buys fragments.",
    pauseKicker: "System Hold",
    pauseHeading: "Paused",
    pauseCopy: "Take a breath and re-enter when ready.",
    dock_mode: "Move Mode",
    dock_interact: "Interact",
    dock_reinforce: "Reinforce",
    controls: [
      ["Move", "PC: WASD / Mobile: Touch"],
      ["Interact", "E"],
      ["Reinforce door", "R"],
      ["Toggle movement mode", "Tab"],
      ["Pause", "Esc / P"],
      ["Admin mode", "F1 / Q"],
      ["Admin money", "Insert"],
      ["God mode (admin)", "G"],
      ["Kill hunter (admin)", "K"],
      ["Collect all (admin)", "F"],
      ["Blackout now (admin)", "N"],
    ],
    stat_health: "Health",
    stat_gold: "Gold",
    stat_time: "Time",
    stat_movement: "Movement",
    stat_admin: "Admin",
    stat_room: "Room",
    stat_floor: "Floor",
    stat_fragments: "Fragments",
    stat_sigils: "Sigils",
    stat_blackout: "Blackout",
    stat_hunter: "Hunter",
    stat_boon: "Boon",
    stat_omen: "Omen",
    stat_contract: "Contract",
    stat_anomaly: "Anomaly",
    meta_runs: "Runs",
    meta_escapes: "Escapes",
    meta_bestTime: "Best time",
    meta_shards: "Shards",
    meta_unlock: "Archive tier",
    meta_loadout: "Loadout Tree",
    meta_slots: "Active slots",
    meta_next_run: "Selection changes apply on the next run.",
    meta_unlock_action: "Unlock",
    meta_select_action: "Equip",
    meta_deselect_action: "Unequip",
    meta_locked: "Locked",
    meta_active: "Active",
    meta_inactive: "Idle",
    meta_need_parent: "Parent node required",
    meta_need_shards: "Not enough shards",
    room_none: "None",
    movement_wasd: "Keyboard",
    movement_click: "Point",
    objective_findRoom: "Enter a vacant room and press E to claim it. Claimed rooms start generating gold.",
    objective_fragments: "Stay inside your room for income. Stand on the bed to earn faster and heal, then spend that gold on summons and fragments.",
    objective_sigils: "Recover both sigils and force the service gate to yield.",
    objective_escape: "Run for the service gate before the ward swallows you.",
    prompt_none: "No immediate interaction.",
    prompt_generator: "Hold E to repair the generator.",
    prompt_escape: "Gate: hold E (3 seconds)",
    prompt_claim: "Press E to claim this room. Claimed rooms generate gold.",
    prompt_summon: "Press E to summon a random guardian.",
    prompt_intel: "Press E to gamble for map intel.",
    prompt_door: "Press E to open or close your door. Press R to reinforce.",
    start_banner_title: "Operation Start",
    start_banner_subtitle: "Claim a room before the hunter locks in.",
    outcome_escape: "The service gate opened before the corridor could close its hand.",
    save_unavailable: "Save storage unavailable in this browser session.",
    player_tag: "YOU",
  },
};

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
}

function langText(ko, en) {
  return state.lang === "ko" ? ko : en;
}

function localize(entry) {
  if (!entry) {
    return "";
  }
  if (typeof entry === "string") {
    return entry;
  }
  return entry[state.lang] || entry.en || "";
}

const CONFIG = {
  player: {
    maxHp: 100,
    speed: 165,
    healPerSecondOnBed: 5,
    maxOwnedRooms: 2,
  },
  admin: {
    toggleCode: "KeyQ",
    payoutCode: "Insert",
    payoutAmount: 250,
  },
  economy: {
    startingGold: 85,
    goldPerSecondInRoom: 7,
    goldPerSecondOnBedBonus: 7,
  },
  summon: {
    baseCost: 60,
    slotCostStep: 10,
    playerWeights: {
      sentinel: 38,
      rover: 30,
      husk: 22,
      relic: 10,
    },
    hiderWeights: {
      sentinel: 46,
      rover: 27,
      husk: 21,
      relic: 6,
    },
  },
  intel: {
    baseCost: 80,
    fragmentCostStep: 14,
    timeInflation: 0.12,
    fragmentChance: 0.65,
    radarChance: 0.72,
    failChance: 0.92,
    maxFragments: 10,
  },
  door: {
    baseHp: 160,
    reinforceBaseCost: 35,
    reinforceTimeStep: 35,
    reinforceCostStep: 5,
    successChance: 0.56,
    criticalChance: 0.71,
    curseChance: 0.97,
  },
  blackout: {
    minInterval: 55,
    maxInterval: 85,
    spawnAtSeconds: 16,
  },
  mutation: {
    triggerClock: 40,
    maxPressureBonus: 1,
    goldPressureDivisor: 300,
  },
  hunter: {
    baseHp: 180,
    hpPerLevel: 55,
    baseSpeed: 74,
    speedPerLevel: 7,
    blackoutSpeedBonus: 16,
    baseDoorDamage: 12,
    damagePerLevel: 3,
    basePlayerDamage: 12,
    playerDamagePerLevel: 1.6,
  },
  ally: {
    interceptDoorRange: 180,
    defendDoorRange: 220,
  },
  hider: {
    goldGainMultiplier: 0.68,
    decisionMin: 3.6,
    decisionMax: 6.4,
    baseUnitCap: 3,
  },
  infected: {
    playerDamage: 8,
    doorDamage: 6,
  },
  meta: {
    shardEscapeBase: 4,
    shardFailBase: 2,
    tierThresholds: [0, 4, 9, 16],
  },
  feedback: {
    shakeDecayPerSecond: 4.2,
  },
};

const ROOM_TRAITS = [
  { id: "infirmary", label: { ko: "의무실", en: "Infirmary" }, icon: "✚", effect: { healMult: 2.0 }, desc: { ko: "침대 회복 ×2", en: "Bed heal ×2" } },
  { id: "vault", label: { ko: "금고", en: "Vault" }, icon: "◈", effect: { goldMult: 1.5 }, desc: { ko: "골드 수입 ×1.5", en: "Gold income ×1.5" } },
  { id: "armory", label: { ko: "무기고", en: "Armory" }, icon: "⚙", effect: { reinforceCostMult: 0.6 }, desc: { ko: "강화 비용 -40%", en: "Reinforce cost -40%" } },
  { id: "sanctuary", label: { ko: "성소", en: "Sanctuary" }, icon: "◇", effect: { summonCostMult: 0.7 }, desc: { ko: "소환 비용 -30%", en: "Summon cost -30%" } },
  { id: "relay", label: { ko: "중계소", en: "Relay" }, icon: "⊛", effect: { intelCostMult: 0.65 }, desc: { ko: "정보 비용 -35%", en: "Intel cost -35%" } },
];

const WARD_EVENTS = [
  { id: "gold_tax", label: { ko: "골드 세금", en: "Gold Tax" }, desc: { ko: "골드 수입 -35%", en: "Gold income -35%" }, duration: 45 },
  { id: "speed_boost", label: { ko: "긴급 가속", en: "Emergency Sprint" }, desc: { ko: "이동 속도 +25%", en: "Move speed +25%" }, duration: 40 },
  { id: "blood_moon", label: { ko: "블러드 문", en: "Blood Moon" }, desc: { ko: "감염체 체력·속도 +50%", en: "Infected +50% health & speed" }, duration: 35 },
  { id: "echo_scan", label: { ko: "에코 스캔", en: "Echo Scan" }, desc: { ko: "레이더 항상 활성화", en: "Radar always active" }, duration: 50 },
  { id: "gold_rush", label: { ko: "골드 쇄도", en: "Gold Rush" }, desc: { ko: "골드 수입 ×2.2", en: "Gold income ×2.2" }, duration: 30 },
  { id: "phantom_surge", label: { ko: "영체 급증", en: "Phantom Surge" }, desc: { ko: "감염체 이동 속도 +40%", en: "Infected move +40% faster" }, duration: 28 },
  { id: "reinforced_walls", label: { ko: "벽 강화", en: "Reinforced Walls" }, desc: { ko: "플레이어 방 문이 파괴되지 않음", en: "Player room door cannot break" }, duration: 25 },
];

const ANOMALY_TYPES = [
  {
    id: "seal_rift",
    label: { ko: "봉인 균열", en: "Seal Rift" },
    color: "rgba(180, 120, 255, 0.85)",
    timer: [14, 18],
    desc: { ko: "접근하여 봉인하세요.", en: "Approach to seal it." },
    weight: 40,
  },
  {
    id: "plague_nexus",
    label: { ko: "역병 핵", en: "Plague Nexus" },
    color: "rgba(80, 220, 120, 0.85)",
    timer: [20, 26],
    desc: { ko: "감염체를 계속 소환합니다. 접근하여 차단하세요.", en: "Continuously summons infected. Approach to disrupt." },
    weight: 35,
  },
  {
    id: "void_drain",
    label: { ko: "공허 흡수", en: "Void Drain" },
    color: "rgba(255, 80, 80, 0.85)",
    timer: [18, 24],
    desc: { ko: "같은 층의 골드를 흡수합니다. 접근하여 차단하세요.", en: "Drains gold on this floor. Approach to disrupt." },
    weight: 25,
  },
];

const HUNTER_ARCHETYPES = [
  {
    id: "stalker",
    label: { ko: "그림자 추적자", en: "Shadow Stalker" },
    description: {
      ko: "조용하지만 빠르다. 플레이어를 집요하게 압박한다.",
      en: "Silent but fast. Leans hard into player pressure.",
    },
    mods: {
      hunterSpeedMultiplier: 1.16,
      hunterHpMultiplier: 0.94,
      hunterPlayerDamageMultiplier: 1.18,
    },
  },
  {
    id: "juggernaut",
    label: { ko: "공성 괴수", en: "Siege Juggernaut" },
    description: {
      ko: "느리지만 문을 찢는다. 버티기만 해도 부담이 커진다.",
      en: "Slower, but brutal against doors and fortifications.",
    },
    mods: {
      hunterSpeedMultiplier: 0.92,
      hunterHpMultiplier: 1.34,
      hunterDoorDamageMultiplier: 1.3,
    },
  },
  {
    id: "brood",
    label: { ko: "감염 번식체", en: "Brood Host" },
    description: {
      ko: "감염체 압박을 키우며 복도를 장악한다.",
      en: "Amplifies infected pressure across the run.",
    },
    mods: {
      infectedSpeedMultiplier: 1.08,
      infectedHpMultiplier: 1.14,
      blackoutSpawnBonus: 1,
    },
  },
  {
    id: "warden",
    label: { ko: "정전 집행관", en: "Blackout Warden" },
    description: {
      ko: "정전을 더 자주 만들고 발전기 수리를 힘들게 한다.",
      en: "Accelerates blackout cycles and punishes repairs.",
    },
    mods: {
      blackoutIntervalMultiplier: 0.86,
      repairDurationMultiplier: 1.18,
      hunterSpeedMultiplier: 1.05,
      hunterDoorDamageMultiplier: 1.08,
    },
  },
];

const RUN_BOONS = [
  {
    id: "windfall",
    label: { ko: "비밀 자금", en: "Hidden Windfall" },
    description: {
      ko: "시작 자금이 늘고 침대 수익이 좋아진다.",
      en: "More starting gold and stronger bed income.",
    },
    mods: {
      startingGoldBonus: 50,
      goldGainMultiplier: 1.14,
    },
  },
  {
    id: "steadyCurrent",
    label: { ko: "안정 전류", en: "Steady Current" },
    description: {
      ko: "정전이 늦어지고 발전기 수리가 빨라진다.",
      en: "Blackouts come later and repairs are faster.",
    },
    mods: {
      blackoutIntervalMultiplier: 1.24,
      repairDurationMultiplier: 0.82,
    },
  },
  {
    id: "ritualClarity",
    label: { ko: "의식 명료", en: "Ritual Clarity" },
    description: {
      ko: "소환과 정보 구매가 저렴해진다.",
      en: "Summons and intel are cheaper.",
    },
    mods: {
      summonCostMultiplier: 0.9,
      intelCostMultiplier: 0.82,
      playerRelicWeightBonus: 5,
    },
  },
  {
    id: "saltCircle",
    label: { ko: "소금 결계", en: "Salt Circle" },
    description: {
      ko: "변이가 늦어지고 감염체가 둔해진다.",
      en: "Mutations delay and infected slow down.",
    },
    mods: {
      mutationThresholdMultiplier: 1.2,
      infectedSpeedMultiplier: 0.88,
      playerMaxHpBonus: 8,
    },
  },
  {
    id: "ironHide",
    label: { ko: "철갑 피부", en: "Iron Hide" },
    description: {
      ko: "최대 HP +20, 감염체 데미지 -20%",
      en: "Max HP +20, infected damage -20%",
    },
    mods: {
      playerMaxHp: 20,
      infectedDamageMultiplier: 0.8,
    },
  },
  {
    id: "scavenger",
    label: { ko: "약탈자", en: "Scavenger" },
    description: {
      ko: "감염체 처치 시 골드 +2, 조각 획득 확률 +10%",
      en: "Infected kills give +2 gold, fragment chance +10%",
    },
    mods: {
      infectedKillGold: 2,
      fragmentChanceBonus: 0.1,
    },
  },
];

const RUN_OMENS = [
  {
    id: "thinWalls",
    label: { ko: "얇은 벽", en: "Thin Walls" },
    description: {
      ko: "방이 더 빨리 찢어지고 균열이 자주 열린다.",
      en: "Breaches trigger earlier and recur faster.",
    },
    mods: {
      mutationThresholdMultiplier: 0.74,
      breachIntervalMultiplier: 0.8,
    },
  },
  {
    id: "feedingHour",
    label: { ko: "포식 시간", en: "Feeding Hour" },
    description: {
      ko: "감염체가 빨라지고 정전 때 더 많이 쏟아진다.",
      en: "Infected move faster and surge harder in blackouts.",
    },
    mods: {
      infectedSpeedMultiplier: 1.2,
      infectedDamageMultiplier: 1.14,
      blackoutSpawnBonus: 1,
    },
  },
  {
    id: "bloodScent",
    label: { ko: "피 냄새", en: "Blood Scent" },
    description: {
      ko: "술래가 플레이어 방에 더 집착한다.",
      en: "The hunter commits harder to the player's room.",
    },
    mods: {
      hunterSpeedMultiplier: 1.08,
      hunterPlayerDamageMultiplier: 1.12,
      playerAggroBonus: 12,
    },
  },
  {
    id: "deadSignal",
    label: { ko: "죽은 신호", en: "Dead Signal" },
    description: {
      ko: "정보 단말이 불안정하고 레이더가 짧아진다.",
      en: "Intel is pricier and radar windows shrink.",
    },
    mods: {
      intelCostMultiplier: 1.18,
      radarDurationMultiplier: 0.72,
      compassDurationMultiplier: 0.82,
    },
  },
  {
    id: "cursedBlood",
    label: { ko: "저주받은 피", en: "Cursed Blood" },
    description: {
      ko: "HP 회복 효과 -40%, 최대 HP -10",
      en: "Healing -40%, max HP -10",
    },
    mods: {
      healMultiplier: 0.6,
      playerMaxHp: -10,
    },
  },
  {
    id: "paranoia",
    label: { ko: "편집증", en: "Paranoia" },
    description: {
      ko: "와드 이벤트 빠르게 반복, 효과 세짐",
      en: "Ward events repeat faster and hit harder",
    },
    mods: {
      wardEventIntervalMult: 0.80,
      wardEventIntensity: 1.3,
    },
  },
];

const HUNTER_SKILLS = {
  stalker: {
    cooldownMin: 12,
    cooldownMax: 18,
  },
  juggernaut: {
    cooldownMin: 13,
    cooldownMax: 20,
  },
  brood: {
    cooldownMin: 14,
    cooldownMax: 21,
  },
  warden: {
    cooldownMin: 15,
    cooldownMax: 22,
  },
};

const META_TREE = [
  {
    id: "night_ledger",
    tier: 0,
    cost: 3,
    title: { ko: "야간 장부", en: "Night Ledger" },
    description: { ko: "시작 자금과 침대 수익이 늘어납니다.", en: "More starting cash and bed income." },
    mods: {
      startingGoldBonus: 30,
      goldGainMultiplier: 1.08,
    },
  },
  {
    id: "relay_map",
    tier: 0,
    cost: 3,
    title: { ko: "중계 지도", en: "Relay Map" },
    description: { ko: "정보 구매가 싸지고 레이더가 오래 갑니다.", en: "Cheaper intel and longer radar windows." },
    mods: {
      intelCostMultiplier: 0.88,
      radarDurationMultiplier: 1.14,
      compassDurationMultiplier: 1.1,
    },
  },
  {
    id: "iron_vows",
    tier: 1,
    cost: 5,
    parent: "night_ledger",
    title: { ko: "철의 서약", en: "Iron Vows" },
    description: { ko: "체력과 수리 안정성이 올라갑니다.", en: "More HP and steadier repairs." },
    mods: {
      playerMaxHpBonus: 12,
      repairDurationMultiplier: 0.88,
      blackoutIntervalMultiplier: 1.05,
    },
  },
  {
    id: "hex_engine",
    tier: 1,
    cost: 5,
    parent: "relay_map",
    title: { ko: "주술 엔진", en: "Hex Engine" },
    description: { ko: "소환비 절감과 전설 가중치가 붙습니다.", en: "Cheaper summons and better relic odds." },
    mods: {
      summonCostMultiplier: 0.88,
      playerRelicWeightBonus: 4,
    },
  },
  {
    id: "salt_script",
    tier: 2,
    cost: 7,
    parent: "iron_vows",
    title: { ko: "소금 각본", en: "Salt Script" },
    description: { ko: "감염 피해가 줄고 정전 주기가 늦춰집니다.", en: "Lower infected damage and slower blackout cycles." },
    mods: {
      infectedDamageMultiplier: 0.84,
      blackoutIntervalMultiplier: 1.12,
      infectedSpeedMultiplier: 0.92,
    },
  },
  {
    id: "phantom_route",
    tier: 2,
    cost: 7,
    parent: "hex_engine",
    title: { ko: "유령 항로", en: "Phantom Route" },
    description: { ko: "나침반과 AI 방어가 강화됩니다.", en: "Stronger compass time and smarter allied rooms." },
    mods: {
      compassDurationMultiplier: 1.22,
      hiderUnitCapBonus: 1,
      goldGainMultiplier: 1.05,
    },
  },
  {
    id: "iron_bastion",
    tier: 3,
    cost: 9,
    parent: "salt_script",
    title: { ko: "철벽 요새", en: "Iron Bastion" },
    description: { ko: "최대 점령 방 +1, 방 수입 +20%", en: "Max rooms +1, room income +20%" },
    mods: {
      maxOwnedRoomsBonus: 1,
      goldIncomeMult: 1.2,
    },
  },
  {
    id: "spectral_link",
    tier: 3,
    cost: 9,
    parent: "phantom_route",
    title: { ko: "영체 연결", en: "Spectral Link" },
    description: { ko: "정보 성공률 +15%, 이상현상 보상 향상", en: "Intel success +15%, anomaly rewards improved" },
    mods: {
      intelSuccessBonus: 0.15,
      anomalyRewardMult: 1.5,
    },
  },
  {
    id: "blood_pact",
    tier: 2,
    cost: 7,
    parent: "iron_vows",
    title: { ko: "혈맹 계약", en: "Blood Pact" },
    description: { ko: "계약 보상 +35%, 감염체 처치 시 골드 +1", en: "Contract rewards +35%, infected kills give +1 gold" },
    mods: {
      contractRewardMult: 1.35,
      infectedKillGold: 1,
    },
  },
  {
    id: "void_compass",
    tier: 2,
    cost: 7,
    parent: "hex_engine",
    title: { ko: "공허 나침반", en: "Void Compass" },
    description: { ko: "레이더 지속시간 +8초, 정전 지속시간 -25%", en: "Radar duration +8s, blackout duration -25%" },
    mods: {
      radarDurationBonus: 8,
      blackoutDurationMult: 0.75,
    },
  },
];

const INFECTED_TYPES = {
  infected: {
    radius: 11,
    hpMultiplier: 1,
    speedMultiplier: 1,
    playerDamageMultiplier: 1,
    doorDamageMultiplier: 1,
    cooldown: 1,
    phasing: false,
  },
  wisp: {
    radius: 9,
    hpMultiplier: 0.7,
    speedMultiplier: 1.42,
    playerDamageMultiplier: 0.85,
    doorDamageMultiplier: 0,
    cooldown: 0.72,
    phasing: true,
  },
  brute: {
    radius: 14,
    hpMultiplier: 1.65,
    speedMultiplier: 0.78,
    playerDamageMultiplier: 1.35,
    doorDamageMultiplier: 1.85,
    cooldown: 1.3,
    phasing: false,
  },
};

const keys = new Set();
const state = {
  runStartedAt: performance.now(),
  lastFrame: performance.now(),
  movementMode: "wasd",
  clickTarget: null,
  logs: [],
  meta: loadMeta(),
  nextUnitId: 1,
  adminMode: false,
  godMode: false,
  paused: false,
  sidebarCollapsed: window.matchMedia && window.matchMedia("(max-width: 1120px)").matches,
  lowFx: loadPerformanceMode(),
  screenShake: 0,
  audio: createAudioState(),
  effects: [],
  titleVisible: true,
  showTutorial: false,
  banner: null,
  flash: null,
  outcomeText: "",
  lang: loadLanguage(),
  touchStick: {
    active: false,
    pointerId: null,
    dx: 0,
    dy: 0,
  },
  camera: {
    x: 0,
    y: 0,
  },
  runtime: {
    ownedRoom: null,
    prompt: null,
    danger: 0,
    incomeText: "",
  },
  perf: {
    avgDt: 1 / 60,
    slowFrames: 0,
    ambientTick: 0,
    autoLowFx: false,
  },
  hudCache: {
    lastRenderAt: 0,
    stats: "",
    meta: "",
    objective: "",
    prompt: "",
    help: "",
    log: "",
  },
};

const colors = {
  wall: "#162021",
  floor: "#101717",
  hall: "#141d1d",
  room: "#111818",
  bed: "#2f4e49",
  altar: "#684538",
  terminal: "#39505a",
  generator: "#7f8154",
  exit: "#5e7f8e",
  door: "#716151",
  doorOpen: "#2f433e",
  hunter: "#d84a4a",
  infected: "#d27447",
  player: "#dbece1",
  hider: "#9ecbff",
  sentinel: "#7dc5ff",
  rover: "#b9efaa",
  relic: "#e4b8ff",
  husk: "#8f6f56",
};

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function computeUnlockTier(shards) {
  let tier = 0;
  for (let index = 0; index < CONFIG.meta.tierThresholds.length; index += 1) {
    if (shards >= CONFIG.meta.tierThresholds[index]) {
      tier = index;
    }
  }
  return tier;
}

function getMetaBonuses(meta) {
  const archiveXp = meta.archiveXp ?? meta.shards ?? 0;
  const tier = computeUnlockTier(archiveXp);
  const baseBonuses = {
    tier,
    startingGoldBonus: [0, 30, 65, 110][tier] || 0,
    playerMaxHpBonus: [0, 0, 12, 24][tier] || 0,
    summonCostMultiplier: [1, 1, 0.94, 0.88][tier] || 1,
    intelCostMultiplier: [1, 1, 0.96, 0.9][tier] || 1,
    repairDurationMultiplier: [1, 1, 0.94, 0.86][tier] || 1,
    goldGainMultiplier: [1, 1.04, 1.08, 1.12][tier] || 1,
    playerRelicWeightBonus: [0, 0, 2, 4][tier] || 0,
    hiderUnitCapBonus: [0, 0, 1, 1][tier] || 0,
  };
  const selectedNodeMods = (meta.selectedNodes || [])
    .slice(0, getMetaSelectionLimit(meta))
    .filter((nodeId) => (meta.unlockedNodes || []).includes(nodeId))
    .map((nodeId) => META_TREE.find((entry) => entry.id === nodeId)?.mods)
    .filter(Boolean);
  return combineRunModifiers(baseBonuses, ...selectedNodeMods);
}

function getMetaSelectionLimit(meta) {
  const archiveXp = meta.archiveXp ?? meta.shards ?? 0;
  const tier = computeUnlockTier(archiveXp);
  return [1, 1, 2, 3][tier] || 1;
}

function combineRunModifiers(...modifierSets) {
  const combined = {
    startingGoldBonus: 0,
    goldGainMultiplier: 1,
    summonCostMultiplier: 1,
    intelCostMultiplier: 1,
    repairDurationMultiplier: 1,
    blackoutIntervalMultiplier: 1,
    radarDurationMultiplier: 1,
    compassDurationMultiplier: 1,
    mutationThresholdMultiplier: 1,
    mutationPressureMultiplier: 1,
    breachIntervalMultiplier: 1,
    playerMaxHpBonus: 0,
    hunterSpeedMultiplier: 1,
    hunterDamageMultiplier: 1,
    hunterPlayerDamageMultiplier: 1,
    hunterDoorDamageMultiplier: 1,
    hunterHpMultiplier: 1,
    infectedSpeedMultiplier: 1,
    infectedDamageMultiplier: 1,
    infectedHpMultiplier: 1,
    blackoutSpawnBonus: 0,
    playerRelicWeightBonus: 0,
    playerAggroBonus: 0,
    hiderGoldMultiplier: 1,
    hiderUnitCapBonus: 0,
    infectedKillGold: 0,
    fragmentChanceBonus: 0,
    playerMaxHp: 0,
    healMultiplier: 1,
    wardEventIntervalMult: 1,
    wardEventIntensity: 1,
    contractRewardMult: 1,
    anomalyRewardMult: 1,
    intelSuccessBonus: 0,
    radarDurationBonus: 0,
    blackoutDurationMult: 1,
    maxOwnedRoomsBonus: 0,
    goldIncomeMult: 1,
  };
  const additive = new Set([
    "startingGoldBonus",
    "playerMaxHpBonus",
    "blackoutSpawnBonus",
    "playerRelicWeightBonus",
    "playerAggroBonus",
    "hiderUnitCapBonus",
    "infectedKillGold",
    "fragmentChanceBonus",
    "playerMaxHp",
    "intelSuccessBonus",
    "radarDurationBonus",
    "maxOwnedRoomsBonus",
  ]);

  for (const source of modifierSets) {
    if (!source) {
      continue;
    }
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) {
        continue;
      }
      if (additive.has(key)) {
        combined[key] += value;
      } else {
        combined[key] *= value;
      }
    }
  }
  return combined;
}

function createRunProfile(metaBonuses) {
  const hunter = pickOne(HUNTER_ARCHETYPES);
  const boon = pickOne(RUN_BOONS);
  const omen = pickOne(RUN_OMENS);
  return {
    hunter,
    boon,
    omen,
    modifiers: combineRunModifiers(metaBonuses, hunter.mods, boon.mods, omen.mods),
  };
}

function getUnlockSummary(meta) {
  const archiveXp = meta.archiveXp ?? meta.shards ?? 0;
  const tier = computeUnlockTier(archiveXp);
  const summaries = [
    { ko: "T0 기본", en: "T0 Base" },
    { ko: "T1 시작 골드 보정", en: "T1 Bonus start gold" },
    { ko: "T2 체력 + 비용 할인", en: "T2 HP + cost cuts" },
    { ko: "T3 상위 기록 보정", en: "T3 advanced archive" },
  ];
  return localize(summaries[tier] || summaries[0]);
}

function isMetaNodeUnlocked(meta, nodeId) {
  return (meta.unlockedNodes || []).includes(nodeId);
}

function isMetaNodeSelected(meta, nodeId) {
  return (meta.selectedNodes || []).includes(nodeId);
}

function canUnlockMetaNode(meta, node) {
  const archiveXp = meta.archiveXp ?? meta.shards ?? 0;
  const tier = computeUnlockTier(archiveXp);
  const hasParent = !node.parent || isMetaNodeUnlocked(meta, node.parent);
  return tier >= node.tier && hasParent && (meta.shards || 0) >= node.cost && !isMetaNodeUnlocked(meta, node.id);
}

function renderMetaTree() {
  const activeCount = (state.meta.selectedNodes || []).length;
  const slotLimit = getMetaSelectionLimit(state.meta);
  const archiveXp = state.meta.archiveXp ?? state.meta.shards ?? 0;
  const tier = computeUnlockTier(archiveXp);
  const rows = META_TREE.map((node) => {
    const unlocked = isMetaNodeUnlocked(state.meta, node.id);
    const selected = isMetaNodeSelected(state.meta, node.id);
    const canUnlock = canUnlockMetaNode(state.meta, node);
    const buttonLabel = unlocked
      ? selected
        ? t("meta_deselect_action")
        : t("meta_select_action")
      : t("meta_unlock_action");
    const status = unlocked
      ? selected
        ? t("meta_active")
        : t("meta_inactive")
      : node.parent && !isMetaNodeUnlocked(state.meta, node.parent)
        ? t("meta_need_parent")
        : tier < node.tier
          ? `T${node.tier}`
          : (state.meta.shards || 0) < node.cost
            ? t("meta_need_shards")
            : t("meta_locked");
    return `
      <div class="meta-node ${selected ? "active" : ""} ${unlocked ? "unlocked" : "locked"}">
        <div class="meta-node-copy">
          <div class="meta-node-head">
            <strong>${localize(node.title)}</strong>
            <span>T${node.tier} · ${node.cost}</span>
          </div>
          <p>${localize(node.description)}</p>
          <div class="meta-node-state">${status}</div>
        </div>
        <button
          type="button"
          class="meta-node-button"
          data-meta-node="${node.id}"
          ${!unlocked && !canUnlock ? "disabled" : ""}
        >${buttonLabel}</button>
      </div>
    `;
  }).join("");

  return `
    <div class="meta-tree-summary">
      <div class="stat-row"><span>${t("meta_slots")}</span><strong>${activeCount} / ${slotLimit}</strong></div>
      <div class="meta-tree-note">${t("meta_next_run")}</div>
    </div>
    <div class="meta-tree">${rows}</div>
  `;
}

function handleMetaNodeAction(nodeId) {
  const node = META_TREE.find((entry) => entry.id === nodeId);
  if (!node) {
    return;
  }

  state.meta.unlockedNodes = state.meta.unlockedNodes || [];
  state.meta.selectedNodes = state.meta.selectedNodes || [];

  if (!isMetaNodeUnlocked(state.meta, node.id)) {
    if (!canUnlockMetaNode(state.meta, node)) {
      return;
    }
    state.meta.shards -= node.cost;
    state.meta.unlockedNodes.push(node.id);
    saveMeta(state.meta);
    renderHud(true);
    pushLog(langText(`${localize(node.title)} 해금.`, `${localize(node.title)} unlocked.`));
    return;
  }

  if (isMetaNodeSelected(state.meta, node.id)) {
    state.meta.selectedNodes = state.meta.selectedNodes.filter((entry) => entry !== node.id);
    saveMeta(state.meta);
    renderHud(true);
    pushLog(langText(`${localize(node.title)} 해제. 다음 런에 반영됩니다.`, `${localize(node.title)} unequipped for the next run.`));
    return;
  }

  if (state.meta.selectedNodes.length >= getMetaSelectionLimit(state.meta)) {
    pushLog(langText("장착 슬롯이 가득 찼습니다.", "No archive slots left."));
    return;
  }
  state.meta.selectedNodes.push(node.id);
  saveMeta(state.meta);
  renderHud(true);
  pushLog(langText(`${localize(node.title)} 장착. 다음 런에 반영됩니다.`, `${localize(node.title)} equipped for the next run.`));
}

function announceRunSetup() {
  pushLog(langText(`술래 유형: ${localize(game.runProfile.hunter.label)}`, `Hunter archetype: ${localize(game.runProfile.hunter.label)}`));
  pushLog(
    langText(
      `가호: ${localize(game.runProfile.boon.label)} / 흉조: ${localize(game.runProfile.omen.label)}`,
      `Boon: ${localize(game.runProfile.boon.label)} / Omen: ${localize(game.runProfile.omen.label)}`,
    ),
  );
  if (game.metaBonuses.tier > 0) {
    pushLog(
      langText(
        `기록 보정 적용: ${getUnlockSummary(state.meta)}`,
        `Archive bonus active: ${getUnlockSummary(state.meta)}`,
      ),
    );
  }
}

function rollBlackoutTimer(profile = game.runProfile) {
  return randomRange(CONFIG.blackout.minInterval, CONFIG.blackout.maxInterval) * profile.modifiers.blackoutIntervalMultiplier;
}

const world = buildWorld();
const worldBounds = getWorldBounds(world);
let game = createGame();
const navGraph = buildNavGraph(world);
updateCamera();

function buildWorld() {
  const hall = { id: "hall", floor: "f1", x: 240, y: 350, w: 1600, h: 320, label: "Grand Hall" };
  const exitConnector = { id: "exitConnector", floor: "f1", x: 1840, y: 455, w: 170, h: 110, label: "Service Corridor" };
  const generatorConnector = { id: "generatorConnector", floor: "f1", x: 1640, y: 670, w: 170, h: 130, label: "Power Drop" };
  const rooms = [
    createRoom("northFarWest", "North Archive", 190, 130, 280, 220, 330, 350, "f1"),
    createRoom("northWest", "North Ward", 480, 130, 280, 220, 620, 350, "f1"),
    createRoom("northCenter", "Observation", 770, 130, 280, 220, 910, 350, "f1"),
    createRoom("northEast", "Old Infirmary", 1060, 130, 280, 220, 1200, 350, "f1"),
    createRoom("northFarEast", "Prayer Ward", 1350, 130, 280, 220, 1490, 350, "f1"),
    createRoom("southFarWest", "Evidence Vault", 190, 670, 280, 220, 330, 670, "f1"),
    createRoom("southWest", "Storage Wing", 480, 670, 280, 220, 620, 670, "f1"),
    createRoom("southCenter", "Dormitory", 770, 670, 280, 220, 910, 670, "f1"),
    createRoom("southEast", "Isolation", 1060, 670, 280, 220, 1200, 670, "f1"),
    createRoom("southFarEast", "Mortuary Annex", 1350, 670, 280, 220, 1490, 670, "f1"),
  ];
  const upperHall = { id: "upperHall", floor: "f2", x: 320, y: 350, w: 1140, h: 300, label: "Archive Upper Hall" };
  const upperRooms = [
    createRoom("upperNorthWest", "Archive Cells", 340, 120, 260, 210, 470, 350, "f2"),
    createRoom("upperNorthEast", "Survey Deck", 680, 120, 260, 210, 810, 350, "f2"),
    createRoom("upperSouthWest", "Specimen Lab", 520, 670, 280, 210, 660, 670, "f2"),
    createRoom("upperSouthEast", "Signal Room", 980, 670, 280, 210, 1120, 670, "f2"),
  ];
  const generatorRoom = {
    id: "generator",
    floor: "f1",
    x: 1540,
    y: 800,
    w: 420,
    h: 180,
    label: "Generator Room",
    door: {
      x: 1700,
      y: 800,
      w: 40,
      h: 10,
      centerX: 1720,
      centerY: 800,
      closed: false,
    },
  };
  const exitRoom = {
    id: "exit",
    floor: "f1",
    x: 2010,
    y: 420,
    w: 220,
    h: 180,
    label: "Service Gate",
    gate: {
      x: 2010,
      y: 490,
      w: 10,
      h: 40,
      centerX: 2015,
      centerY: 510,
      closed: true,
    },
  };

  const zones = [hall, exitConnector, generatorConnector, generatorRoom, exitRoom, upperHall, ...rooms, ...upperRooms];
  const barriers = [];

  for (const room of [...rooms, ...upperRooms]) {
    const sharedY = room.y < hall.y ? hall.y : room.y;
    barriers.push(
      { floor: room.floor, x: room.x, y: sharedY - 4, w: room.door.x - room.x, h: 8 },
      {
        floor: room.floor,
        x: room.door.x + room.door.w,
        y: sharedY - 4,
        w: room.x + room.w - (room.door.x + room.door.w),
        h: 8,
      },
    );
  }

  barriers.push(
    { floor: "f1", x: generatorRoom.x, y: generatorRoom.y - 4, w: generatorRoom.door.x - generatorRoom.x, h: 8 },
    {
      floor: "f1",
      x: generatorRoom.door.x + generatorRoom.door.w,
      y: generatorRoom.y - 4,
      w: generatorRoom.x + generatorRoom.w - (generatorRoom.door.x + generatorRoom.door.w),
      h: 8,
    },
    { floor: "f1", x: exitRoom.x - 4, y: exitRoom.y, w: 8, h: exitRoom.gate.y - exitRoom.y },
    {
      floor: "f1",
      x: exitRoom.x - 4,
      y: exitRoom.gate.y + exitRoom.gate.h,
      w: 8,
      h: exitRoom.y + exitRoom.h - (exitRoom.gate.y + exitRoom.gate.h),
    },
  );

  return {
    hall,
    upperHall,
    exitConnector,
    generatorConnector,
    rooms: [...rooms, ...upperRooms],
    generatorRoom,
    exitRoom,
    zones,
    barriers,
    generator: { x: 1720, y: 885, radius: 28 },
    elevators: [
      {
        id: "liftF1",
        floor: "f1",
        x: 1590,
        y: 510,
        radius: 24,
        label: "Archive Lift",
        destinationFloor: "f2",
        destinationX: 420,
        destinationY: 510,
      },
      {
        id: "liftF2",
        floor: "f2",
        x: 420,
        y: 510,
        radius: 24,
        label: "Archive Lift",
        destinationFloor: "f1",
        destinationX: 1590,
        destinationY: 510,
      },
    ],
    keycards: [
      { id: "sigilWest", floor: "f1", x: 1720, y: 930, roomId: "generator", threshold: 4, collected: false, visible: false },
      { id: "sigilEast", floor: "f2", x: 1110, y: 780, roomId: "upperSouthEast", threshold: 7, collected: false, visible: false },
    ],
  };
}

function getWorldBounds(currentWorld) {
  const xs = currentWorld.zones.map((zone) => zone.x);
  const ys = currentWorld.zones.map((zone) => zone.y);
  const maxXs = currentWorld.zones.map((zone) => zone.x + zone.w);
  const maxYs = currentWorld.zones.map((zone) => zone.y + zone.h);
  return {
    minX: Math.min(...xs) - 80,
    minY: Math.min(...ys) - 80,
    maxX: Math.max(...maxXs) + 80,
    maxY: Math.max(...maxYs) + 80,
    w: Math.max(...maxXs) - Math.min(...xs) + 160,
    h: Math.max(...maxYs) - Math.min(...ys) + 160,
  };
}

function updateCamera() {
  if (!game || !game.player) {
    return;
  }
  state.camera.x = clamp(game.player.x - WIDTH / 2, worldBounds.minX, worldBounds.maxX - WIDTH);
  state.camera.y = clamp(game.player.y - HEIGHT / 2, worldBounds.minY, worldBounds.maxY - HEIGHT);
}

function worldToScreen(point) {
  return {
    x: point.x - state.camera.x,
    y: point.y - state.camera.y,
  };
}

function createRoom(id, label, x, y, w, h, doorCenterX, doorY, floor = "f1") {
  const doorHeight = 10;
  const doorWidth = 40;
  const bed = { x: x + w * 0.28, y: y + h * 0.42, radius: 26 };
  return {
    id,
    floor,
    label,
    x,
    y,
    w,
    h,
    bed,
    altar: { x: x + w * 0.72, y: y + h * 0.36, radius: 18 },
    terminal: { x: x + w * 0.72, y: y + h * 0.67, radius: 18 },
    spawnPoints: [
      { x: x + 86, y: y + 58 },
      { x: x + w - 86, y: y + 58 },
      { x: x + w / 2, y: y + h - 52 },
    ],
    door: {
      x: doorCenterX - doorWidth / 2,
      y: doorY - doorHeight / 2,
      w: doorWidth,
      h: doorHeight,
      centerX: doorCenterX,
      centerY: doorY,
      maxHp: CONFIG.door.baseHp,
      hp: CONFIG.door.baseHp,
      closed: false,
      broken: false,
      thorns: false,
      curse: false,
    },
    owner: null,
    occupied: false,
    breach: false,
    breachTimer: 18,
    aggro: 8,
    trait: null,
  };
}

function createGame() {
  const metaBonuses = getMetaBonuses(state.meta);
  const runProfile = createRunProfile(metaBonuses);

  for (const room of world.rooms) {
    room.owner = null;
    room.occupied = false;
    room.breach = false;
    room.breachTimer = 18;
    room.aggro = 6;
    room.door.maxHp = CONFIG.door.baseHp;
    room.door.hp = CONFIG.door.baseHp;
    room.door.closed = false;
    room.door.broken = false;
    room.door.thorns = false;
    room.door.curse = false;
    room.trait = null;
  }
  // Assign random traits to 4-5 vacant rooms
  {
    const shuffled = world.rooms.slice().sort(() => Math.random() - 0.5);
    const traitCount = Math.min(5, shuffled.length);
    for (let i = 0; i < traitCount; i++) {
      shuffled[i].trait = ROOM_TRAITS[i % ROOM_TRAITS.length].id;
    }
  }

  for (const keycard of world.keycards) {
    keycard.collected = false;
    keycard.visible = false;
  }

  world.exitRoom.gate.closed = true;

  const player = {
    x: world.hall.x + world.hall.w / 2,
    y: world.hall.y + world.hall.h / 2 + 28,
    floor: "f1",
    radius: 12,
    hp: CONFIG.player.maxHp + runProfile.modifiers.playerMaxHpBonus + (runProfile.modifiers.playerMaxHp || 0),
    maxHp: CONFIG.player.maxHp + runProfile.modifiers.playerMaxHpBonus + (runProfile.modifiers.playerMaxHp || 0),
    speed: CONFIG.player.speed,
    roomId: null,
    ownedRoomId: null,
    abandonPrompt: null,
    abandonPromptTimer: 0,
    holdingRepair: 0,
    holdingEscape: 0,
    lastSafeHeal: 0,
    lastDamageSource: "unknown",
    spawnShield: 5,
  };

  const hunter = {
    x: world.hall.x + 180,
    y: world.hall.y + 82,
    floor: "f1",
    radius: 16,
    hp: (CONFIG.hunter.baseHp + CONFIG.hunter.hpPerLevel) * runProfile.modifiers.hunterHpMultiplier,
    targetRoomId: null,
    targetX: world.hall.x + world.hall.w / 2,
    targetY: world.hall.y + world.hall.h / 2,
    speed: 72,
    attackCooldown: 0,
    retargetTimer: 0,
    level: 1,
    mode: "stalk",
    modeTimer: 0,
    wakeDelay: 4.5,
    decoyTimer: 0,
    charging: false,
    chargeTimer: 0,
    _announcedL3: false,
    _announcedL5: false,
    _announcedL8: false,
    _announcedL10: false,
    _announcedL12: false,
    _breachAttemptTimer: randomRange(35, 55),
    skillCooldown: randomRange(
      HUNTER_SKILLS[runProfile.hunter.id].cooldownMin,
      HUNTER_SKILLS[runProfile.hunter.id].cooldownMax,
    ),
  };

  const assigned = new Map([
    ["northFarWest", "hiderA"],
    ["northWest", "hiderB"],
    ["northEast", "hiderC"],
    ["southWest", "hiderD"],
    ["southFarEast", "hiderE"],
    ["upperNorthEast", "hiderF"],
  ]);

  const hiders = [];
  for (const room of world.rooms) {
    const owner = assigned.get(room.id);
    if (owner) {
      room.owner = owner;
      room.occupied = true;
      room.door.closed = true;
      hiders.push({
        id: owner,
        roomId: room.id,
        floor: room.floor,
        x: room.bed.x,
        y: room.bed.y,
        radius: 11,
        alive: true,
        gold: 60,
        decisionTimer: randomRange(CONFIG.hider.decisionMin, CONFIG.hider.decisionMax),
        unitCap: CONFIG.hider.baseUnitCap + runProfile.modifiers.hiderUnitCapBonus,
        panic: 0,
      });
      room.aggro = 18;
    } else {
      room.owner = null;
      room.occupied = false;
      room.door.closed = false;
      room.aggro = 6;
    }
  }

  return {
    phase: "running",
    player,
    hunter,
    hiders,
    units: [],
    infected: [],
    gold: CONFIG.economy.startingGold + runProfile.modifiers.startingGoldBonus,
    time: 0,
    radarTime: 0,
    compassTime: 0,
    fragments: 0,
    keycardsCollected: 0,
    blackoutActive: false,
    blackoutTimer: Math.max(rollBlackoutTimer(runProfile), 90),
    blackoutDuration: 0,
    suppressionTime: 0,
    mutationClock: 0,
    repairNoise: 0,
    intelNoise: 0,
    winFlash: 0,
    contract: null,
    nextContractTimer: 18,
    anomaly: null,
    nextAnomalyTimer: randomRange(26, 40),
    floorHazards: {
      powerSurge: 0,
      archiveLock: 0,
      lockdown: false,
    },
    stats: {
      infectedKills: 0,
      intelPurchases: 0,
      contractsCompleted: 0,
      anomaliesClosed: 0,
      damageTaken: 0,
      peakGold: 0,
      reinforceDone: 0,
      guardianKills: 0,
    },
    blackoutWarning: false,
    wardEvent: null,
    wardEventTimer: randomRange(80, 130) * (runProfile.modifiers.wardEventIntervalMult || 1),
    wardEventCount: 0,
    escapeWindow: null,
    escapeReopenTimer: 0,
    raidActive: false,
    raidTimer: 0,
    nextRaidTimer: randomRange(210, 300),
    nextMiniRaidTimer: randomRange(100, 140),
    floatTexts: [],
    _goldFloatTimer: 0,
    _footstepTimer: 0,
    _mutationWarned: false,
    runProfile,
    metaBonuses,
  };
}

function resetGame() {
  setPaused(false);
  state.clickTarget = null;
  resetTouchStick();
  state.nextUnitId = 1;
  state.logs = [];
  state.screenShake = 0;
  state.effects = [];
  state.banner = null;
  state.flash = null;
  state.outcomeText = "";
  state.showTutorial = false;
  game = createGame();
  updateCamera();
  refreshRuntimeState();
  pushLog(langText("런을 초기화했습니다. 방을 점거하고 탈출까지 버텨보세요.", "Run reset. Claim a room and survive long enough to escape."));
  announceRunSetup();
  renderHud(true);
}

function setPaused(nextPaused) {
  if ((state.titleVisible || game.phase !== "running") && nextPaused) {
    return;
  }
  state.paused = nextPaused;
  if (state.paused) {
    keys.clear();
    resetTouchStick();
  }
  pauseOverlay.classList.toggle("hidden", !state.paused);
  pauseButton.textContent = state.paused ? t("resume") : t("pause");
  if (state.paused && game && game.phase === "running") {
    const elapsed = formatTime(game.time);
    const wardInfo = game.wardEvent
      ? (state.lang === "ko" ? `⚠ ${WARD_EVENTS.find((e) => e.id === game.wardEvent.id)?.label.ko || game.wardEvent.id} ${Math.ceil(game.wardEvent.timer)}s` : `⚠ ${WARD_EVENTS.find((e) => e.id === game.wardEvent.id)?.label.en || game.wardEvent.id} ${Math.ceil(game.wardEvent.timer)}s`)
      : (state.lang === "ko" ? "정상" : "Normal");
    const contractInfo = game.contract
      ? `${localize(game.contract.title)} (${Math.ceil(game.contract.expiresIn)}s)`
      : (state.lang === "ko" ? "없음" : "None");
    const blackoutInfo = game.blackoutActive
      ? (state.lang === "ko" ? "활성" : "ACTIVE")
      : `${Math.ceil(game.blackoutTimer)}s`;
    pauseCopy.innerHTML = state.lang === "ko"
      ? `시간: <strong>${elapsed}</strong> &nbsp;|&nbsp; 체력: <strong>${Math.ceil(game.player.hp)}/${game.player.maxHp}</strong> &nbsp;|&nbsp; 조각: <strong>${game.fragments}/6</strong> &nbsp;|&nbsp; 골드: <strong>${Math.floor(game.gold)}</strong><br>계약: <strong>${contractInfo}</strong> &nbsp;|&nbsp; 격리 이상: <strong>${wardInfo}</strong> &nbsp;|&nbsp; 정전: <strong>${blackoutInfo}</strong>`
      : `Time: <strong>${elapsed}</strong> &nbsp;|&nbsp; HP: <strong>${Math.ceil(game.player.hp)}/${game.player.maxHp}</strong> &nbsp;|&nbsp; Frags: <strong>${game.fragments}/6</strong> &nbsp;|&nbsp; Gold: <strong>${Math.floor(game.gold)}</strong><br>Contract: <strong>${contractInfo}</strong> &nbsp;|&nbsp; Ward: <strong>${wardInfo}</strong> &nbsp;|&nbsp; Blackout: <strong>${blackoutInfo}</strong>`;
  }
  applyStaticText();
}

function togglePause() {
  if (state.titleVisible || game.phase !== "running") {
    return;
  }
  setPaused(!state.paused);
}

function toggleMute() {
  state.audio.muted = !state.audio.muted;
  saveMutePreference(state.audio.muted);
  applyStaticText();
}

function resetTouchStick() {
  state.touchStick.active = false;
  state.touchStick.pointerId = null;
  state.touchStick.dx = 0;
  state.touchStick.dy = 0;
  mobileStickThumb.style.transform = "translate3d(0, 0, 0)";
}

let _mobileStickRect = null;
window.addEventListener("resize", () => { _mobileStickRect = null; }, { passive: true });

function handleStickPointerDown(event) {
  if (!window.matchMedia || !window.matchMedia("(pointer: coarse)").matches) {
    return;
  }
  ensureAudio();
  if (state.titleVisible) {
    startRun();
  }
  if (state.paused) {
    return;
  }
  event.preventDefault();
  state.touchStick.active = true;
  state.touchStick.pointerId = event.pointerId;
  updateTouchStickFromEvent(event);
}

function handleStickPointerMove(event) {
  if (!state.touchStick.active || state.touchStick.pointerId !== event.pointerId) {
    return;
  }
  event.preventDefault();
  updateTouchStickFromEvent(event);
}

function handleStickPointerUp(event) {
  if (!state.touchStick.active || state.touchStick.pointerId !== event.pointerId) {
    return;
  }
  resetTouchStick();
}

function updateTouchStickFromEvent(event) {
  if (!_mobileStickRect) _mobileStickRect = mobileStick.getBoundingClientRect();
  const rect = _mobileStickRect;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxRadius = rect.width * 0.27;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const len = Math.hypot(dx, dy) || 1;
  if (len > maxRadius) {
    dx = (dx / len) * maxRadius;
    dy = (dy / len) * maxRadius;
  }
  state.touchStick.dx = dx / maxRadius;
  state.touchStick.dy = dy / maxRadius;
  mobileStickThumb.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
}

function startRun() {
  if (!state.titleVisible) {
    return;
  }
  ensureAudio();
  state.titleVisible = false;
  titleOverlay.classList.add("hidden");
  if (!state.meta.seenTutorial) state.showTutorial = true;
  showBanner(
    localize(game.runProfile.hunter.label),
    `${localize(game.runProfile.boon.label)} / ${localize(game.runProfile.omen.label)}`,
    "cyan",
    1.8,
  );
  flashScreen("rgba(133, 216, 255, 0.18)", 0.34, 0.2);
  // Game start ascending arpeggio
  playUiTone(400, 0.07, "triangle", 0.04);
  setTimeout(() => playUiTone(540, 0.07, "triangle", 0.04), 80);
  setTimeout(() => playUiTone(720, 0.10, "triangle", 0.045), 160);
}

function toggleLanguage() {
  state.lang = state.lang === "ko" ? "en" : "ko";
  saveLanguage(state.lang);
  applyStaticText();
  renderHud(true);
  playUiTone(state.lang === "en" ? 520 : 480, 0.08, "triangle", 0.03);
}

function applyStaticText() {
  document.documentElement.lang = state.lang;
  subtitleText.textContent = t("subtitle");
  themeChip.textContent = t("themeChip");
  performanceButton.textContent = state.lowFx ? t("performance_on") : t("performance_off");
  hudToggleButton.textContent = state.sidebarCollapsed ? t("hud_show") : t("hud_hide");
  muteButton.textContent = state.audio.muted ? t("mute_off") : t("mute_on");
  pauseButton.textContent = state.paused ? t("resume") : t("pause");
  restartButton.textContent = t("restart");
  guideButton.textContent = state.lang === "ko" ? "가이드" : "Guide";
  alarmStrip.textContent = t("alarm");
  titleKicker.textContent = t("titleKicker");
  titleOverlayHeading.textContent = t("titleOverlayHeading");
  titleOverlayCopy.innerHTML = t("titleOverlayCopy").replace(/\n/g, "<br>");
  startButton.textContent = t("start");
  missionHeading.textContent = t("missionHeading");
  runHeading.textContent = t("runHeading");
  controlsHeading.textContent = t("controlsHeading");
  logHeading.textContent = t("logHeading");
  metaHeading.textContent = t("metaHeading");
  helpHeading.textContent = t("helpHeading");
  helpText.textContent = t("helpText");
  pauseKicker.textContent = t("pauseKicker");
  pauseHeading.textContent = t("pauseHeading");
  pauseCopy.textContent = t("pauseCopy");
  resumeButton.textContent = t("resume");
  pauseMuteButton.textContent = state.audio.muted ? t("mute_off") : t("mute_on");
  dockModeButton.textContent = t("dock_mode");
  dockInteractButton.textContent = t("dock_interact");
  dockReinforceButton.textContent = t("dock_reinforce");
  languageButton.textContent = state.lang === "ko" ? "EN" : "KO";
  sidebar.classList.toggle("collapsed", state.sidebarCollapsed);
  document.body.classList.toggle("low-fx", state.lowFx);
  controlsList.innerHTML = I18N[state.lang].controls
    .map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`)
    .join("");
}

restartButton.addEventListener("click", resetGame);
startButton.addEventListener("click", startRun);
guideButton.addEventListener("click", () => {
  guideOverlay.classList.toggle("hidden");
  if (!guideOverlay.classList.contains("hidden") && game && game.phase === "running" && !state.paused) {
    setPaused(true);
  }
});
guideCloseButton.addEventListener("click", () => {
  guideOverlay.classList.add("hidden");
});
guideOverlay.addEventListener("click", (e) => {
  if (e.target === guideOverlay) guideOverlay.classList.add("hidden");
});
languageButton.addEventListener("click", toggleLanguage);
performanceButton.addEventListener("click", () => {
  state.lowFx = !state.lowFx;
  savePerformanceMode(state.lowFx);
  applyStaticText();
  renderHud(true);
  pushLog(state.lowFx ? langText("간소화 모드 활성화.", "Lite FX enabled.") : langText("간소화 모드 비활성화.", "Lite FX disabled."));
  playUiTone(state.lowFx ? 280 : 600, 0.08, "triangle", 0.03);
});
hudToggleButton.addEventListener("click", () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applyStaticText();
  playUiTone(state.sidebarCollapsed ? 320 : 480, 0.06, "triangle", 0.025);
});
muteButton.addEventListener("click", toggleMute);
pauseButton.addEventListener("click", () => {
  togglePause();
});
resumeButton.addEventListener("click", () => {
  setPaused(false);
});
pauseMuteButton.addEventListener("click", toggleMute);
metaEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-meta-node]");
  if (!button) {
    return;
  }
  handleMetaNodeAction(button.dataset.metaNode);
});
dockModeButton.addEventListener("click", () => {
  state.movementMode = state.movementMode === "wasd" ? "click" : "wasd";
  state.clickTarget = null;
  pushLog(state.lang === "ko" ? `이동 방식: ${t(`movement_${state.movementMode}`)}` : `Movement mode: ${state.movementMode.toUpperCase()}`);
  playUiTone(state.movementMode === "wasd" ? 540 : 380, 0.07, "triangle", 0.03);
});
dockInteractButton.addEventListener("click", () => {
  ensureAudio();
  if (state.titleVisible) {
    startRun();
  }
  triggerInteract();
});
dockReinforceButton.addEventListener("click", () => {
  ensureAudio();
  if (state.titleVisible) {
    startRun();
  }
  attemptReinforce();
});

window.addEventListener("keydown", (event) => {
  ensureAudio();
  const key = event.key.toLowerCase();
  const code = event.code;

  if (state.showTutorial) {
    state.showTutorial = false;
    state.meta.seenTutorial = true;
    saveMeta(state.meta);
    return;
  }

  if (state.titleVisible) {
    const launchKeys = new Set(["enter", " ", "w", "a", "s", "d", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "KeyW", "KeyA", "KeyS", "KeyD", "KeyE"]);
    if (launchKeys.has(key) || launchKeys.has(code)) {
      event.preventDefault();
      startRun();
    }
  }

  if (event.key === "Escape" || key === "p" || code === "KeyP") {
    event.preventDefault();
    if (!guideOverlay.classList.contains("hidden")) {
      guideOverlay.classList.add("hidden");
      return;
    }
    togglePause();
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    state.movementMode = state.movementMode === "wasd" ? "click" : "wasd";
    state.clickTarget = null;
    pushLog(state.lang === "ko" ? `이동 방식: ${t(`movement_${state.movementMode}`)}` : `Movement mode: ${state.movementMode.toUpperCase()}`);
    playUiTone(state.movementMode === "wasd" ? 540 : 380, 0.07, "triangle", 0.03);
    return;
  }

  if (code === CONFIG.admin.toggleCode || event.key === "F1") {
    event.preventDefault();
    state.adminMode = !state.adminMode;
    if (!state.adminMode) state.godMode = false;
    pushLog(state.lang === "ko" ? `운영자 모드 ${state.adminMode ? "활성화" : "비활성화"}.` : `Admin mode ${state.adminMode ? "enabled" : "disabled"}.`);
    playUiTone(state.adminMode ? 680 : 280, 0.08, "triangle", 0.035);
    return;
  }

  if (code === CONFIG.admin.payoutCode) {
    if (state.adminMode) {
      addGold(CONFIG.admin.payoutAmount);
      pushLog(state.lang === "ko" ? `운영자 자금 투입: +${CONFIG.admin.payoutAmount} 골드.` : `Admin cache injected: +${CONFIG.admin.payoutAmount} gold.`);
      playUiTone(560, 0.1, "square", 0.04);
    } else {
      pushLog(state.lang === "ko" ? "운영자 모드가 꺼져 있습니다." : "Admin mode is off.");
      playUiTone(200, 0.08, "sawtooth", 0.03);
    }
    return;
  }

  if (state.adminMode && !state.titleVisible && game && game.phase === "running") {
    if (key === "g") {
      event.preventDefault();
      state.godMode = !state.godMode;
      pushLog(state.lang === "ko" ? `갓 모드 ${state.godMode ? "ON" : "OFF"}.` : `God mode ${state.godMode ? "ON" : "OFF"}.`);
      playUiTone(state.godMode ? 760 : 320, 0.1, "triangle", 0.04);
      return;
    }
    if (key === "k") {
      event.preventDefault();
      if (game.hunter) {
        game.hunter.hp = 0;
        pushLog(state.lang === "ko" ? "운영자: 헌터 강제 처치." : "Admin: Hunter force-killed.");
        playUiTone(260, 0.12, "sawtooth", 0.04);
      }
      return;
    }
    if (key === "f") {
      event.preventDefault();
      game.fragments = CONFIG.intel.maxFragments;
      for (const kc of world.keycards) { kc.visible = true; kc.collected = true; }
      game.keycardsCollected = world.keycards.length;
      refreshUnlockProgress();
      pushLog(state.lang === "ko" ? "운영자: 조각·시질 전부 수집." : "Admin: All fragments & sigils collected.");
      playUiTone(600, 0.12, "triangle", 0.05);
      return;
    }
    if (key === "n") {
      event.preventDefault();
      game.blackoutTimer = 0;
      pushLog(state.lang === "ko" ? "운영자: 즉시 정전 유발." : "Admin: Blackout triggered.");
      playUiTone(180, 0.1, "sawtooth", 0.04);
      return;
    }
  }

  if (key === "e" || code === "KeyE" || code === "Enter") {
    if (state.paused) {
      return;
    }
    event.preventDefault();
    triggerInteract();
  }

  if (key === "r" || code === "KeyR") {
    if (state.paused) {
      return;
    }
    event.preventDefault();
    attemptReinforce();
  }

  keys.add(event.key.toLowerCase());
  keys.add(event.key);
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
  keys.delete(event.key);
  keys.delete(event.code);
});
window.addEventListener("blur", () => {
  keys.clear();
});

canvas.addEventListener("click", (event) => {
  ensureAudio();
  if (state.titleVisible) {
    startRun();
  }
  if (state.paused) {
    return;
  }
  if (state.movementMode !== "click") {
    return;
  }
  const point = canvasPoint(event);
  state.clickTarget = point;
});

canvas.addEventListener(
  "touchstart",
  (event) => {
    ensureAudio();
    if (state.titleVisible) {
      startRun();
    }
    if (state.paused) {
      return;
    }
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    event.preventDefault();
    state.clickTarget = canvasPoint(touch);
  },
  { passive: false },
);

canvas.addEventListener(
  "touchmove",
  (event) => {
    if (state.titleVisible) {
      return;
    }
    if (state.paused) {
      return;
    }
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    event.preventDefault();
    state.clickTarget = canvasPoint(touch);
  },
  { passive: false },
);

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !state.titleVisible && game.phase === "running") {
    setPaused(true);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1120 && state.sidebarCollapsed) {
    state.sidebarCollapsed = false;
    applyStaticText();
  }
  syncStageLayout();
});

mobileStick.addEventListener("pointerdown", handleStickPointerDown);
window.addEventListener("pointermove", handleStickPointerMove);
window.addEventListener("pointerup", handleStickPointerUp);
window.addEventListener("pointercancel", handleStickPointerUp);

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * WIDTH + state.camera.x;
  const y = ((event.clientY - rect.top) / rect.height) * HEIGHT + state.camera.y;
  return { x, y };
}

function triggerInteract() {
  if (state.titleVisible) {
    return;
  }
  if (game.phase !== "running") {
    return;
  }

  const prompt = getPrompt();
  if (!prompt) {
    return;
  }

  switch (prompt.type) {
    case "claim":
      claimRoom(prompt.room);
      break;
    case "abandon":
      if (game.player.abandonPrompt === prompt.room.id) {
        abandonRoom(prompt.room);
        game.player.abandonPrompt = null;
        game.player.abandonPromptTimer = 0;
      } else {
        game.player.abandonPrompt = prompt.room.id;
        game.player.abandonPromptTimer = 4;
        pushLog(langText(`${prompt.room.label} 포기? 다시 E를 눌러 확인.`, `Abandon ${prompt.room.label}? Press E again to confirm.`));
      }
      break;
    case "summon":
      performSummon(prompt.room);
      break;
    case "intel":
      buyIntel(prompt.room);
      break;
    case "door":
      toggleDoor(prompt.room);
      break;
    case "generator":
      game.player.holdingRepair = Math.max(game.player.holdingRepair, 0.2);
      break;
    case "escape":
      // Escape is handled via hold-E in updatePlayer; single press does nothing
      break;
    case "elevator":
      useElevator(prompt.elevator);
      break;
    case "medic":
      performFieldMedic(prompt.room);
      break;
    case "breach_seal":
      performBreachSeal(prompt.room);
      break;
    case "room_fortify":
      performRoomFortify(prompt.room);
      break;
    case "decoy_signal":
      performDecoySignal();
      break;
    default:
      break;
  }
}

function performFieldMedic(_room) {
  if (game.player.hp >= game.player.maxHp * 0.9) return;
  if (game.gold < 50) {
    pushLog(langText("응급 키트 비용 부족 (50골드 필요).", "Not enough gold for emergency kit (50g needed)."));
    playUiTone(220, 0.06, "sawtooth", 0.025);
    return;
  }
  addGold(-50);
  const healAmt = Math.min(game.player.maxHp - game.player.hp, 25);
  game.player.hp = Math.min(game.player.maxHp, game.player.hp + healAmt);
  pushLog(langText(`응급 키트 사용: +${Math.ceil(healAmt)} 체력.`, `Emergency kit used: +${Math.ceil(healAmt)} HP.`));
  playUiTone(480, 0.1, "triangle", 0.04);
  spawnImpact(game.player.x, game.player.y, "gold", 1.0, 12);
  showBanner(langText("응급 키트", "Emergency Kit"), langText("위기를 버텼습니다.", "Patched up for now."), "cyan", 0.9);
}

function performRoomFortify(room) {
  if (game.gold < 80) {
    pushLog(langText("방 강화 비용 부족 (80골드 필요).", "Not enough gold to fortify room (80g needed)."));
    playUiTone(220, 0.06, "sawtooth", 0.025);
    return;
  }
  addGold(-80);
  game.mutationClock = Math.max(0, game.mutationClock - 30);
  if (room.breach) room.breachTimer = Math.max(room.breachTimer, 22);
  pushLog(langText("방이 강화됐습니다. 균열 위험이 줄었습니다.", "Room fortified. Breach risk reduced."));
  playUiTone(520, 0.1, "triangle", 0.04);
  playUiTone(720, 0.08, "triangle", 0.03);
  spawnImpact(room.x + room.w / 2, room.y + room.h / 2, "cyan", 1.2, 14);
  showBanner(langText("방 강화", "Room Fortified"), langText("균열 위험이 감소했습니다.", "Breach risk has decreased."), "cyan", 1.0);
}

function performDecoySignal() {
  if (game.gold < 70) {
    pushLog(langText("미끼 신호 비용 부족 (70골드 필요).", "Not enough gold for decoy signal (70g needed)."));
    playUiTone(220, 0.06, "sawtooth", 0.025);
    return;
  }
  addGold(-70);
  const decoyFloor = game.hunter.floor === "f1" ? "f2" : "f1";
  game.hunter.floor = decoyFloor;
  game.hunter.decoyTimer = 25;
  const anchor = floorSpawnPoint(decoyFloor);
  game.hunter.x = anchor.x;
  game.hunter.y = anchor.y;
  game.hunter.targetRoomId = null;
  game.hunter.retargetTimer = 0;
  pushLog(langText("미끼 신호 송출. 술래가 25초간 반대 층으로 이동합니다.", "Decoy signal sent. Hunter diverted for 25s."));
  playUiTone(360, 0.12, "square", 0.04);
  playUiTone(480, 0.1, "square", 0.03);
  showBanner(langText("미끼 신호", "Decoy Active"), langText("술래가 이탈했습니다!", "Hunter diverted!"), "gold", 1.2);
  flashScreen("rgba(255, 200, 80, 0.2)", 0.4, 0.2);
}

function performBreachSeal(room) {
  if (!room.breach) return;
  if (game.gold < 90) {
    pushLog(langText("균열 봉쇄 비용이 부족합니다 (90골드 필요).", "Not enough gold to seal breach (90g needed)."));
    playUiTone(220, 0.06, "sawtooth", 0.025);
    return;
  }
  addGold(-90);
  room.breach = false;
  room.breachTimer = 18;
  pushLog(langText("균열이 봉쇄됐습니다.", "The breach is sealed."));
  playUiTone(540, 0.12, "triangle", 0.05);
  spawnImpact(room.x + room.w - 24, room.y + room.h / 2, "cyan", 1.2, 14);
  showBanner(langText("균열 봉쇄", "Breach Sealed"), langText("침입로가 차단됐습니다.", "The entry point is blocked."), "cyan", 1.0);
}

function attemptReinforce() {
  if (game.phase !== "running") {
    return;
  }

  const ownedRoom = getOwnedRoom();
  if (!ownedRoom || ownedRoom.floor !== game.player.floor) {
    return;
  }

  const nearDoor = distance(game.player, {
    x: ownedRoom.door.centerX,
    y: ownedRoom.door.centerY,
  }) < 44;

  if (!nearDoor) {
    return;
  }

  reinforceDoor(ownedRoom, "player");
}

function getReinforceCost(room = null) {
  const base = CONFIG.door.reinforceBaseCost + Math.floor(game.time / CONFIG.door.reinforceTimeStep) * CONFIG.door.reinforceCostStep;
  const traitMult = getRoomTrait(room || getOwnedRoom())?.effect.reinforceCostMult || 1;
  return Math.round(base * traitMult);
}

function reinforceDoor(room, actorType, hider = null) {
  const cost = getReinforceCost(room);
  const bankroll = actorType === "player" ? game.gold : hider?.gold || 0;
  if (bankroll < cost) {
    if (actorType === "player") {
      pushLog(langText("문 강화를 하기엔 골드가 부족합니다.", "Not enough gold to reinforce the door."));
      playUiTone(220, 0.06, "sawtooth", 0.025);
    }
    return false;
  }

  if (actorType === "player") {
    addGold(-cost);
  } else if (hider) {
    hider.gold -= cost;
  }
  const roll = Math.random();
  if (actorType === "player") game.stats.reinforceDone = (game.stats.reinforceDone || 0) + 1;
  if (roll < CONFIG.door.successChance) {
    room.door.maxHp += actorType === "player" ? 18 : 14;
    room.door.hp = Math.min(room.door.maxHp, room.door.hp + (actorType === "player" ? 60 : 48));
    room.door.broken = false;
    room.door.closed = true;
    if (actorType === "player") {
      pushLog(langText("문 강화에 성공했습니다.", "Door reinforcement succeeded."));
      pulseShake(0.8);
      playUiTone(420, 0.08, "triangle", 0.04);
    }
  } else if (roll < CONFIG.door.criticalChance) {
    room.door.maxHp += actorType === "player" ? 28 : 22;
    room.door.hp = Math.min(room.door.maxHp, room.door.hp + (actorType === "player" ? 90 : 64));
    room.door.thorns = true;
    room.door.closed = true;
    if (actorType === "player") {
      pushLog(langText("대성공. 문에 반사 피해가 생겼습니다.", "Critical reinforce. The door now reflects damage."));
      pulseShake(1.2);
      playUiTone(520, 0.1, "triangle", 0.05);
      showBanner(langText("대성공 강화", "Critical Reinforce"), langText("문이 어둠을 튕겨냅니다.", "The door rejects the dark."), "cyan", 1.1);
    }
  } else if (roll < CONFIG.door.curseChance) {
    if (actorType === "player") {
      pushLog(langText("강화 실패. 골드만 타버렸습니다.", "Reinforcement failed. Gold burned for nothing."));
      playUiTone(180, 0.08, "sawtooth", 0.03);
    }
  } else {
    room.door.maxHp += actorType === "player" ? 44 : 32;
    room.door.hp = Math.min(room.door.maxHp, room.door.hp + (actorType === "player" ? 120 : 78));
    room.door.curse = true;
    room.aggro = Math.min(100, room.aggro + 20);
    if (actorType === "player") {
      pushLog(langText("저주 강화. 문은 강해졌지만 존재감도 커졌습니다.", "Cursed reinforce. Stronger door, louder presence."));
      pulseShake(1.4);
      playUiTone(160, 0.18, "sawtooth", 0.04);
    }
  }
  return true;
}

function addGold(amount) {
  game.gold = Math.max(0, game.gold + amount);
  if (game.gold > (game.stats.peakGold || 0)) game.stats.peakGold = game.gold;
}

function claimRoom(room) {
  if (room.owner) {
    return;
  }
  const currentOwned = world.rooms.filter((r) => r.owner === "player").length;
  const maxRooms = CONFIG.player.maxOwnedRooms + (game.runProfile.modifiers.maxOwnedRoomsBonus || 0);
  if (currentOwned >= maxRooms) {
    pushLog(langText(`방 최대 ${maxRooms}개까지 점령할 수 있습니다.`, `You can hold at most ${maxRooms} rooms.`));
    return;
  }
  room.owner = "player";
  room.occupied = true;
  room.door.closed = true;
  room.door.broken = false;
  room.door.hp = room.door.maxHp;
  room.breach = false;
  room.breachTimer = 18;
  room.aggro = 20 + game.runProfile.modifiers.playerAggroBonus;
  if (!game.player.ownedRoomId) game.player.ownedRoomId = room.id;
  game.nextContractTimer = Math.min(game.nextContractTimer, 8);
  game.nextAnomalyTimer = Math.min(game.nextAnomalyTimer, 16);
  pushLog(langText(`${room.label}을 점거했습니다.`, `${room.label} is now yours.`));
  const claimTrait = getRoomTrait(room);
  if (claimTrait) {
    pushLog(langText(`특수 방: ${claimTrait.icon} ${claimTrait.label.ko} — ${claimTrait.desc.ko}`, `Special room: ${claimTrait.icon} ${claimTrait.label.en} — ${claimTrait.desc.en}`));
    showBanner(langText("특수 방 점거", "Special Room"), `${claimTrait.icon} ${langText(claimTrait.desc.ko, claimTrait.desc.en)}`, "gold", 1.5);
  } else {
    showBanner(langText("방 점거", "Room Claimed"), room.label, "cyan", 1.4);
  }
}

function abandonRoom(room) {
  if (room.owner !== "player") return;

  room.owner = null;
  room.occupied = false;
  room.aggro = 0;
  room.breach = false;

  // Remove all player-owned units in this room
  game.units = game.units.filter((u) => !(u.roomId === room.id && u.ownerId === "player"));

  // Update primary owned room ID to another owned room if possible
  const remaining = world.rooms.find((r) => r.owner === "player" && r.id !== room.id);
  game.player.ownedRoomId = remaining ? remaining.id : null;

  pushLog(langText(`${room.label}을(를) 포기했습니다.`, `Abandoned ${room.label}.`));
  showBanner(langText("방 포기", "Room Abandoned"), room.label, "amber", 1.3);
  playUiTone(280, 0.12, "triangle", 0.04);
}

function toggleDoor(room) {
  if (room.owner !== "player" || room.door.broken) {
    return;
  }
  room.door.closed = !room.door.closed;
  pushLog(room.door.closed ? langText("문을 봉쇄했습니다.", "Door sealed.") : langText("문을 열었습니다.", "Door opened."));
  playUiTone(room.door.closed ? 440 : 320, 0.06, "triangle", 0.03);
}

function performSummon(room) {
  summonUnitFor(room, "player");
}

function buyIntel(room) {
  const cost = getIntelCost();
  if (game.gold < cost) {
    pushLog(langText("정보를 사기엔 골드가 부족합니다.", "Not enough gold to buy intel."));
    playUiTone(220, 0.06, "sawtooth", 0.025);
    return;
  }

  addGold(-cost);
  game.stats.intelPurchases += 1;
  const roll = Math.random();
  const effectiveFragmentChance = Math.min(0.95, CONFIG.intel.fragmentChance + (game.runProfile.modifiers.intelSuccessBonus || 0) + (game.runProfile.modifiers.fragmentChanceBonus || 0));
  if (roll < effectiveFragmentChance) {
    game.fragments = Math.min(CONFIG.intel.maxFragments, game.fragments + 1);
    pushLog(langText(`지도 조각 확보 (${game.fragments}/${CONFIG.intel.maxFragments}).`, `Map fragment recovered (${game.fragments}/${CONFIG.intel.maxFragments}).`));
    playUiTone(540, 0.08, "triangle", 0.04);
    showBanner(langText("지도 조각", "Map Fragment"), langText(`${game.fragments} / ${CONFIG.intel.maxFragments} 확보`, `Recovered ${game.fragments} of ${CONFIG.intel.maxFragments}.`), "cyan", 1);
  } else if (roll < CONFIG.intel.radarChance + (game.runProfile.modifiers.intelSuccessBonus || 0)) {
    game.radarTime = Math.max(game.radarTime, (12 + (game.runProfile.modifiers.radarDurationBonus || 0)) * game.runProfile.modifiers.radarDurationMultiplier);
    pushLog(langText("레이더 펄스가 짧게 열렸습니다.", "Radar pulse online."));
    playUiTone(470, 0.08, "square", 0.035);
    showBanner(langText("레이더 펄스", "Radar Pulse"), langText("적 흔적이 노출되었습니다.", "Enemy traces exposed."), "cyan", 0.95);
  } else if (roll < CONFIG.intel.failChance) {
    game.intelNoise = 15;
    pushLog(langText("노이즈 폭주. 쓸 만한 정보가 없습니다.", "Static burst. No useful intel."));
    playUiTone(140, 0.12, "sawtooth", 0.035);
    showBanner(langText("신호 손실", "Signal Lost"), langText("노이즈가 피드를 먹어버렸습니다.", "Static swallowed the feed."), "crimson", 0.95);
  } else {
    game.compassTime = Math.max(game.compassTime, 14 * game.runProfile.modifiers.compassDurationMultiplier);
    pushLog(langText("단말이 탈출 방향을 가리킵니다.", "The terminal points toward the escape route."));
    playUiTone(680, 0.12, "triangle", 0.05);
    showBanner(langText("탈출 벡터", "Exit Vector"), langText("숨겨진 경로가 번쩍입니다.", "A hidden route flickers into view."), "gold", 1.2);
    flashScreen("rgba(255, 211, 107, 0.18)", 0.35, 0.18);
  }

  const gateWasClosed = world.exitRoom.gate.closed;
  refreshUnlockProgress();
  if (gateWasClosed && !world.exitRoom.gate.closed) {
    handleGateUnlockFeedback(gateWasClosed);
  }
}

function getSummonCost(room, actorType = "player") {
  const occupiedSlots = roomUnits(room.id).length;
  const rawCost = CONFIG.summon.baseCost + occupiedSlots * CONFIG.summon.slotCostStep;
  const multiplier = actorType === "player" ? game.runProfile.modifiers.summonCostMultiplier : 1;
  const traitMult = actorType === "player" ? (getRoomTrait(getOwnedRoom())?.effect.summonCostMult || 1) : 1;
  return Math.max(1, Math.round(rawCost * multiplier * traitMult));
}

function getIntelCost() {
  const rawCost =
    CONFIG.intel.baseCost +
    game.fragments * CONFIG.intel.fragmentCostStep +
    Math.floor(game.time * CONFIG.intel.timeInflation);
  const traitMult = getRoomTrait(getOwnedRoom())?.effect.intelCostMult || 1;
  return Math.round(rawCost * game.runProfile.modifiers.intelCostMultiplier * traitMult);
}

function refreshUnlockProgress() {
  for (const keycard of world.keycards) {
    if (game.fragments >= keycard.threshold) {
      keycard.visible = true;
    }
  }
  if (game.fragments >= 6 && game.keycardsCollected >= 2) {
    world.exitRoom.gate.closed = false;
  }
}

function handleGateUnlockFeedback(gateWasClosed) {
  if (!gateWasClosed || world.exitRoom.gate.closed) {
    return;
  }
  pushLog(langText("서비스 게이트가 열렸습니다. 탈출구에서 E를 5초 유지하세요!", "Service gate unlocked. Hold E at the gate for 5 seconds!"));
  pulseShake(2.1);
  playUiTone(760, 0.18, "triangle", 0.05);
  playUiTone(960, 0.14, "triangle", 0.04);
  playUiTone(1200, 0.10, "triangle", 0.03);
  showBanner(langText("게이트 해금", "Gate Unlocked"), langText("탈출구에서 E를 5초 유지하세요!", "Hold E at the gate for 5 seconds!"), "gold", 1.6);
  flashScreen("rgba(255, 211, 107, 0.24)", 0.48, 0.22);
  // Hunter rushes to exit intercept
  if (game.hunter) {
    game.hunter.targetRoomId = null;
    hunterSeekPoint(world.exitRoom.gate.centerX - 40, world.exitRoom.gate.centerY);
    game.hunter.mode = "rush";
    game.hunter.modeTimer = 14;
  }
  // Start escape window timer
  game.escapeWindow = { timer: 120, warningShown: false };
  game.hunter.targetRoomId = null;
  hunterSeekPoint(world.exitRoom.x + world.exitRoom.w / 2, world.exitRoom.y + world.exitRoom.h / 2);
  // Escape alarm: spawn infected near exit and in hallway
  spawnInfectedAt(world.exitRoom.x + world.exitRoom.w / 2, world.exitRoom.y + world.exitRoom.h / 2, 2, world.exitRoom.floor);
  spawnInfectedAt(world.hall.x + world.hall.w / 2, world.hall.y + world.hall.h / 2, 1, "f1");
  pushLog(langText("탈출구가 열렸습니다! 120초 안에 탈출하세요! 감염체들이 몰려옵니다!", "Escape gate open! 120s to escape! Infected swarming!"));
  showBanner(langText("탈출 가능", "ESCAPE NOW"), langText("게이트가 닫히기 전에 탈출하세요 — 감염체 주의!", "Reach the gate — infected swarming!"), "cyan", 3.0);
  flashScreen("rgba(133, 216, 255, 0.35)", 0.8, 0.4);
  playUiTone(880, 0.2, "triangle", 0.08);
  playUiTone(660, 0.15, "triangle", 0.06);
}

function infectedProfile(type) {
  return INFECTED_TYPES[type] || INFECTED_TYPES.infected;
}

function rollInfectedType(floor, forcedType = null) {
  if (forcedType) {
    return forcedType;
  }
  if (floor === "f2") {
    return weightedDraw({
      infected: 28,
      wisp: game.runProfile.hunter.id === "brood" ? 44 : 38,
      brute: 28,
    });
  }
  return weightedDraw({
    infected: 68,
    brute: 32,
  });
}

function roomUnits(roomId, ownerId = null) {
  return game.units.filter((unit) => unit.roomId === roomId && (!ownerId || unit.ownerId === ownerId));
}

function weightedDraw(table) {
  const total = Object.values(table).reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (const [key, value] of Object.entries(table)) {
    roll -= value;
    if (roll <= 0) {
      return key;
    }
  }
  return Object.keys(table)[0];
}

function rollSummonType(actorType) {
  const baseTable =
    actorType === "player"
      ? { ...CONFIG.summon.playerWeights }
      : { ...CONFIG.summon.hiderWeights };
  if (actorType === "player") {
    baseTable.relic += game.runProfile.modifiers.playerRelicWeightBonus;
    baseTable.husk = Math.max(6, baseTable.husk - Math.floor(game.runProfile.modifiers.playerRelicWeightBonus / 2));
  }
  return weightedDraw(baseTable);
}

function createUnitRecord(room, ownerId, type, spawnPoint) {
  return {
    id: `unit-${state.nextUnitId++}`,
    ownerId,
    floor: room.floor,
    type,
    role: type === "sentinel" ? "anchor" : type === "rover" ? "interceptor" : type === "relic" ? "ward" : "volatile",
    roomId: room.id,
    x: spawnPoint.x,
    y: spawnPoint.y,
    cooldown: randomRange(0.1, 0.7),
    life: type === "husk" ? 9 : 999,
    angle: randomRange(0, Math.PI * 2),
    homeX: spawnPoint.x,
    homeY: spawnPoint.y,
  };
}

function summonUnitFor(room, actorType, hider = null) {
  const cost = getSummonCost(room, actorType);
  const bankroll = actorType === "player" ? game.gold : hider?.gold || 0;
  if (bankroll < cost) {
    if (actorType === "player") {
      pushLog(langText("소환을 하기엔 골드가 부족합니다.", "Not enough gold for a summon."));
      playUiTone(220, 0.06, "sawtooth", 0.025);
    }
    return false;
  }

  const freeSpot = room.spawnPoints.find(
    (spot) => !game.units.some((unit) => unit.roomId === room.id && distance(unit, spot) < 30),
  );

  if (!freeSpot) {
    if (actorType === "player") {
      pushLog(langText("방 안의 소환 슬롯이 전부 찼습니다.", "No free sigil slot in the room."));
    }
    return false;
  }

  if (actorType === "player") {
    addGold(-cost);
  } else if (hider) {
    hider.gold -= cost;
  }

  const type = rollSummonType(actorType);
  const ownerId = actorType === "player" ? "player" : hider.id;
  game.units.push(createUnitRecord(room, ownerId, type, freeSpot));

  if (actorType !== "player") {
    if (type === "relic") {
      pushLog(langText(`${room.label}에서 희귀 수호자가 나왔습니다.`, `A rare guardian emerged in ${room.label}.`));
    }
    return true;
  }

  const names = {
    sentinel: langText("센티널 소환.", "Sentinel drawn."),
    rover: langText("로버 영체 소환.", "Rover spirit drawn."),
    husk: langText("부서지기 쉬운 껍데기가 응답했습니다.", "A brittle husk answered the call."),
    relic: langText("유물 환영 소환. 희귀.", "Relic apparition drawn. Rare."),
  };
  pushLog(names[type]);
  pulseShake(type === "relic" ? 1.4 : 0.45);
  playUiTone(type === "relic" ? 760 : type === "husk" ? 190 : 460, 0.1, type === "husk" ? "sawtooth" : "triangle", 0.04);
  if (type === "relic") {
    showBanner(langText("전설 뽑기", "Legendary Draw"), langText("유물 환영이 의식에 응답합니다.", "A relic apparition answers the ritual."), "violet", 1.6);
    flashScreen("rgba(206, 136, 255, 0.22)", 0.45, 0.22);
  } else if (type === "husk") {
    showBanner(langText("꽝", "Bad Pull"), langText("의식이 부서질 껍데기만 뱉었습니다.", "The ritual spat out a brittle husk."), "amber", 1.1);
  } else {
    showBanner(langText("소환 완료", "Summon Complete"), names[type], type === "rover" ? "cyan" : "gold", 0.9);
  }
  return true;
}

function getOwnedRoom() {
  const room = world.rooms.find((r) => r.id === game.player.ownedRoomId);
  return room && room.owner === "player" ? room : null;
}

function getOwnedRooms() {
  return world.rooms.filter((room) => room.owner === "player");
}

function getRoomById(roomId) {
  return world.rooms.find((room) => room.id === roomId) || null;
}

function getRoomByOwner(ownerId) {
  return world.rooms.find((room) => room.owner === ownerId) || null;
}

function getRoomAt(x, y) {
  return world.rooms.find((room) => room.floor === game.player.floor && pointInRect(x, y, room)) || null;
}

function getZoneAt(x, y) {
  return world.zones.find((zone) => zone.floor === game.player.floor && pointInRect(x, y, zone)) || null;
}

function getElevatorAt(x, y, floor = game.player.floor) {
  return world.elevators.find((elevator) => elevator.floor === floor && distance({ x, y }, elevator) < elevator.radius + 18) || null;
}

function getPrompt() {
  const player = game.player;
  const room = getRoomAt(player.x, player.y);
  const ownedRoom = getOwnedRoom();
  const localOwnedRoom = ownedRoom && ownedRoom.floor === player.floor ? ownedRoom : null;

  if (game.blackoutActive && world.generatorRoom.floor === player.floor && distance(player, world.generator) < 46) {
    return { type: "generator", text: t("prompt_generator") };
  }

  if (world.exitRoom.floor === player.floor && world.exitRoom.gate.closed === false && pointInRect(player.x, player.y, world.exitRoom)) {
    return { type: "escape", text: t("prompt_escape") };
  }

  const elevator = getElevatorAt(player.x, player.y);
  if (elevator) {
    return {
      type: "elevator",
      elevator,
      text: langText(
        `E를 눌러 ${elevator.destinationFloor === "f2" ? "2층" : "1층"}으로 이동하세요.`,
        `Press E to travel to ${elevator.destinationFloor === "f2" ? "Floor 2" : "Floor 1"}.`,
      ),
    };
  }

  if (room && !room.owner) {
    return { type: "claim", room, text: langText("E: 방 점거 (골드 생산, 경보 상승)", "E: Claim room (gold income, raises alert)") };
  }

  if (localOwnedRoom && room === localOwnedRoom && distance(player, localOwnedRoom.bed) < 40) {
    const promptLabel = game.player.abandonPrompt === localOwnedRoom.id
      ? langText(`E: ${localOwnedRoom.label} 포기 확인`, `E: Confirm abandon ${localOwnedRoom.label}`)
      : langText(`E: ${localOwnedRoom.label} 포기`, `E: Abandon ${localOwnedRoom.label}`);
    return { type: "abandon", room: localOwnedRoom, text: promptLabel };
  }

  if (localOwnedRoom && distance(player, localOwnedRoom.altar) < 42) {
    // Emergency kit: buy heal at altar when HP < 90%
    if (player.hp < player.maxHp * 0.9 && game.gold >= 50) {
      return { type: "medic", room: localOwnedRoom, text: langText("E: 응급 키트 (50골드, +25HP)", "E: Emergency Kit (50g, +25HP)") };
    }
    return { type: "summon", room: localOwnedRoom, text: langText(`E: 수호자 소환 (${getSummonCost(localOwnedRoom)}골드, 랜덤)`, `E: Summon guardian (${getSummonCost(localOwnedRoom)}g, random)`) };
  }

  if (localOwnedRoom && distance(player, localOwnedRoom.terminal) < 42) {
    // Breach seal: buy breach seal at terminal when breach active
    if (localOwnedRoom.breach && game.gold >= 90) {
      return { type: "breach_seal", room: localOwnedRoom, text: langText("E: 균열 봉쇄 (90골드)", "E: Seal Breach (90g)") };
    }
    // Decoy signal: divert hunter to opposite floor
    if (!localOwnedRoom.breach && game.hunter.floor === player.floor && !(game.hunter.decoyTimer > 0) && game.gold >= 70) {
      return { type: "decoy_signal", room: localOwnedRoom, text: langText("E: 미끼 신호 (70골드) — 술래 25초 이탈", "E: Decoy Signal (70g) — divert hunter 25s") };
    }
    return { type: "intel", room: localOwnedRoom, text: langText(`E: 정보 구매 (${getIntelCost()}골드)`, `E: Buy intel (${getIntelCost()}g)`) };
  }

  if (localOwnedRoom && distance(player, { x: localOwnedRoom.door.centerX, y: localOwnedRoom.door.centerY }) < 42) {
    const mutThreshold = CONFIG.mutation.triggerClock * (game.runProfile.modifiers.mutationThresholdMultiplier || 1);
    if (game.mutationClock > mutThreshold * 0.35 && game.gold >= 80) {
      return { type: "room_fortify", room: localOwnedRoom, text: langText("E: 방 강화 (80골드) — 균열 위험 감소", "E: Fortify Room (80g) — reduce breach risk") };
    }
    return { type: "door", room: localOwnedRoom, text: t("prompt_door") };
  }

  return null;
}

function useElevator(elevator) {
  const fromFloor = game.player.floor;
  game.player.floor = elevator.destinationFloor;
  game.player.x = elevator.destinationX;
  game.player.y = elevator.destinationY;
  state.clickTarget = null;
  resetTouchStick();
  game.hunter.floor = elevator.destinationFloor;
  const floorAnchor = floorSpawnPoint(elevator.destinationFloor);
  game.hunter.x = floorAnchor.x;
  game.hunter.y = floorAnchor.y;
  game.hunter.targetRoomId = null;
  game.hunter.retargetTimer = 0;
  updateCamera();
  pulseShake(1.2);
  playUiTone(fromFloor === "f1" ? 320 : 260, 0.08, "triangle", 0.03);
  playUiTone(elevator.destinationFloor === "f2" ? 520 : 420, 0.14, "triangle", 0.04);
  flashScreen(
    elevator.destinationFloor === "f2" ? "rgba(173, 133, 255, 0.16)" : "rgba(133, 216, 255, 0.14)",
    0.3,
    0.16,
  );
  pushLog(
    langText(
      `${elevator.destinationFloor === "f2" ? "2층" : "1층"}으로 이동했습니다.`,
      `Transferred to ${elevator.destinationFloor === "f2" ? "Floor 2" : "Floor 1"}.`,
    ),
  );
  showBanner(
    langText(elevator.destinationFloor === "f2" ? "2층 진입" : "1층 복귀", elevator.destinationFloor === "f2" ? "Floor 2" : "Floor 1"),
    elevator.label,
    "cyan",
    1.1,
  );
}

function escapeRun() {
  if (game.phase !== "running" || world.exitRoom.gate.closed) {
    return;
  }
  resetTouchStick();
  setPaused(false);
  flashScreen("rgba(133, 216, 255, 0.55)", 1.2, 0.6);
  pulseShake(3.0);
  playUiTone(1200, 0.3, "triangle", 0.1);
  playUiTone(900, 0.25, "triangle", 0.08);
  game.phase = "escaped";
  game.winFlash = 4;
  state.meta.runs += 1;
  state.meta.escapes += 1;
  state.meta.bestTime = Math.max(state.meta.bestTime, game.time);
  awardRunRewards(true);
  saveMeta(state.meta);
  pushLog(langText("탈출 성공. 구역이 당신을 놓쳤습니다.", "Escape successful. The ward lost you."));
  state.outcomeText = t("outcome_escape");
  showBanner(langText("탈출 완료", "Escape Complete"), langText("서비스 게이트 너머로 미끄러져 빠져나왔습니다.", "You slipped beyond the service gate."), "cyan", 2.3);
  flashScreen("rgba(133, 216, 255, 0.24)", 0.55, 0.3);
}

function failRun(reason) {
  if (game.phase !== "running") {
    return;
  }
  resetTouchStick();
  setPaused(false);
  game.phase = "failed";
  state.meta.runs += 1;
  state.meta.bestTime = Math.max(state.meta.bestTime, game.time);
  awardRunRewards(false);
  saveMeta(state.meta);
  pushLog(reason);
  state.outcomeText = reason;
  pulseShake(3.2);
  playUiTone(120, 0.5, "sawtooth", 0.05);
  playUiTone(850, 0.12, "sine", 0.06);
  playUiTone(320, 0.1, "sawtooth", 0.03);
  showBanner(langText("런 실패", "Run Failed"), reason, "crimson", 2.2);
  flashScreen("rgba(255, 72, 118, 0.28)", 0.55, 0.28);
}

function update(dt) {
  if (state.titleVisible) {
    updateEffects(dt);
    updateBanner(dt);
    updateFlash(dt);
    refreshRuntimeState();
    return;
  }

  if (state.paused) {
    updateEffects(dt * 0.25);
    updateBanner(dt * 0.25);
    updateFlash(dt * 0.25);
    refreshRuntimeState();
    return;
  }

  if (game.phase !== "running") {
    game.winFlash = Math.max(0, game.winFlash - dt);
    updateEffects(dt);
    updateBanner(dt);
    updateFlash(dt);
    refreshRuntimeState();
    return;
  }

  game.time += dt;
  game.radarTime = Math.max(0, game.radarTime - dt);
  game.compassTime = Math.max(0, game.compassTime - dt);
  game.suppressionTime = Math.max(0, game.suppressionTime - dt);
  game.floorHazards.powerSurge = Math.max(0, game.floorHazards.powerSurge - dt);
  game.floorHazards.archiveLock = Math.max(0, game.floorHazards.archiveLock - dt);
  game.intelNoise = Math.max(0, game.intelNoise - dt);
  game.player.spawnShield = Math.max(0, game.player.spawnShield - dt);
  game.hunter.wakeDelay = Math.max(0, game.hunter.wakeDelay - dt);
  if (game.player.abandonPromptTimer > 0) {
    game.player.abandonPromptTimer -= dt;
    if (game.player.abandonPromptTimer <= 0) {
      game.player.abandonPrompt = null;
    }
  }
  state.screenShake = Math.max(0, state.screenShake - dt * CONFIG.feedback.shakeDecayPerSecond);
  updateEffects(dt);
  updateBanner(dt);
  updateFlash(dt);
  updatePlayer(dt);
  updateCamera();
  updateEconomy(dt);
  updateFloatTexts(dt);
  updateBlackout(dt);
  updateMutation(dt);
  updateAnomaly(dt);
  updateWardEvent(dt);
  updateHiders(dt);
  updateUnits(dt);
  updateHunter(dt);
  updateHunterFootstep(dt);
  game.hiders = game.hiders.filter((h) => h.alive);
  updateInfected(dt);
  collectKeycards();
  updateContracts(dt);
  updateEscapeWindow(dt);
  updateRaid(dt);
  refreshRuntimeState();

  if (game.player.hp <= 0) {
    failRun(
      game.player.lastDamageSource === "infected"
        ? langText("감염체에게 찢겼습니다.", "You were torn apart by infected.")
        : langText("술래에게 붙잡혔습니다.", "You were taken by the hunter."),
    );
  }
}

function refreshRuntimeState() {
  const ownedRoom = getOwnedRoom();
  state.runtime.ownedRoom = ownedRoom;
  state.runtime.prompt = getPrompt();
  state.runtime.danger = dangerLevel();
  state.runtime.incomeText = formatIncomeStatus();
}

function updatePlayer(dt) {
  const player = game.player;
  let dx = 0;
  let dy = 0;

  if (state.touchStick.active) {
    dx = state.touchStick.dx;
    dy = state.touchStick.dy;
  } else if (state.movementMode === "wasd") {
    if (isMovePressed("up")) {
      dy -= 1;
    }
    if (isMovePressed("down")) {
      dy += 1;
    }
    if (isMovePressed("left")) {
      dx -= 1;
    }
    if (isMovePressed("right")) {
      dx += 1;
    }
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }
  } else if (state.clickTarget) {
    const angle = Math.atan2(state.clickTarget.y - player.y, state.clickTarget.x - player.x);
    const distanceLeft = distance(player, state.clickTarget);
    if (distanceLeft < 12) {
      state.clickTarget = null;
    } else {
      dx = Math.cos(angle);
      dy = Math.sin(angle);
    }
  }

  const floorSlow = player.floor === "f2" && game.floorHazards.archiveLock > 0 ? 0.82 : 1;
  const speed = player.speed * floorSlow;
  moveEntity(player, dx * speed * dt, dy * speed * dt);
  player.roomId = getRoomAt(player.x, player.y)?.id || null;

  // Ward speed boost trait
  if (game.wardEvent?.id === "speed_boost") {
    player.speed = CONFIG.player.speed * 1.25;
  } else {
    player.speed = CONFIG.player.speed;
  }

  if (game.blackoutActive && world.generatorRoom.floor === player.floor && distance(player, world.generator) < 46 && isActionPressed("interact")) {
    player.holdingRepair += dt;
    if (player.holdingRepair >= 2.2 * game.runProfile.modifiers.repairDurationMultiplier) {
      repairGenerator();
    }
  } else {
    player.holdingRepair = 0;
  }

  // Hold-E escape at service gate (5-second hold required)
  const atGate = world.exitRoom.floor === player.floor && !world.exitRoom.gate.closed && pointInRect(player.x, player.y, world.exitRoom);
  if (atGate && isActionPressed("interact")) {
    player.holdingEscape += dt;
    // Interrupt if hunter is on same floor and within 55px
    if (game.hunter && game.hunter.floor === player.floor && distance(game.hunter, player) < 55) {
      player.holdingEscape = 0;
      pushLog(langText("술래가 너무 가까워 탈출이 중단됐습니다!", "Hunter too close — escape interrupted!"));
    } else if (player.holdingEscape >= 5.0) {
      escapeRun();
    }
  } else {
    player.holdingEscape = 0;
  }
}

function getRoomTrait(room) {
  if (!room || !room.trait) return null;
  return ROOM_TRAITS.find((t) => t.id === room.trait) || null;
}

function updateFloatTexts(dt) {
  for (let i = game.floatTexts.length - 1; i >= 0; i--) {
    const f = game.floatTexts[i];
    f.age += dt;
    f.y += f.vy * dt;
    f.vy *= 0.88;
    if (f.age >= f.maxAge) game.floatTexts.splice(i, 1);
  }
}

function drawFloatTexts() {
  for (const f of game.floatTexts) {
    const alpha = clamp(1 - f.age / f.maxAge, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "700 13px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.fillStyle = "#ffd84a";
    ctx.shadowColor = "rgba(255, 200, 0, 0.6)";
    ctx.shadowBlur = 6;
    ctx.fillText(f.text, f.x - ctx.measureText(f.text).width / 2, f.y);
    ctx.restore();
  }
}

function spawnGoldFloat(x, y, amount) {
  game.floatTexts.push({ x, y, vy: -28, text: `+${Math.round(amount)}`, age: 0, maxAge: 1.4 });
}

function updateEconomy(dt) {
  const ownedRooms = getOwnedRooms().filter((r) => r.floor === game.player.floor);
  if (ownedRooms.length === 0) {
    return;
  }

  const wardGoldMult = game.wardEvent?.id === "gold_tax" ? 0.65 : game.wardEvent?.id === "gold_rush" ? 2.2 : 1;

  for (const ownedRoom of ownedRooms) {
    const trait = getRoomTrait(ownedRoom);
    const traitGoldMult = trait?.effect.goldMult || 1;

    if (pointInRect(game.player.x, game.player.y, ownedRoom)) {
      const income = CONFIG.economy.goldPerSecondInRoom * game.runProfile.modifiers.goldGainMultiplier * (game.runProfile.modifiers.goldIncomeMult || 1) * traitGoldMult * wardGoldMult;
      addGold(income * dt);
      game._goldFloatTimer = (game._goldFloatTimer || 0) - dt;
      if (game._goldFloatTimer <= 0) {
        const onBed = distance(game.player, ownedRoom.bed) < 34;
        const total = income + (onBed ? CONFIG.economy.goldPerSecondOnBedBonus * game.runProfile.modifiers.goldGainMultiplier * (game.runProfile.modifiers.goldIncomeMult || 1) * traitGoldMult * wardGoldMult : 0);
        spawnGoldFloat(ownedRoom.bed.x + randomRange(-8, 8), ownedRoom.bed.y - 16, total * 1.5);
        game._goldFloatTimer = 1.5;
      }
    }

    if (distance(game.player, ownedRoom.bed) < 34) {
      addGold(CONFIG.economy.goldPerSecondOnBedBonus * game.runProfile.modifiers.goldGainMultiplier * (game.runProfile.modifiers.goldIncomeMult || 1) * traitGoldMult * wardGoldMult * dt);
      const traitHealMult = trait?.effect.healMult || 1;
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + CONFIG.player.healPerSecondOnBed * traitHealMult * (game.runProfile.modifiers.healMultiplier || 1) * dt);
    }
  }

  if (!ownedRooms.some((r) => pointInRect(game.player.x, game.player.y, r))) {
    game._goldFloatTimer = 0;
  }
}

function updateHiders(dt) {
  for (const hider of game.hiders) {
    if (!hider.alive) {
      continue;
    }

    const room = getRoomById(hider.roomId);
    if (!room || room.owner !== hider.id) {
      continue;
    }

    const localThreats = [game.hunter, ...game.infected].filter(
      (enemy) =>
        enemy.floor === room.floor &&
        (pointInRect(enemy.x, enemy.y, room) || distance(enemy, { x: room.door.centerX, y: room.door.centerY }) < 120),
    ).length;

    const safeIncome =
      (CONFIG.economy.goldPerSecondInRoom + CONFIG.economy.goldPerSecondOnBedBonus) *
      CONFIG.hider.goldGainMultiplier *
      game.runProfile.modifiers.hiderGoldMultiplier;
    hider.gold += safeIncome * dt * (localThreats > 0 || game.blackoutActive ? 0.35 : 1);
    hider.panic = Math.max(0, hider.panic - dt * 0.5);
    if (game.hunter.floor === room.floor && distance(game.hunter, { x: room.x + room.w / 2, y: room.y + room.h / 2 }) < 180) {
      hider.panic = Math.min(10, hider.panic + dt * 2.2);
    }
    if (hider.panic >= 9) {
      room.owner = null;
      game.units = game.units.filter((u) => !(u.roomId === room.id && u.ownerId === "player"));
      hider.alive = false;
      pushLog(langText(`${room.label}의 생존자가 패닉 상태로 탈출했습니다.`, `${room.label}'s survivor fled in panic.`));
      continue;
    }

    const retreatPoint =
      localThreats > 0
        ? { x: room.x + 34, y: room.y + room.h - 34 }
        : hider.gold > getIntelCost() * 0.75
          ? room.terminal
          : room.bed;
    moveTowardTarget(hider, retreatPoint.x, retreatPoint.y, dt * 66);

    hider.decisionTimer -= dt;
    if (hider.decisionTimer > 0) {
      continue;
    }

    hider.decisionTimer = randomRange(CONFIG.hider.decisionMin, CONFIG.hider.decisionMax);

    if (hider.panic < 5 && room.door.hp < room.door.maxHp * 0.72 && hider.gold >= getReinforceCost(room)) {
      if (reinforceDoor(room, "hider", hider)) {
        continue;
      }
    }

    const ownedUnits = roomUnits(room.id, hider.id).length;
    const shouldSummon =
      hider.panic < 6 &&
      ownedUnits < hider.unitCap &&
      hider.gold >= getSummonCost(room, "hider") &&
      (localThreats > 0 || Math.random() < 0.72);

    if (shouldSummon) {
      summonUnitFor(room, "hider", hider);
      continue;
    }

    if (hider.gold >= getIntelCost() * 0.8 && Math.random() < 0.22) {
      room.aggro = Math.min(100, room.aggro + 2);
      hider.gold -= getIntelCost() * 0.28;
      pushLog(langText(`${room.label}의 생존자가 단말을 뒤졌습니다.`, `${room.label}'s hider rifled through the terminal.`));
    }
  }
}

function updateBlackout(dt) {
  if (!game.blackoutActive) {
    game.blackoutTimer -= dt;
  }

  // Pre-warning: flicker and audio 18s before blackout
  if (!game.blackoutActive && !game.blackoutWarning && game.blackoutTimer <= 18 && game.blackoutTimer > 0) {
    game.blackoutWarning = true;
    pushLog(langText("전력 불안정. 정전이 임박했습니다.", "Power fluctuating. Blackout imminent."));
    playUiTone(180, 0.14, "sawtooth", 0.04);
    showBanner(langText("경고", "Warning"), langText("정전 임박", "Blackout incoming"), "amber", 1.1);
  }
  if (!game.blackoutActive && game.blackoutTimer > 18) {
    game.blackoutWarning = false;
  }

  if (!game.blackoutActive && game.blackoutTimer <= 0) {
    game.blackoutActive = true;
    game.blackoutWarning = false;
    game.blackoutDuration = 0;
    pushLog(langText("정전. 구역 전체가 어두워졌습니다.", "Blackout. The whole ward goes dark."));
    pulseShake(2.2);
    playUiTone(90, 0.4, "sawtooth", 0.05);
    showBanner(langText("정전", "Blackout"), langText("활성 방어 장치가 전부 멎었습니다.", "All active defenses are offline."), "crimson", 1.6);
    flashScreen("rgba(255, 86, 128, 0.18)", 0.45, 0.18);
  }

  if (game.blackoutActive) {
    game.blackoutDuration += dt;
    if (game.blackoutDuration > CONFIG.blackout.spawnAtSeconds * (game.runProfile.modifiers.blackoutDurationMult || 1)) {
      // Multi-point spawns
      const bonus = game.runProfile.modifiers.blackoutSpawnBonus;
      const spawnPoints = [
        { x: world.generator.x, y: world.generator.y + 20 },
        { x: world.hall.x + 180, y: world.hall.y + world.hall.h / 2 },
        { x: world.hall.x + world.hall.w - 180, y: world.hall.y + world.hall.h / 2 },
      ];
      for (const sp of spawnPoints) {
        spawnInfectedAt(sp.x, sp.y, 1 + (bonus > 0 ? 1 : 0), "f1");
      }
      game.blackoutDuration = -999;
      pushLog(langText("어둠이 벽 속의 것들을 더 끌어냈습니다.", "The dark dragged more things out of the walls."));
      pulseShake(1.2);
    }
  }
}

function repairGenerator() {
  game.blackoutActive = false;
  game.blackoutWarning = false;
  game.blackoutTimer = Math.max(rollBlackoutTimer(), 90);
  game.player.holdingRepair = 0;
  pushLog(langText("발전기 복구 완료. 방어 장치가 다시 살아났습니다.", "Generator repaired. Defenses are live again."));
  playUiTone(420, 0.14, "triangle", 0.04);
  showBanner(langText("전력 복구", "Power Restored"), langText("구역이 잠깐 숨을 쉽니다.", "The ward exhales for now."), "cyan", 1.4);
}

function updateMutation(dt) {
  const ownedRooms = getOwnedRooms();
  if (ownedRooms.length === 0) {
    return;
  }

  const inOwnedRoom = ownedRooms.some((r) => game.player.roomId === r.id);
  if (inOwnedRoom) {
    const pressure =
      (1 + Math.min(CONFIG.mutation.maxPressureBonus, game.gold / CONFIG.mutation.goldPressureDivisor)) *
      game.runProfile.modifiers.mutationPressureMultiplier;
    game.mutationClock += dt * pressure;
  } else {
    game.mutationClock = Math.max(0, game.mutationClock - dt * 2);
  }

  const mutationThreshold = CONFIG.mutation.triggerClock * game.runProfile.modifiers.mutationThresholdMultiplier;

  for (const ownedRoom of ownedRooms) {
    if (!ownedRoom.breach && !game._mutationWarned && game.mutationClock > mutationThreshold * 0.75) {
      game._mutationWarned = true;
      pushLog(langText("방이 불안정합니다. 균열이 곧 열릴 것 같습니다...", "The room feels unstable. A breach is imminent..."));
      playUiTone(260, 0.1, "sawtooth", 0.03);
    }
    if (!ownedRoom.breach && game.mutationClock > mutationThreshold) {
      ownedRoom.breach = true;
      game._mutationWarned = false;
      game.mutationClock = 0;
      ownedRoom.aggro = Math.min(100, ownedRoom.aggro + 24);
      pushLog(langText("방이 찢어졌습니다. 무언가 옆길을 찾았습니다.", "The room split open. Something found a side path."));
      pulseShake(1.6);
      playUiTone(150, 0.22, "sawtooth", 0.04);
      playUiTone(380, 0.14, "square", 0.045);
    }

    if (ownedRoom.breach) {
      ownedRoom.breachTimer -= dt;
      if (ownedRoom.breachTimer <= 0) {
        spawnInfectedAt(ownedRoom.x + ownedRoom.w - 38, ownedRoom.y + ownedRoom.h / 2, 1, ownedRoom.floor);
        ownedRoom.breachTimer = randomRange(14, 22) * game.runProfile.modifiers.breachIntervalMultiplier;
        pushLog(langText("균열이 또 다른 감염체를 방 안에 토해냈습니다.", "A breach spat another infected into your room."));
        pulseShake(1.1);
      }
    }
  }
}

function updateUnits(dt) {
  for (let i = game.units.length - 1; i >= 0; i -= 1) {
    const unit = game.units[i];
    const unitRoom = getRoomById(unit.roomId);
    if (!unitRoom || unitRoom.owner === "infected") {
      game.units.splice(i, 1);
      continue;
    }
    unit.cooldown -= dt;

    if (unit.type === "husk") {
      unit.life -= dt;
      const target = nearestEnemy(unit, 80);
      if (unit.life <= 0 || target) {
        explodeAt(unit.x, unit.y, 56, 32, unit.floor);
        game.units.splice(i, 1);
        pulseShake(0.9);
        playUiTone(180, 0.09, "sawtooth", 0.04);
        spawnImpact(unit.x, unit.y, "amber", 1.2, 12);
      }
      continue;
    }

    const localTarget = selectUnitTarget(unit, unitRoom);
    updateUnitPosition(unit, localTarget, dt);

    if (game.blackoutActive || game.suppressionTime > 0) {
      continue;
    }

    if (unit.cooldown > 0) {
      continue;
    }

    const targetRange = unit.type === "relic" ? 260 : unit.type === "rover" ? 200 : 185;
    const target = localTarget || nearestEnemy(unit, targetRange);
    if (!target) {
      continue;
    }

    const targetNearDoor =
      unitRoom &&
      distance(target, { x: unitRoom.door.centerX, y: unitRoom.door.centerY }) < CONFIG.ally.defendDoorRange;
    const damage = unit.type === "relic" ? 18 : unit.type === "rover" ? 16 : targetNearDoor ? 14 : 10;
    target.hp -= damage;
    if (target.hp <= 0 && !target._unitKill) target._unitKill = true;
    spawnImpact(target.x, target.y, unit.type === "relic" ? "violet" : "cyan", unit.type === "relic" ? 1.35 : 0.85, 10);
    spawnTracer(unit.x, unit.y, target.x, target.y, unit.type === "relic" ? "violet" : "cyan");
    if (unit.type === "relic") {
      for (const extra of game.infected) {
        if (extra !== target && distance(extra, target) < 80) {
          extra.hp -= 10;
          if (extra.hp <= 0 && !extra._unitKill) extra._unitKill = true;
          spawnImpact(extra.x, extra.y, "violet", 0.8, 8);
        }
      }
      if (game.hunter && distance(unit, game.hunter) < 150) {
        game.hunter.speed = Math.max(CONFIG.hunter.baseSpeed, game.hunter.speed - 12);
      }
    }
    unit.cooldown = unit.type === "relic" ? 1.4 : unit.type === "rover" ? 0.42 : targetNearDoor ? 0.56 : 0.8;
  }

  const defeatedInfected = game.infected.filter((enemy) => enemy.hp <= 0);
  if (defeatedInfected.length > 0) {
    game.stats.infectedKills += defeatedInfected.length;
    const killGold = game.runProfile.modifiers.infectedKillGold || 0;
    if (killGold > 0) {
      addGold(killGold * defeatedInfected.length);
    }
    const guardianKills = defeatedInfected.filter((e) => e._unitKill).length;
    if (guardianKills > 0) {
      game.stats.guardianKills = (game.stats.guardianKills || 0) + guardianKills;
      pushLog(langText(`수호자가 감염체 ${guardianKills}마리를 처치했습니다.`, `Guardian eliminated ${guardianKills} infected.`));
    }
  }
  game.infected = game.infected.filter((enemy) => enemy.hp > 0);
  if (game.hunter.hp <= 0) {
    game.hunter.hp = hunterMaxHp();
    game.hunter.charging = false;
    game.hunter.chargeTimer = 0;
    game.hunter.attackCooldown = 1.5;
    game.hunter.targetRoomId = null;
    const respawnPoint = floorSpawnPoint(game.hunter.floor);
    game.hunter.x = respawnPoint.x;
    game.hunter.y = respawnPoint.y;
    pushLog(langText("술래가 홀에서 다시 형체를 만들었습니다.", "The hunter reformed in the hall."));
    pulseShake(1.8);
    playUiTone(110, 0.28, "triangle", 0.035);
  }
}

function updateHunter(dt) {
  const hunter = game.hunter;
  if (hunter.wakeDelay > 0) {
    hunterSeekPoint(world.hall.x + 180, world.hall.y + 82);
    moveEntityWithPath(hunter, hunter.targetX, hunter.targetY, CONFIG.hunter.baseSpeed * 0.4 * dt);
    return;
  }

  if (hunter.decoyTimer > 0) {
    hunter.decoyTimer -= dt;
    if (hunter.decoyTimer <= 0) {
      hunter.decoyTimer = 0;
      if (game.phase === "running") {
        pushLog(langText("미끼 효과 종료. 술래가 돌아옵니다.", "Decoy expired. Hunter returns."));
        flashScreen("rgba(255, 80, 60, 0.18)", 0.3, 0.15);
      }
    } else {
      const anchor = floorSpawnPoint(hunter.floor);
      hunterSeekPoint(anchor.x + Math.sin(game.time * 0.8) * 60, anchor.y + Math.cos(game.time * 0.6) * 40);
      moveEntityWithPath(hunter, hunter.targetX, hunter.targetY, CONFIG.hunter.baseSpeed * 0.4 * dt);
      return;
    }
  }

  hunter.level = Math.min(20, 1 + Math.floor(game.time / 90) + Math.floor(game.fragments / 2) + countBreaches());

  // Announce hunter phase milestones
  if (hunter.level === 3 && !hunter._announcedL3) {
    hunter._announcedL3 = true;
    pushLog(langText("술래가 구역 전체를 순찰합니다.", "The hunter begins patrolling the whole ward."));
    showBanner(langText("추적 강화", "Hunt Escalated"), langText("술래 Lv.3 — 순찰 개시", "Hunter Lv.3 — Patrol begins"), "amber", 1.1);
  }
  if (hunter.level === 5 && !hunter._announcedL5) {
    hunter._announcedL5 = true;
    pushLog(langText("술래가 벽을 뚫기 시작합니다.", "The hunter begins forcing breaches."));
    showBanner(langText("추적 강화", "Hunt Escalated"), langText("술래 Lv.5 — 강제 돌파", "Hunter Lv.5 — Breach forcing"), "amber", 1.1);
  }
  if (hunter.level === 8 && !hunter._announcedL8) {
    hunter._announcedL8 = true;
    pushLog(langText("술래가 광란 상태에 빠졌습니다.", "The hunter enters a frenzy."));
    showBanner(langText("광란", "Frenzy"), langText("술래 Lv.8 — 완전 광란", "Hunter Lv.8 — Full Frenzy"), "crimson", 1.6);
    flashScreen("rgba(255, 60, 100, 0.22)", 0.5, 0.25);
  }
  if (hunter.level === 10 && !hunter._announcedL10) {
    hunter._announcedL10 = true;
    pushLog(langText("술래가 봉쇄 태세에 들어갔습니다. 모든 탈출로가 감시됩니다.", "The hunter enters lockdown. Every exit is watched."));
    showBanner(langText("봉쇄", "Lockdown"), langText("술래 Lv.10 — 완전 봉쇄", "Hunter Lv.10 — Full Lockdown"), "crimson", 2.0);
    flashScreen("rgba(255, 30, 60, 0.28)", 0.6, 0.3);
    playUiTone(110, 0.24, "sawtooth", 0.06);
    game.floorHazards.lockdown = true;
  }
  if (hunter.level === 12 && !hunter._announcedL12) {
    hunter._announcedL12 = true;
    pushLog(langText("술래가 변이합니다. 더 이상 숨을 곳이 없습니다.", "The hunter mutates. There is nowhere left to hide."));
    showBanner(langText("변이", "Mutation"), langText("술래 Lv.12 — 변이 완료", "Hunter Lv.12 — Fully Mutated"), "violet", 2.2);
    flashScreen("rgba(180, 60, 255, 0.32)", 0.7, 0.35);
    playUiTone(85, 0.28, "sawtooth", 0.07);
  }

  // Level 5+: occasionally force a breach on the player's room
  if (hunter.level >= 5) {
    hunter._breachAttemptTimer -= dt;
    if (hunter._breachAttemptTimer <= 0) {
      hunter._breachAttemptTimer = randomRange(35, 55);
      const candidateRooms = getOwnedRooms().filter((r) => !r.breach && hunter.floor === r.floor && r.door.hp < r.door.maxHp * 0.5);
      const ownedRoom = candidateRooms.length > 0 ? candidateRooms[Math.floor(Math.random() * candidateRooms.length)] : null;
      if (ownedRoom && Math.random() < 0.4) {
        ownedRoom.breach = true;
        game.mutationClock = 0;
        game._mutationWarned = false;
        pushLog(langText("술래가 벽을 뚫었습니다!", "The hunter forced a breach!"));
        pulseShake(2.0);
        playUiTone(140, 0.22, "sawtooth", 0.05);
        playUiTone(380, 0.14, "square", 0.045);
        spawnImpact(ownedRoom.x + ownedRoom.w - 24, ownedRoom.y + ownedRoom.h / 2, "crimson", 1.4, 14);
      }
    }
  }

  // Handle charge telegraph resolution
  if (hunter.charging) {
    hunter.chargeTimer -= dt;
    if (hunter.chargeTimer <= 0) {
      hunter.charging = false;
      // Deal damage if player is still nearby
      if (hunter.floor === game.player.floor && distance(hunter, game.player) < 32) {
        const mode = hunterModeProfile();
        if (!state.godMode) {
          const dmg = (CONFIG.hunter.basePlayerDamage + hunter.level * CONFIG.hunter.playerDamagePerLevel) *
            mode.damage * game.runProfile.modifiers.hunterPlayerDamageMultiplier * game.runProfile.modifiers.hunterDamageMultiplier;
          game.player.hp = Math.max(0, game.player.hp - dmg);
          game.stats.damageTaken = (game.stats.damageTaken || 0) + dmg;
        }
        game.player.lastDamageSource = "hunter";
        pulseShake(1.25);
        playUiTone(150, 0.08, "square", 0.04);
        spawnImpact(game.player.x, game.player.y, "crimson", 1.4, 16);
        spawnSlash(hunter.x, hunter.y, game.player.x, game.player.y, "crimson");
      }
    }
    // Don't move while charging
    return;
  }

  updateHunterMode(dt);
  const modeModifiers = hunterModeProfile();
  hunter.speed =
    (CONFIG.hunter.baseSpeed +
      hunter.level * CONFIG.hunter.speedPerLevel +
      (game.blackoutActive ? CONFIG.hunter.blackoutSpeedBonus : 0)) *
    modeModifiers.speed *
    game.runProfile.modifiers.hunterSpeedMultiplier;
  hunter.attackCooldown = Math.max(0, hunter.attackCooldown - dt);
  hunter.retargetTimer -= dt;

  if (hunter.retargetTimer <= 0) {
    retargetHunter();
    hunter.retargetTimer = game.floorHazards.lockdown ? 0.4 : 0.8;
  }

  hunter.skillCooldown -= dt;
  if (hunter.skillCooldown <= 0) {
    castHunterSkill();
    const skillProfile = HUNTER_SKILLS[game.runProfile.hunter.id];
    if (!skillProfile) { hunter.skillCooldown = 15; return; }
    hunter.skillCooldown = randomRange(skillProfile.cooldownMin, skillProfile.cooldownMax);
  }

  moveEntityWithPath(hunter, hunter.targetX, hunter.targetY, hunter.speed * dt);
  handleHunterDoorDamage();
  handleHunterAttacks();
}

function triggerFloorHunterPattern(activeRoom) {
  if (game.hunter.floor === "f1") {
    game.floorHazards.powerSurge = Math.max(game.floorHazards.powerSurge, 7);
    game.blackoutTimer = Math.min(game.blackoutTimer, 12);
    spawnInfectedAt(world.generator.x, world.generator.y - 36, 1, "f1", "brute");
    pushLog(langText("하층 전력 폭주. 발전기 라인이 흔들립니다.", "Lower-floor surge. The generator line buckles."));
    showBanner(langText("전력 폭주", "Power Surge"), formatFloorName("f1"), "amber", 1.05);
    playUiTone(132, 0.2, "square", 0.05);
    pulseShake(1.3);
    return;
  }

  game.floorHazards.archiveLock = Math.max(game.floorHazards.archiveLock, 7.5);
  spawnInfectedAt(activeRoom.x + activeRoom.w / 2, activeRoom.y + activeRoom.h / 2, 2, "f2", "wisp");
  if (!game.anomaly || game.anomaly.floor !== "f2") {
    const anchors = anomalyAnchorsForFloor("f2");
    const point = pickOne(anchors);
    game.anomaly = {
      floor: "f2",
      x: point.x,
      y: point.y,
      timer: randomRange(10, 14),
      maxTimer: 14,
    };
  }
  pushLog(langText("상층 기록이 뒤틀립니다. 유령 개체가 새어 나옵니다.", "The upper archives distort. Spectral entities leak out."));
  showBanner(langText("아카이브 봉쇄", "Archive Lock"), formatFloorName("f2"), "violet", 1.05);
  playUiTone(188, 0.18, "triangle", 0.05);
  pulseShake(1.4);
}

function castHunterSkill() {
  const ownedRoom = getOwnedRoom();
  const activeRoom =
    ownedRoom && ownedRoom.floor === game.hunter.floor
      ? ownedRoom
      : getRoomAt(game.player.x, game.player.y) ||
        world.rooms.find((room) => room.floor === game.hunter.floor && room.owner);
  const hunterType = game.runProfile.hunter.id;
  if (!activeRoom) {
    return;
  }

  triggerFloorHunterPattern(activeRoom);

  if (hunterType === "stalker") {
    const anchor = game.player.roomId === activeRoom.id
      ? { x: clamp(game.player.x - 40, activeRoom.x + 26, activeRoom.x + activeRoom.w - 26), y: clamp(game.player.y + 24, activeRoom.y + 26, activeRoom.y + activeRoom.h - 26) }
      : { x: activeRoom.door.centerX - 18, y: activeRoom.door.centerY + 24 };
    game.hunter.x = anchor.x;
    game.hunter.y = anchor.y;
    game.hunter.attackCooldown = Math.min(game.hunter.attackCooldown, 0.28);
    spawnImpact(anchor.x, anchor.y, "crimson", 1.55, 18);
    flashScreen("rgba(255, 76, 136, 0.16)", 0.3, 0.12);
    pushLog(langText("그림자 추적자가 위치를 비틀어 나타났습니다.", "The Shadow Stalker warped through the ward."));
    showBanner(langText("그림자 도약", "Shadow Warp"), localize(game.runProfile.hunter.label), "crimson", 1.15);
    playUiTone(98, 0.22, "sawtooth", 0.05);
    pulseShake(1.4);
    return;
  }

  if (hunterType === "juggernaut") {
    const slamRoom = getRoomById(game.hunter.targetRoomId) || activeRoom;
    const slamPoint = { x: slamRoom.door.centerX, y: slamRoom.door.centerY };
    spawnImpact(slamPoint.x, slamPoint.y, "amber", 1.8, 22);
    spawnSlash(game.hunter.x, game.hunter.y, slamPoint.x, slamPoint.y, "amber");
    if (slamRoom.door.closed && !slamRoom.door.broken) {
      slamRoom.door.hp -= 58 * game.runProfile.modifiers.hunterDoorDamageMultiplier;
      if (slamRoom.door.hp <= 0) {
        slamRoom.door.hp = 0;
        slamRoom.door.closed = false;
        slamRoom.door.broken = true;
      }
    }
    for (const unit of game.units) {
      if (unit.roomId === slamRoom.id && distance(unit, slamPoint) < 90) {
        unit.cooldown = Math.max(unit.cooldown, 1.6);
        if (unit.type === "husk") {
          unit.life = Math.min(unit.life, 0.2);
        }
      }
    }
    pushLog(langText("공성 괴수가 문을 내리찍었습니다.", "The Siege Juggernaut slammed the door line."));
    showBanner(langText("공성 강타", "Siege Slam"), localize(game.runProfile.hunter.label), "amber", 1.15);
    playUiTone(82, 0.28, "square", 0.055);
    pulseShake(2.1);
    return;
  }

  if (hunterType === "brood") {
    const spawnPoint = activeRoom.breach
      ? { x: activeRoom.x + activeRoom.w - 30, y: activeRoom.y + activeRoom.h / 2 }
      : { x: activeRoom.door.centerX, y: activeRoom.door.centerY };
    spawnInfectedAt(spawnPoint.x, spawnPoint.y, 2 + game.runProfile.modifiers.blackoutSpawnBonus, activeRoom.floor);
    spawnImpact(spawnPoint.x, spawnPoint.y, "amber", 1.45, 16);
    pushLog(langText("감염 번식체가 복도에 새 감염체를 토해냈습니다.", "The Brood Host birthed fresh infected into the corridor."));
    showBanner(langText("증식 파동", "Brood Surge"), localize(game.runProfile.hunter.label), "amber", 1.15);
    playUiTone(122, 0.26, "sawtooth", 0.05);
    pulseShake(1.6);
    return;
  }

  if (hunterType === "warden") {
    game.suppressionTime = Math.max(game.suppressionTime, 6.5);
    game.radarTime = Math.min(game.radarTime, 2.5);
    game.compassTime = Math.min(game.compassTime, 2.5);
    spawnImpact(game.player.x, game.player.y, "violet", 1.5, 18);
    flashScreen("rgba(168, 122, 255, 0.16)", 0.28, 0.14);
    pushLog(langText("정전 집행관이 방어 장치를 마비시켰습니다.", "The Blackout Warden suppressed active defenses."));
    showBanner(langText("억제 장막", "Suppression Veil"), localize(game.runProfile.hunter.label), "violet", 1.15);
    playUiTone(108, 0.24, "triangle", 0.05);
    pulseShake(1.5);
  }
}

function hunterMaxHp() {
  return (CONFIG.hunter.baseHp + game.hunter.level * CONFIG.hunter.hpPerLevel) * game.runProfile.modifiers.hunterHpMultiplier;
}

function updateHunterMode(dt) {
  const hunter = game.hunter;
  hunter.modeTimer -= dt;
  if (hunter.modeTimer > 0) {
    return;
  }

  const ownedRoom = getOwnedRoom();
  const localOwnedRoom = ownedRoom && ownedRoom.floor === hunter.floor ? ownedRoom : null;
  let nextMode = "stalk";
  if (game.blackoutActive) {
    nextMode = "rush";
  }
  // Level 8+ frenzy: never stalk
  if (hunter.level >= 8 && nextMode === "stalk") {
    nextMode = "rush";
  }
  if (localOwnedRoom) {
    const doorHealthRatio = localOwnedRoom.door.maxHp > 0 ? localOwnedRoom.door.hp / localOwnedRoom.door.maxHp : 0;
    const defenders = game.units.filter((unit) => unit.roomId === localOwnedRoom.id && unit.type !== "husk").length;
    if (localOwnedRoom.breach || game.player.hp < 38 || hunter.level >= 8) {
      nextMode = "enrage";
    } else if (localOwnedRoom.door.closed && !localOwnedRoom.door.broken && doorHealthRatio < 0.5) {
      nextMode = "siege";
    } else if (defenders >= 3) {
      nextMode = "rush";
    }
  } else if (hunter.floor === game.player.floor) {
    // Level 3+ patrols more aggressively between rooms
    const rushThreshold = hunter.level >= 3 ? 200 : 150;
    nextMode = distance(hunter, game.player) < rushThreshold || game.blackoutActive ? "rush" : "stalk";
  }

  if (hunter.mode !== nextMode) {
    hunter.mode = nextMode;
    const labels = {
      stalk: langText("술래가 숨을 죽였습니다.", "The hunter goes quiet."),
      siege: langText("술래가 문 파괴 태세를 잡았습니다.", "The hunter braces to break the door."),
      rush: langText("술래가 복도를 가로질러 돌진합니다.", "The hunter surges through the hall."),
      enrage: langText("술래가 광폭화했습니다.", "The hunter is enraged."),
    };
    pushLog(labels[nextMode]);
    if (nextMode === "enrage") {
      showBanner(langText("광폭화", "Enrage"), langText("술래가 속도를 올립니다.", "The hunter accelerates."), "crimson", 1.2);
    }
  }
  hunter.modeTimer = 4.5;
}

function hunterModeProfile() {
  const base = {
    stalk: { speed: 0.96, damage: 1, cooldown: 1 },
    siege: { speed: 0.88, damage: 1.35, cooldown: 0.8 },
    rush: { speed: 1.28, damage: 1.12, cooldown: 0.78 },
    enrage: { speed: 1.42, damage: 1.42, cooldown: 0.62 },
  }[game.hunter.mode];
  if (game.hunter.level >= 8) {
    return { speed: base.speed * 1.22, damage: base.damage * 1.28, cooldown: base.cooldown * 0.82 };
  }
  return base;
}

function retargetHunter() {
  const ownedRoom = getOwnedRoom();
  if (game.hunter.floor === game.player.floor && (!ownedRoom || ownedRoom.floor !== game.hunter.floor)) {
    game.hunter.targetRoomId = null;
    hunterSeekPoint(game.player.x, game.player.y);
    return;
  }
  const occupiedRooms = world.rooms.filter((room) => room.floor === game.hunter.floor && room.owner && room.owner !== "infected");
  let best = null;
  let bestScore = -Infinity;

  for (const room of occupiedRooms) {
    let score = room.aggro + randomRange(0, 8);
    if (room.owner === "player") {
      score += 18;
      score += game.mutationClock * 0.45;
      score += game.runProfile.modifiers.playerAggroBonus;
    }
    if (room.breach) {
      score += 22;
    }
    if (room.door.curse) {
      score += 16;
    }
    if (score > bestScore) {
      bestScore = score;
      best = room;
    }
  }

  if (!best) {
    const fallback = floorSpawnPoint(game.hunter.floor);
    hunterSeekPoint(fallback.x, fallback.y);
    return;
  }

  game.hunter.targetRoomId = best.id;

  if (best.id === ownedRoom?.id && best.breach) {
    hunterSeekPoint(best.x + best.w - 34, best.y + best.h / 2);
    return;
  }

  const hunterInsideTargetRoom = pointInRect(game.hunter.x, game.hunter.y, best);

  if (best.door.closed && !best.door.broken) {
    hunterSeekPoint(best.door.centerX, best.door.centerY);
  } else if (best.owner === "player" && !hunterInsideTargetRoom && !best.breach) {
    hunterSeekPoint(best.door.centerX, best.door.centerY);
  } else if (best.owner === "player") {
    hunterSeekPoint(game.player.x, game.player.y);
  } else {
    hunterSeekPoint(best.bed.x, best.bed.y);
  }
}

function hunterSeekPoint(x, y) {
  game.hunter.targetX = x;
  game.hunter.targetY = y;
}

function handleHunterDoorDamage() {
  const room = world.rooms.find((entry) => entry.id === game.hunter.targetRoomId);
  if (!room) {
    return;
  }

  if (
    room.owner === "player" &&
    room.breach &&
    distance(game.hunter, { x: room.door.centerX, y: room.door.centerY }) < 22 &&
    game.hunter.attackCooldown <= 0
  ) {
    game.hunter.attackCooldown = 1.6;
    game.hunter.x = room.x + room.w - 44;
    game.hunter.y = room.y + room.h / 2;
    pushLog(langText("술래가 균열로 미끄러져 들어왔습니다.", "The hunter slipped in through the breach."));
    pulseShake(1.4);
    playUiTone(130, 0.18, "sawtooth", 0.04);
    spawnImpact(game.hunter.x, game.hunter.y, "crimson", 1.2, 14);
    return;
  }

  if (!room.door.closed || room.door.broken) {
    return;
  }

  if (distance(game.hunter, { x: room.door.centerX, y: room.door.centerY }) > 22) {
    return;
  }
  if (game.hunter.attackCooldown > 0) {
    return;
  }
  const mode = hunterModeProfile();
  game.hunter.attackCooldown = 0.7 * mode.cooldown;
  const damage =
    (CONFIG.hunter.baseDoorDamage + game.hunter.level * CONFIG.hunter.damagePerLevel) *
    mode.damage *
    (game.floorHazards.powerSurge > 0 && game.hunter.floor === "f1" ? 1.24 : 1) *
    game.runProfile.modifiers.hunterDoorDamageMultiplier *
    game.runProfile.modifiers.hunterDamageMultiplier;
  const prevHpPct = room.door.hp / room.door.maxHp;
  if (room.owner !== "player" || game.wardEvent?.id !== "reinforced_walls") {
    room.door.hp = Math.max(0, room.door.hp - damage);
  }
  const newHpPct = room.door.hp / room.door.maxHp;
  if (room.owner === "player" && prevHpPct >= 0.4 && newHpPct < 0.4) {
    pushLog(langText("문이 무너지기 직전입니다! 지금 강화하세요!", "Your door is about to collapse! Reinforce now!"));
    flashScreen("rgba(255, 60, 60, 0.18)", 0.36, 0.15);
    playUiTone(320, 0.1, "sawtooth", 0.04);
  }
  spawnImpact(room.door.centerX, room.door.centerY, "crimson", 1.05, 12);
  if (room.door.thorns) {
    game.hunter.hp -= 8;
    spawnImpact(game.hunter.x, game.hunter.y, "gold", 0.8, 8);
  }
  if (room.door.hp <= 0) {
    room.door.broken = true;
    room.door.closed = false;
    pushLog(langText(`${room.label} 문의 봉쇄가 무너졌습니다.`, `${room.label} door collapsed.`));
    pulseShake(1.7);
    playUiTone(170, 0.22, "sawtooth", 0.05);
  }
}

function handleHunterAttacks() {
  if (game.player.spawnShield > 0) {
    return;
  }
  const hunter = game.hunter;
  // Already charging — wait for updateHunter to resolve it
  if (hunter.charging) {
    return;
  }
  if (hunter.floor === game.player.floor && distance(hunter, game.player) < 24 && hunter.attackCooldown <= 0) {
    const mode = hunterModeProfile();
    hunter.attackCooldown = 0.65 * mode.cooldown;
    // Start 0.45s charge telegraph instead of instant damage
    hunter.charging = true;
    hunter.chargeTimer = 0.45;
    playUiTone(240, 0.07, "square", 0.03);
    spawnImpact(hunter.x, hunter.y, "crimson", 0.8, 10);
    return;
  }

  const room = world.rooms.find((entry) => entry.id === game.hunter.targetRoomId);
  if (!room) {
    return;
  }

  const hider = game.hiders.find((entry) => entry.roomId === room.id && entry.alive);
  if (hider && distance(game.hunter, hider) < 24 && game.hunter.attackCooldown <= 0) {
    game.hunter.attackCooldown = 1.1;
    hider.alive = false;
    room.owner = "infected";
    room.occupied = false;
    game.units = game.units.filter((u) => !(u.roomId === room.id && u.ownerId === "player"));
    if (game.player.ownedRoomId === room.id) {
      game.player.ownedRoomId = getOwnedRooms().find((r) => r.id !== room.id)?.id || null;
    }
    spawnInfectedAt(room.bed.x, room.bed.y, 3, room.floor);
    pushLog(langText(`${room.label}이 함락됐습니다. 또 한 명이 감염됐습니다.`, `${room.label} fell. Another hider turned.`));
    pulseShake(1.1);
  }
}

function updateHunterFootstep(dt) {
  const hunter = game.hunter;
  if (hunter.floor !== game.player.floor || hunter.decoyTimer > 0) return;
  const dist = distance(hunter, game.player);
  if (dist > 320) return;
  game._footstepTimer -= dt;
  if (game._footstepTimer <= 0) {
    const proximity = 1 - dist / 320;
    const vol = 0.006 + proximity * 0.032;
    const interval = 0.55 - proximity * 0.3;
    game._footstepTimer = interval;
    playUiTone(48 + Math.random() * 16, 0.09, "sawtooth", vol);
  }
}

function updateInfected(dt) {
  for (const enemy of game.infected) {
    if (enemy.floor !== game.player.floor) {
      continue;
    }
    const profile = infectedProfile(enemy.type);
    const target = pickInfectedTarget(enemy);
    const infectedSpeedMult = (game.wardEvent?.id === "blood_moon" ? 1.5 : 1) * (game.wardEvent?.id === "phantom_surge" ? 1.4 : 1);
    moveEntityWithPath(enemy, target.x, target.y, enemy.speed * infectedSpeedMult * dt);

    const ownedRoom = getOwnedRoom();
    const localOwnedRoom = ownedRoom && ownedRoom.floor === enemy.floor ? ownedRoom : null;
    let attackedDoor = false;
    if (
      !profile.phasing &&
      localOwnedRoom &&
      localOwnedRoom.door.closed &&
      !localOwnedRoom.door.broken &&
      distance(enemy, { x: localOwnedRoom.door.centerX, y: localOwnedRoom.door.centerY }) < 20
    ) {
      attackedDoor = true;
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = profile.cooldown;
        if (game.wardEvent?.id !== "reinforced_walls") {
          localOwnedRoom.door.hp = Math.max(0, localOwnedRoom.door.hp - CONFIG.infected.doorDamage * profile.doorDamageMultiplier * game.runProfile.modifiers.infectedDamageMultiplier);
        }
        spawnImpact(localOwnedRoom.door.centerX, localOwnedRoom.door.centerY, enemy.type === "brute" ? "crimson" : "amber", enemy.type === "brute" ? 1.1 : 0.7, 8);
        if (localOwnedRoom.door.hp <= 0) {
          localOwnedRoom.door.hp = 0;
          localOwnedRoom.door.broken = true;
          localOwnedRoom.door.closed = false;
          pushLog(langText("감염체가 문을 씹어 뚫었습니다.", "Infected chewed through your door."));
          pulseShake(1.4);
          playUiTone(150, 0.16, "sawtooth", 0.04);
        }
      }
    } else {
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    }

    if (!attackedDoor && game.player.spawnShield <= 0 && distance(enemy, game.player) < 18) {
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = profile.cooldown;
        if (!state.godMode) {
          const bloodMoonMult = game.wardEvent?.id === "blood_moon" ? 1.5 : 1;
          const dmg = CONFIG.infected.playerDamage * profile.playerDamageMultiplier * game.runProfile.modifiers.infectedDamageMultiplier * bloodMoonMult;
          game.player.hp = Math.max(0, game.player.hp - dmg);
          game.stats.damageTaken = (game.stats.damageTaken || 0) + dmg;
        }
        game.player.lastDamageSource = "infected";
        pulseShake(0.9);
        playUiTone(180, 0.06, "square", 0.03);
        spawnImpact(game.player.x, game.player.y, enemy.type === "wisp" ? "violet" : "amber", enemy.type === "brute" ? 1.25 : 1.0, 10);
        spawnSlash(enemy.x, enemy.y, game.player.x, game.player.y, enemy.type === "wisp" ? "violet" : "amber");
      }
    }
  }
}

function pickInfectedTarget(enemy) {
  const ownedRoom = getOwnedRoom();
  const localOwnedRoom = ownedRoom && ownedRoom.floor === enemy.floor ? ownedRoom : null;
  if (enemy.floor !== game.player.floor) {
    return { x: enemy.x, y: enemy.y };
  }
  if (enemy.type === "wisp") {
    return game.player;
  }
  if (!localOwnedRoom) {
    return game.player;
  }
  const enemyInsideOwnedRoom = pointInRect(enemy.x, enemy.y, localOwnedRoom);
  if (game.player.roomId === localOwnedRoom.id && !enemyInsideOwnedRoom && !localOwnedRoom.breach) {
    return { x: localOwnedRoom.door.centerX, y: localOwnedRoom.door.centerY };
  }
  if (distance(enemy, game.player) < 240) {
    return game.player;
  }
  if (!enemyInsideOwnedRoom && localOwnedRoom.door.closed && !localOwnedRoom.door.broken) {
    return { x: localOwnedRoom.door.centerX, y: localOwnedRoom.door.centerY };
  }
  return game.player;
}

function collectKeycards() {
  for (const keycard of world.keycards) {
    if (keycard.collected || !keycard.visible || keycard.floor !== game.player.floor) {
      continue;
    }
    if (distance(game.player, keycard) < 18) {
      keycard.collected = true;
      game.keycardsCollected += 1;
      pushLog(langText(`${keycard.id} 확보.`, `Recovered ${keycard.id}.`));
      playUiTone(620, 0.12, "triangle", 0.045);
      showBanner(langText("시질 회수", "Sigil Recovered"), keycard.id, "gold", 1.15);
      const gateWasClosed = world.exitRoom.gate.closed;
      refreshUnlockProgress();
      handleGateUnlockFeedback(gateWasClosed);
      // Alarm: spawn infected + drive hunter to sigil floor (skip if decoy active)
      if (game.time > 30) {
        spawnInfectedAt(keycard.x, keycard.y, 2, keycard.floor);
        if (game.hunter.decoyTimer <= 0) {
          game.hunter.floor = keycard.floor;
          const alarmAnchor = floorSpawnPoint(keycard.floor);
          game.hunter.x = alarmAnchor.x;
          game.hunter.y = alarmAnchor.y;
          game.hunter.targetRoomId = null;
          game.hunter.retargetTimer = 0;
        }
        pushLog(langText("시질 회수 경보! 감염체들이 몰려옵니다!", "Sigil alarm triggered! Infected converging!"));
        flashScreen("rgba(255, 60, 60, 0.28)", 0.5, 0.25);
        pulseShake(1.8);
        playUiTone(180, 0.16, "sawtooth", 0.05);
      }
    }
  }
}

function spawnInfectedAt(x, y, count, floor = game.hunter.floor, forcedType = null) {
  for (let index = 0; index < count; index += 1) {
    const type = rollInfectedType(floor, forcedType);
    const profile = infectedProfile(type);
    game.infected.push({
      type,
      floor,
      x: x + randomRange(-18, 18),
      y: y + randomRange(-18, 18),
      radius: profile.radius,
      hp: 26 * profile.hpMultiplier * game.runProfile.modifiers.infectedHpMultiplier * (game.wardEvent?.id === "blood_moon" ? 1.5 : 1),
      speed: randomRange(72, 92) * profile.speedMultiplier * game.runProfile.modifiers.infectedSpeedMultiplier,
      attackCooldown: 0,
    });
  }
}

function explodeAt(x, y, radius, damage, floor = game.hunter.floor) {
  const targets = [game.hunter, ...game.infected];
  for (const target of targets) {
    if (target.floor !== floor) {
      continue;
    }
    if (distance({ x, y }, target) < radius) {
      target.hp -= damage;
    }
  }
}

function nearestEnemy(unit, range) {
  const candidates = [game.hunter, ...game.infected];
  let chosen = null;
  let bestDistance = range;
  for (const enemy of candidates) {
    if (enemy.floor !== unit.floor) {
      continue;
    }
    const d = distance(unit, enemy);
    if (d < bestDistance) {
      bestDistance = d;
      chosen = enemy;
    }
  }
  return chosen;
}

function selectUnitTarget(unit, ownedRoom) {
  if (!ownedRoom || unit.roomId !== ownedRoom.id) {
    return nearestEnemy(unit, unit.type === "relic" ? 260 : 180);
  }

  const doorPoint = { x: ownedRoom.door.centerX, y: ownedRoom.door.centerY };
  if (unit.role === "anchor") {
    return nearestEnemyWithFilter(unit, CONFIG.ally.defendDoorRange, (enemy) => distance(enemy, doorPoint) < 110);
  }
  if (unit.role === "interceptor") {
    return nearestEnemyWithFilter(unit, 240, (enemy) => distance(enemy, doorPoint) < CONFIG.ally.interceptDoorRange || pointInRect(enemy.x, enemy.y, ownedRoom));
  }
  if (unit.role === "ward") {
    return nearestEnemy(unit, 260);
  }
  return nearestEnemy(unit, 180);
}

function updateUnitPosition(unit, target, dt) {
  const room = world.rooms.find((entry) => entry.id === unit.roomId);
  if (!room) {
    return;
  }

  if (unit.role === "interceptor") {
    const interceptPoint = target
      ? { x: clamp(target.x, room.x + 20, room.x + room.w - 20), y: clamp(target.y, room.y + 20, room.y + room.h - 20) }
      : { x: room.door.centerX, y: room.y + room.h / 2 };
    const speed = 88;
    const dx = interceptPoint.x - unit.x;
    const dy = interceptPoint.y - unit.y;
    const len = Math.hypot(dx, dy);
    if (len > 2) {
      unit.x += (dx / len) * speed * dt;
      unit.y += (dy / len) * speed * dt;
    }
    return;
  }

  if (unit.role === "anchor") {
    const anchorPoint = { x: room.door.centerX - 42, y: room.y + room.h / 2 };
    unit.x += (anchorPoint.x - unit.x) * Math.min(1, dt * 2.2);
    unit.y += (anchorPoint.y - unit.y) * Math.min(1, dt * 2.2);
    return;
  }

  if (unit.role === "ward") {
    const wardPoint = { x: room.altar.x, y: room.altar.y };
    unit.x += (wardPoint.x - unit.x) * Math.min(1, dt * 1.6);
    unit.y += (wardPoint.y - unit.y) * Math.min(1, dt * 1.6);
    return;
  }

  unit.angle += dt * 1.8;
  unit.x = room.x + room.w / 2 + Math.cos(unit.angle) * 72;
  unit.y = room.y + room.h / 2 + Math.sin(unit.angle) * 44;
}

function nearestEnemyWithFilter(unit, range, predicate) {
  const candidates = [game.hunter, ...game.infected];
  let chosen = null;
  let bestDistance = range;
  for (const enemy of candidates) {
    if (enemy.floor !== unit.floor) {
      continue;
    }
    if (!predicate(enemy)) {
      continue;
    }
    const d = distance(unit, enemy);
    if (d < bestDistance) {
      bestDistance = d;
      chosen = enemy;
    }
  }
  return chosen;
}

function countBreaches() {
  return world.rooms.filter((room) => room.breach).length;
}

function floorSpawnPoint(floor) {
  if (floor === "f2") {
    return {
      x: world.upperHall.x + world.upperHall.w / 2,
      y: world.upperHall.y + 86,
    };
  }
  return {
    x: world.hall.x + world.hall.w / 2,
    y: world.hall.y + 86,
  };
}

function formatFloorName(floor) {
  return floor === "f2"
    ? langText("2층 아카이브", "Floor 2 Archive")
    : langText("1층 본관", "Floor 1 Ward");
}

function createContract(id) {
  if (id === "upperSweep") {
    return {
      id,
      title: { ko: "상층 소거", en: "Upper Sweep" },
      description: { ko: "2층에 머물며 영역을 안정화하세요.", en: "Hold the upper floor long enough to stabilize it." },
      target: 8,
      progress: 0,
      reward: { gold: 160, heal: 14 },
    };
  }
  if (id === "purge") {
    return {
      id,
      title: { ko: "정화 지시", en: "Purge Order" },
      description: { ko: "감염체를 다섯 마리 처치하세요.", en: "Eliminate five infected." },
      target: 5,
      progress: game.stats.infectedKills,
      reward: { gold: 120, fragment: 1 },
    };
  }
  if (id === "signalTap") {
    return {
      id,
      title: { ko: "신호 도청", en: "Signal Tap" },
      description: { ko: "단말기 해킹을 두 번 완료하세요.", en: "Complete two terminal intel rolls." },
      target: 2,
      progress: game.stats.intelPurchases,
      reward: { gold: 120, radar: 8 },
    };
  }
  if (id === "doorSentinel") {
    return {
      id,
      title: { ko: "문지기", en: "Door Sentinel" },
      description: { ko: "문이 60% 이상인 상태로 방에서 20초 버티세요.", en: "Stay in your room with door above 60% for 20 seconds." },
      target: 20,
      progress: 0,
      targetRoomId: getOwnedRoom()?.id || null,
      reward: { gold: 130, heal: 10 },
    };
  }
  if (id === "sealHunter") {
    return {
      id,
      title: { ko: "균열 봉인", en: "Seal Hunter" },
      description: { ko: "이상현상 봉인 균열을 한 번 닫으세요.", en: "Close one anomaly seal rift." },
      target: 1,
      progress: game.stats.anomaliesClosed,
      reward: { gold: 130, fragment: 1 },
    };
  }
  return {
    id: "blackoutWatch",
    title: { ko: "암흑 경계", en: "Blackout Watch" },
    description: { ko: "정전 중 방 안에서 12초 버티세요.", en: "Hold your room for 12 seconds during a blackout." },
    target: 12,
    progress: 0,
    reward: { gold: 100, radar: 10 },
  };
}

function contractProgressValue(contract) {
  if (!contract) {
    return 0;
  }
  if (contract.id === "upperSweep" || contract.id === "doorSentinel" || contract.id === "blackoutWatch") {
    return contract.progress;
  }
  if (contract.id === "purge") {
    return game.stats.infectedKills - contract.progress;
  }
  if (contract.id === "sealHunter") {
    return game.stats.anomaliesClosed - contract.progress;
  }
  return game.stats.intelPurchases - contract.progress;
}

function formatContractStatus() {
  if (!game.contract) {
    return langText("없음", "None");
  }
  const progress = Math.min(game.contract.target, contractProgressValue(game.contract));
  if (game.contract.id === "upperSweep" || game.contract.id === "doorSentinel" || game.contract.id === "blackoutWatch") {
    const roomSuffix = game.contract.id === "doorSentinel" && game.contract.targetRoomId
      ? ` (${getRoomById(game.contract.targetRoomId)?.label || "?"})`
      : "";
    return `${localize(game.contract.title)}${roomSuffix} ${progress.toFixed(1)} / ${game.contract.target}s`;
  }
  return `${localize(game.contract.title)} ${progress} / ${game.contract.target}`;
}

function issueContract() {
  if (game.contract) return;
  const pool = ["upperSweep", "purge", "signalTap", "doorSentinel", "sealHunter", "blackoutWatch"];
  const contractId = pickOne(pool);
  game.contract = createContract(contractId);
  game.contract.expiresIn = 90;
  game.nextContractTimer = randomRange(28, 42);
  pushLog(
    langText(
      `계약 발생: ${localize(game.contract.title)}.`,
      `Contract issued: ${localize(game.contract.title)}.`,
    ),
  );
  showBanner(localize(game.contract.title), localize(game.contract.description), "gold", 1.45);
  playUiTone(610, 0.11, "triangle", 0.04);
}

function completeContract() {
  const contract = game.contract;
  if (!contract) {
    return;
  }
  const contractMult = game.runProfile.modifiers.contractRewardMult || 1;
  addGold((contract.reward.gold || 0) * contractMult);
  if (contract.reward.heal) {
    const healMult = game.runProfile.modifiers.healMultiplier || 1;
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + contract.reward.heal * healMult);
  }
  if (contract.reward.fragment && game.fragments < CONFIG.intel.maxFragments) {
    game.fragments += contract.reward.fragment;
  }
  const gateWasClosed = world.exitRoom.gate.closed;
  refreshUnlockProgress();
  handleGateUnlockFeedback(gateWasClosed);
  if (contract.reward.radar) {
    game.radarTime = Math.max(game.radarTime, contract.reward.radar + (game.runProfile.modifiers.radarDurationBonus || 0));
  }
  game.stats.contractsCompleted += 1;
  pushLog(
    langText(
      `계약 완료: ${localize(contract.title)}.`,
      `Contract complete: ${localize(contract.title)}.`,
    ),
  );
  showBanner(
    langText("계약 완료", "Contract Complete"),
    langText(`보상 지급: ${contract.reward.gold || 0} 골드`, `Reward delivered: ${contract.reward.gold || 0} gold`),
    "gold",
    1.4,
  );
  pulseShake(1.1);
  playUiTone(720, 0.14, "triangle", 0.05);
  game.contract = null;
  game.nextContractTimer = randomRange(45, 65);
}


function updateEscapeWindow(dt) {
  if (!game.escapeWindow && game.escapeReopenTimer <= 0) return;

  if (game.escapeReopenTimer > 0 && world.exitRoom.gate.closed) {
    game.escapeReopenTimer -= dt;
    if (game.escapeReopenTimer <= 0) {
      game.escapeReopenTimer = 0;
      refreshUnlockProgress();
      if (!world.exitRoom.gate.closed) {
        game.escapeWindow = { timer: 120, warningShown: false };
        spawnInfectedAt(world.exitRoom.x + world.exitRoom.w / 2, world.exitRoom.y + world.exitRoom.h / 2, 1, world.exitRoom.floor);
        pushLog(langText("탈출구가 다시 열렸습니다! 감염체 주의!", "Escape gate reopened! Watch for infected!"));
        showBanner(langText("탈출 재개방", "Gate Reopened"), langText("지금이 기회입니다!", "This is your chance!"), "cyan", 2.0);
        flashScreen("rgba(133, 216, 255, 0.25)", 0.5, 0.25);
      } else {
        game.escapeReopenTimer = 90;
      }
    }
  }

  if (!game.escapeWindow || world.exitRoom.gate.closed) return;

  game.escapeWindow.timer -= dt;

  if (!game.escapeWindow.warningShown && game.escapeWindow.timer <= 30) {
    game.escapeWindow.warningShown = true;
    pushLog(langText("게이트가 30초 후 닫힙니다!", "Gate closes in 30 seconds!"));
    showBanner(langText("경고", "WARNING"), langText("탈출구 30초 후 폐쇄", "Exit closing in 30s"), "amber", 2.0);
    flashScreen("rgba(255, 160, 30, 0.25)", 0.5, 0.25);
    playUiTone(440, 0.18, "square", 0.06);
  }

  if (game.escapeWindow.timer <= 0) {
    world.exitRoom.gate.closed = true;
    game.escapeWindow = null;
    game.escapeReopenTimer = 90;
    game.hunter.level = Math.min(20, game.hunter.level + 2);
    pushLog(langText("게이트가 폐쇄됐습니다. 90초 후 재개방됩니다.", "Gate sealed. Reopens in 90 seconds."));
    showBanner(langText("게이트 폐쇄", "Gate Sealed"), langText("술래 강화 — 90초 후 재개방", "Hunter strengthened — reopens in 90s"), "crimson", 2.5);
    flashScreen("rgba(255, 30, 60, 0.3)", 0.6, 0.3);
    pulseShake(2.5);
    playUiTone(200, 0.25, "sawtooth", 0.07);
  }
}

function triggerRaid() {
  const ownedRoom = getOwnedRoom();
  if (!ownedRoom) return;

  game.raidActive = true;
  game.raidTimer = 25;

  const spawnX = ownedRoom.x - 40;
  const spawnY = ownedRoom.y + ownedRoom.h / 2;
  for (let i = 0; i < 3; i++) {
    spawnInfectedAt(spawnX + randomRange(-30, 30), spawnY + randomRange(-20, 20), 1, ownedRoom.floor);
  }

  if (game.hunter.floor !== ownedRoom.floor) {
    game.hunter.floor = ownedRoom.floor;
    const floorAnchor = floorSpawnPoint(ownedRoom.floor);
    game.hunter.x = floorAnchor.x;
    game.hunter.y = floorAnchor.y;
    spawnImpact(game.hunter.x, game.hunter.y, "crimson", 1.6, 20);
  }
  game.hunter.targetRoomId = ownedRoom.id;
  game.hunter.mode = "enrage";
  game.hunter.modeTimer = 25;
  hunterSeekPoint(ownedRoom.door.centerX, ownedRoom.door.centerY);

  pushLog(langText("총공격! 모든 적이 당신의 방을 향합니다!", "All-out raid! Every enemy converges on your room!"));
  showBanner(langText("총공격", "RAID"), langText("모든 적이 집결합니다", "All enemies converge"), "crimson", 2.5);
  flashScreen("rgba(255, 30, 60, 0.35)", 0.7, 0.35);
  pulseShake(2.2);
  playUiTone(150, 0.28, "sawtooth", 0.08);
  playUiTone(300, 0.2, "sawtooth", 0.06);
}

function updateRaid(dt) {
  if (game.phase !== "running") return;
  if (!getOwnedRoom()) return;

  if (game.raidActive) {
    game.raidTimer -= dt;
    if (game.raidTimer <= 0) {
      game.raidActive = false;
      game.nextRaidTimer = randomRange(210, 300);
      pushLog(langText("총공격이 물러났습니다.", "The raid has ended."));
    }
    return;
  }

  if (game.time >= 300 && game.time < 600) {
    game.nextMiniRaidTimer -= dt;
    if (game.nextMiniRaidTimer <= 0) {
      game.nextMiniRaidTimer = randomRange(100, 140);
      const ownedRoom = getOwnedRoom();
      if (ownedRoom) {
        spawnInfectedAt(ownedRoom.x + ownedRoom.w + 30, ownedRoom.y + ownedRoom.h / 2, 1, ownedRoom.floor);
        pushLog(langText("작은 무리가 접근합니다.", "A small group approaches."));
      }
    }
  }

  if (game.time < 600) return;

  game.nextRaidTimer -= dt;
  if (game.nextRaidTimer <= 0) {
    triggerRaid();
  }
}

function updateContracts(dt) {
  if (!getOwnedRoom()) {
    if (game.contract) {
      game.contract.expiresIn -= dt;
      if (game.contract.expiresIn <= 0) {
        game.contract = null;
        game.nextContractTimer = randomRange(45, 65);
      }
    }
    return;
  }
  if (!game.contract) {
    game.nextContractTimer -= dt;
    if (game.nextContractTimer <= 0) {
      issueContract();
    }
    return;
  }

  if (game.contract.id === "upperSweep" && game.player.floor === "f2") {
    game.contract.progress += dt;
  }
  if (game.contract.id === "doorSentinel") {
    const own = game.contract.targetRoomId
      ? getRoomById(game.contract.targetRoomId)
      : getOwnedRoom();
    if (own && own.owner === "player" && pointInRect(game.player.x, game.player.y, own) && own.door.hp / own.door.maxHp >= 0.6) {
      game.contract.progress += dt;
    }
  }
  if (game.contract.id === "blackoutWatch" && game.blackoutActive) {
    const own = getOwnedRoom();
    if (own && pointInRect(game.player.x, game.player.y, own)) {
      game.contract.progress += dt;
    }
  }

  game.contract.expiresIn -= dt;
  if (game.contract.expiresIn <= 0) {
    pushLog(langText("계약 시간 초과.", "Contract expired."));
    game.contract = null;
    game.nextContractTimer = randomRange(45, 65);
    return;
  }

  if (game.contract && contractProgressValue(game.contract) >= game.contract.target) {
    completeContract();
  }
}

function anomalyAnchorsForFloor(floor) {
  if (floor === "f2") {
    return [
      { x: world.upperHall.x + 180, y: world.upperHall.y + world.upperHall.h / 2 },
      { x: world.upperHall.x + world.upperHall.w - 180, y: world.upperHall.y + world.upperHall.h / 2 },
      ...world.rooms.filter((room) => room.floor === "f2").map((room) => ({ x: room.x + room.w / 2, y: room.y + room.h / 2 })),
    ];
  }
  return [
    { x: world.hall.x + 240, y: world.hall.y + world.hall.h / 2 },
    { x: world.hall.x + world.hall.w - 240, y: world.hall.y + world.hall.h / 2 },
    { x: world.generator.x, y: world.generator.y - 70 },
    ...world.rooms.filter((room) => room.floor === "f1").map((room) => ({ x: room.x + room.w / 2, y: room.y + room.h / 2 })),
  ];
}

function formatAnomalyStatus() {
  if (!game.anomaly) return langText("없음", "None");
  const typeDef = ANOMALY_TYPES.find((t) => t.id === (game.anomaly.type || "seal_rift")) || ANOMALY_TYPES[0];
  const base = `${langText(typeDef.label.ko, typeDef.label.en)} ${formatFloorName(game.anomaly.floor)} ${game.anomaly.timer.toFixed(0)}s`;
  if (game.anomaly.type === "void_drain" && game.player.floor === game.anomaly.floor) {
    return `${base} (-1.5g/s)`;
  }
  if (game.anomaly.type === "plague_nexus") {
    const nextSpawn = Math.ceil(game.anomaly.spawnTimer || 8);
    return `${base} (${langText("소환", "spawn")} ${nextSpawn}s)`;
  }
  return base;
}

function pickAnomalyType() {
  const totalWeight = ANOMALY_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const t of ANOMALY_TYPES) {
    roll -= t.weight;
    if (roll <= 0) return t;
  }
  return ANOMALY_TYPES[0];
}

function spawnAnomaly() {
  if (game.anomaly) return;
  const ownedRoom = getOwnedRoom();
  if (!ownedRoom) {
    return;
  }
  const preferredFloor = Math.random() < 0.72 ? "f2" : "f1";
  const anchors = anomalyAnchorsForFloor(preferredFloor);
  const point = pickOne(anchors);
  const typeDef = pickAnomalyType();
  const timerVal = randomRange(typeDef.timer[0], typeDef.timer[1]);
  game.anomaly = {
    floor: preferredFloor,
    x: point.x,
    y: point.y,
    timer: timerVal,
    maxTimer: typeDef.timer[1],
    type: typeDef.id,
    spawnTimer: 8,
  };
  game.nextAnomalyTimer = randomRange(34, 52);
  pushLog(
    langText(
      `${formatFloorName(preferredFloor)}에 ${langText(typeDef.label.ko, typeDef.label.en)}이(가) 발생했습니다.`,
      `A ${langText(typeDef.label.ko, typeDef.label.en)} appeared on ${formatFloorName(preferredFloor)}.`,
    ),
  );
  showBanner(langText("이상현상 발생", "Anomaly Detected"), langText(typeDef.label.ko, typeDef.label.en), "violet", 1.35);
  pulseShake(0.9);
  playUiTone(preferredFloor === "f2" ? 540 : 480, 0.13, "triangle", 0.04);
}

function resolveAnomaly(success) {
  const anomaly = game.anomaly;
  if (!anomaly) {
    return;
  }

  const typeDef = ANOMALY_TYPES.find((t) => t.id === (anomaly.type || "seal_rift")) || ANOMALY_TYPES[0];
  const typeLabel = langText(typeDef.label.ko, typeDef.label.en);

  if (success) {
    game.stats.anomaliesClosed += 1;
    const anomalyMult = game.runProfile.modifiers.anomalyRewardMult || 1;
    const rewardRoll = Math.random();
    let rewardText = "";
    if (rewardRoll < 0.45) {
      addGold(Math.round(110 * anomalyMult));
      rewardText = langText(`${Math.round(110 * anomalyMult)} 골드`, `${Math.round(110 * anomalyMult)} gold`);
    } else if (rewardRoll < 0.75) {
      const healAmount = Math.round(20 * anomalyMult);
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + healAmount * (game.runProfile.modifiers.healMultiplier || 1));
      rewardText = langText("체력 회복", "HP restored");
    } else {
      const gateWasClosed = world.exitRoom.gate.closed;
      game.fragments = Math.min(CONFIG.intel.maxFragments, game.fragments + 1);
      refreshUnlockProgress();
      handleGateUnlockFeedback(gateWasClosed);
      rewardText = langText("지도 조각 +1", "Fragment +1");
    }
    pushLog(
      langText(
        `${formatFloorName(anomaly.floor)}의 ${typeLabel}을(를) 차단했습니다.`,
        `You disrupted the ${typeLabel} on ${formatFloorName(anomaly.floor)}.`,
      ),
    );
    showBanner(langText("이상현상 차단", "Anomaly Disrupted"), rewardText, "cyan", 1.35);
    pulseShake(0.8);
    playUiTone(700, 0.15, "triangle", 0.05);
  } else {
    spawnInfectedAt(anomaly.x, anomaly.y, anomaly.floor === "f2" ? 3 : 2, anomaly.floor);
    if (anomaly.floor === game.player.floor) {
      game.suppressionTime = Math.max(game.suppressionTime, anomaly.floor === "f2" ? 3.5 : 2.2);
      flashScreen("rgba(255, 96, 156, 0.14)", 0.24, 0.14);
    }
    pushLog(
      langText(
        `${formatFloorName(anomaly.floor)}의 ${typeLabel}이(가) 폭주하여 감염체가 쏟아졌습니다.`,
        `The ${typeLabel} on ${formatFloorName(anomaly.floor)} ruptured and spilled infected.`,
      ),
    );
    showBanner(langText("이상현상 폭주", "Anomaly Rupture"), formatFloorName(anomaly.floor), "crimson", 1.35);
    pulseShake(1.4);
    playUiTone(150, 0.18, "sawtooth", 0.05);
  }
  game.anomaly = null;
  game.nextAnomalyTimer = Math.max(game.nextAnomalyTimer, randomRange(34, 52));
}

function updateAnomaly(dt) {
  if (!getOwnedRoom()) {
    return;
  }
  if (!game.anomaly) {
    game.nextAnomalyTimer -= dt;
    if (game.nextAnomalyTimer <= 0) {
      spawnAnomaly();
    }
    return;
  }

  game.anomaly.timer -= dt;

  const anomalyType = game.anomaly.type || "seal_rift";
  if (anomalyType === "plague_nexus") {
    game.anomaly.spawnTimer = (game.anomaly.spawnTimer || 8) - dt;
    if (game.anomaly.spawnTimer <= 0) {
      game.anomaly.spawnTimer = 8;
      spawnInfectedAt(game.anomaly.x, game.anomaly.y, 1, game.anomaly.floor);
    }
  } else if (anomalyType === "void_drain") {
    if (game.player.floor === game.anomaly.floor) {
      addGold(-1.5 * dt);
    }
  }

  if (game.player.floor === game.anomaly.floor && distance(game.player, game.anomaly) < 26) {
    resolveAnomaly(true);
    return;
  }
  if (game.anomaly.timer <= 0) {
    resolveAnomaly(false);
  }
}

function updateWardEvent(dt) {
  if (game.wardEvent === null) {
    if ((game.wardEventCount || 0) < 4) {
      game.wardEventTimer -= dt;
      if (game.wardEventTimer <= 0) {
        game.wardEventCount = (game.wardEventCount || 0) + 1;
        const event = WARD_EVENTS[Math.floor(Math.random() * WARD_EVENTS.length)];
        const intensity = game.runProfile.modifiers.wardEventIntensity || 1;
        game.wardEvent = { id: event.id, timer: event.duration * intensity };
        const intervalMult = game.runProfile.modifiers.wardEventIntervalMult || 1;
        game.wardEventTimer = randomRange(120, 180) * intervalMult;
        pushLog(langText(`격리 구역 이상 — ${event.label.ko}: ${event.desc.ko}`, `Ward anomaly — ${event.label.en}: ${event.desc.en}`));
        showBanner(langText("격리 이상", "Ward Anomaly"), langText(event.desc.ko, event.desc.en), "violet", 1.8);
        flashScreen("rgba(212, 149, 255, 0.18)", 0.4, 0.2);
        playUiTone(220, 0.18, "triangle", 0.05);
      }
    }
  } else {
    game.wardEvent.timer -= dt;
    if (game.wardEvent.timer <= 0) {
      const endedId = game.wardEvent.id;
      game.wardEvent = null;
      pushLog(langText("격리 구역 이상이 해소됐습니다.", "Ward anomaly cleared."));
      // Reset ward-event effects that need explicit cleanup
      if (endedId === "speed_boost") {
        game.player.speed = CONFIG.player.speed;
      }
      if (endedId === "echo_scan") {
        game.radarTime = 0;
      }
    }
  }
  // Apply echo_scan ward event: extend radar
  if (game.wardEvent?.id === "echo_scan") {
    game.radarTime = Math.max(game.radarTime, 2.5);
  }
}

function moveTowardTarget(entity, x, y, amount) {
  const dx = x - entity.x;
  const dy = y - entity.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) {
    return;
  }
  moveEntity(entity, (dx / len) * amount, (dy / len) * amount);
}

function moveEntityWithPath(entity, x, y, amount) {
  const waypoint = getNextWaypoint(entity.x, entity.y, x, y, entity.floor || game.player.floor);
  if (waypoint) {
    moveTowardTarget(entity, waypoint.x, waypoint.y, amount);
    return;
  }
  moveTowardTarget(entity, x, y, amount);
}

function buildNavGraph(currentWorld) {
  const nodes = [];
  const pushNode = (id, x, y, floor) => nodes.push({ id, x, y, floor, links: [] });
  const link = (a, b) => {
    const from = nodes.find((node) => node.id === a);
    const to = nodes.find((node) => node.id === b);
    if (from && to) {
      from.links.push(b);
      to.links.push(a);
    }
  };

  const hallHubs = [];
  for (let index = 0; index < 5; index += 1) {
    const id = `hallHub${index}`;
    const x = currentWorld.hall.x + 180 + index * ((currentWorld.hall.w - 360) / 4);
    const y = currentWorld.hall.y + currentWorld.hall.h / 2;
    hallHubs.push({ id, x, y });
    pushNode(id, x, y, "f1");
    if (index > 0) {
      link(`hallHub${index - 1}`, id);
    }
  }
  pushNode("exitConnector", currentWorld.exitConnector.x + currentWorld.exitConnector.w / 2, currentWorld.exitConnector.y + currentWorld.exitConnector.h / 2, "f1");
  pushNode("generatorConnector", currentWorld.generatorConnector.x + currentWorld.generatorConnector.w / 2, currentWorld.generatorConnector.y + currentWorld.generatorConnector.h / 2, "f1");

  link("hallHub4", "exitConnector");
  link("hallHub4", "generatorConnector");

  for (const room of currentWorld.rooms) {
    const doorId = `${room.id}Door`;
    const roomId = `${room.id}Room`;
    pushNode(doorId, room.door.centerX, room.door.centerY + (room.y < currentWorld.hall.y ? 28 : -28), room.floor);
    pushNode(roomId, room.x + room.w / 2, room.y + room.h / 2, room.floor);
    if (room.floor !== "f1") {
      continue;
    }
    let closestHub = hallHubs[0].id;
    let bestDistance = Infinity;
    for (const hub of hallHubs) {
      const d = Math.abs(room.door.centerX - hub.x);
      if (d < bestDistance) {
        bestDistance = d;
        closestHub = hub.id;
      }
    }
    link(closestHub, doorId);
    link(doorId, roomId);
  }

  pushNode("generatorDoor", currentWorld.generatorRoom.door.centerX, currentWorld.generatorRoom.door.centerY - 30, "f1");
  pushNode("generatorRoom", currentWorld.generatorRoom.x + currentWorld.generatorRoom.w / 2, currentWorld.generatorRoom.y + currentWorld.generatorRoom.h / 2, "f1");
  pushNode("exitDoor", currentWorld.exitRoom.gate.centerX + 34, currentWorld.exitRoom.gate.centerY, "f1");
  pushNode("exitRoom", currentWorld.exitRoom.x + currentWorld.exitRoom.w / 2, currentWorld.exitRoom.y + currentWorld.exitRoom.h / 2, "f1");

  link("generatorConnector", "generatorDoor");
  link("generatorDoor", "generatorRoom");
  link("exitConnector", "exitDoor");
  link("exitDoor", "exitRoom");

  const upperHubs = [];
  for (let index = 0; index < 3; index += 1) {
    const id = `upperHub${index}`;
    const x = currentWorld.upperHall.x + 170 + index * ((currentWorld.upperHall.w - 340) / 2);
    const y = currentWorld.upperHall.y + currentWorld.upperHall.h / 2;
    upperHubs.push({ id, x, y });
    pushNode(id, x, y, "f2");
    if (index > 0) {
      link(`upperHub${index - 1}`, id);
    }
  }

  for (const room of currentWorld.rooms.filter((entry) => entry.floor === "f2")) {
    const doorId = `${room.id}Door`;
    let closestHub = upperHubs[0].id;
    let bestDistance = Infinity;
    for (const hub of upperHubs) {
      const d = Math.abs(room.door.centerX - hub.x);
      if (d < bestDistance) {
        bestDistance = d;
        closestHub = hub.id;
      }
    }
    link(closestHub, doorId);
    link(doorId, `${room.id}Room`);
  }

  return nodes;
}

function getNextWaypoint(fromX, fromY, targetX, targetY, floor) {
  const start = nearestNavNode(fromX, fromY, floor);
  const goal = nearestNavNode(targetX, targetY, floor);
  if (!start || !goal || start.id === goal.id) {
    return null;
  }

  const queue = [start.id];
  const visited = new Set([start.id]);
  const previous = new Map();

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === goal.id) {
      break;
    }
    const currentNode = navGraph.find((node) => node.id === current);
    if (!currentNode) { continue; }
    for (const linkId of currentNode.links) {
      if (visited.has(linkId)) {
        continue;
      }
      visited.add(linkId);
      previous.set(linkId, current);
      queue.push(linkId);
    }
  }

  if (!visited.has(goal.id)) {
    return null;
  }

  let stepId = goal.id;
  while (previous.get(stepId) && previous.get(stepId) !== start.id) {
    stepId = previous.get(stepId);
  }
  return navGraph.find((node) => node.id === stepId) || null;
}

function nearestNavNode(x, y, floor) {
  let chosen = null;
  let bestDistance = Infinity;
  for (const node of navGraph) {
    if (node.floor !== floor) {
      continue;
    }
    const d = distance({ x, y }, node);
    if (d < bestDistance) {
      bestDistance = d;
      chosen = node;
    }
  }
  return chosen;
}

function moveEntity(entity, dx, dy) {
  const nextX = entity.x + dx;
  const moveValidator = entity.type === "wisp" ? canMoveToGhost : canMoveTo;
  if (moveValidator(nextX, entity.y, entity.radius, entity.floor || game.player.floor)) {
    entity.x = nextX;
  }
  const nextY = entity.y + dy;
  if (moveValidator(entity.x, nextY, entity.radius, entity.floor || game.player.floor)) {
    entity.y = nextY;
  }
}

function canMoveTo(x, y, radius, floor = game.player.floor) {
  if (!world.zones.some((zone) => zone.floor === floor && pointInRect(x, y, zone))) {
    return false;
  }

  const colliders = world.barriers.filter((rect) => rect.floor === floor);
  for (const room of world.rooms) {
    if (room.floor === floor && room.door.closed && !room.door.broken) {
      colliders.push(room.door);
    }
  }
  if (world.exitRoom.floor === floor && world.exitRoom.gate.closed) {
    colliders.push(world.exitRoom.gate);
  }

  return !colliders.some((rect) => circleIntersectsRect(x, y, radius, rect));
}

function canMoveToGhost(x, y, radius, floor = game.player.floor) {
  if (!world.zones.some((zone) => zone.floor === floor && pointInRect(x, y, zone))) {
    return false;
  }
  const colliders = world.barriers.filter((rect) => rect.floor === floor);
  return !colliders.some((rect) => circleIntersectsRect(x, y, radius, rect));
}

function draw() {
  drawBackdrop();
  ctx.save();
  const shakeScale = state.lowFx ? 4 : 10;
  const shakeX = (Math.random() - 0.5) * state.screenShake * shakeScale;
  const shakeY = (Math.random() - 0.5) * state.screenShake * shakeScale;
  ctx.translate(shakeX, shakeY);
  drawAtmosphere();
  ctx.save();
  ctx.translate(-state.camera.x, -state.camera.y);
  drawZones();
  drawKeycards();
  drawAfterimages();
  drawUnits();
  drawActors();
  drawDoors();
  drawFloatTexts();
  drawEffects();
  ctx.restore();
  drawThreatOverlay();
  if (!state.lowFx) {
    drawHudMap();
  }
  drawLighting();
  ctx.restore();
  drawWardEventIndicator();
  drawBanner();
  drawFlashOverlay();
  drawMessageOverlay();
  if (state.showTutorial) drawTutorialOverlay();
}

function drawTutorialOverlay() {
  const W = WIDTH, H = HEIGHT;
  ctx.save();
  ctx.fillStyle = "rgba(5, 8, 16, 0.88)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#8fe9c7";
  ctx.font = "700 26px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(langText("야간 탈출 — 조작 안내", "Night Shift Escape — How to Play"), W / 2, H / 2 - 110);
  const tips = [
    langText("① WASD(또는 클릭)로 이동 · Tab으로 이동 방식 전환", "① WASD or click to move · Tab toggles move mode"),
    langText("② 빈 방 앞에서 E — 방 점거. 침대 위 = 골드 + 체력 회복", "② E at empty room to Claim · Stand on Bed = gold + heal"),
    langText("③ 단말기에서 E — 정보 구매로 지도 조각 획득", "③ E at Terminal — Buy intel to earn map fragments"),
    langText("④ 조각 6개 + 시질 2개 → 탈출구 해금. E를 5초 유지해 탈출", "④ 6 fragments + 2 sigils unlock exit · Hold E 5s to escape"),
    langText("⑤ R — 문 강화. 정전 시 발전기(G 표시) 에서 E 유지해 수리", "⑤ R reinforces door · Hold E at Generator (G) during blackout"),
  ];
  ctx.fillStyle = "#c8deff";
  ctx.font = "500 14px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  tips.forEach((tip, i) => {
    ctx.fillText(tip, W / 2, H / 2 - 55 + i * 28);
  });
  ctx.fillStyle = "rgba(255, 220, 120, 0.55)";
  ctx.font = "600 12px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(langText("아무 키나 눌러 시작하세요", "Press any key to begin"), W / 2, H / 2 + 105);
  ctx.restore();
}

function drawWardEventIndicator() {
  if (!game.wardEvent) return;
  const wdef = WARD_EVENTS.find((e) => e.id === game.wardEvent.id);
  if (!wdef) return;
  const label = `⚠ ${langText(wdef.label.ko, wdef.label.en)} (${Math.ceil(game.wardEvent.timer)}s)`;
  ctx.save();
  ctx.font = "700 12px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillStyle = "rgba(10, 8, 20, 0.72)";
  const lw = ctx.measureText(label).width;
  ctx.fillRect(WIDTH / 2 - lw / 2 - 8, 4, lw + 16, 22);
  ctx.fillStyle = "rgba(212, 149, 255, 0.92)";
  ctx.textAlign = "center";
  ctx.fillText(label, WIDTH / 2, 20);
  ctx.restore();
}

function drawBackdrop() {
  ctx.drawImage(_backdropCache, 0, 0);
  if (!state.lowFx && state.runtime.danger > 0.18) {
    drawSpeedLines(state.runtime.danger * 0.14);
  }
}

function drawAtmosphere() {
  if (state.lowFx) {
    return;
  }
  const time = game.time;
  const danger = state.runtime.danger;

  ctx.save();
  for (let i = 0; i < 2; i += 1) {
    const y = 110 + i * 170 + Math.sin(time * 0.22 + i) * 18;
    const x = ((time * (18 + i * 6)) % (WIDTH + 340)) - 220;
    const fog = ctx.createLinearGradient(x, y, x + 260, y + 40);
    fog.addColorStop(0, "rgba(130, 176, 255, 0)");
    fog.addColorStop(0.5, `rgba(130, 176, 255, ${0.02 + danger * 0.02})`);
    fog.addColorStop(1, "rgba(130, 176, 255, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(x, y, 320, 54);
  }

  for (let i = 0; i < 10; i += 1) {
    const seed = i * 37.17;
    const px = ((time * (12 + (i % 5) * 4) + seed * 19) % (WIDTH + 80)) - 40;
    const py = 40 + ((seed * 53 + time * (6 + (i % 3))) % (HEIGHT - 80));
    const radius = 1.2 + (i % 3) * 0.7;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = i % 4 === 0 ? "rgba(255, 143, 182, 0.22)" : "rgba(173, 221, 255, 0.18)";
    ctx.fill();
  }
  ctx.restore();
}

function drawZones() {
  const ownedRoom = state.runtime.ownedRoom;
  const localOwnedRoom = ownedRoom && ownedRoom.floor === game.player.floor ? ownedRoom : null;
  const nearbyPrompt = state.runtime.prompt;

  for (const zone of world.zones) {
    if (zone.floor !== game.player.floor) {
      continue;
    }
    const isHall = zone.id === "hall" || zone.id === "upperHall";
    // 복도는 더 어둡고 파란색, 방은 약간 밝은 톤으로 구분
    ctx.fillStyle = isHall ? "#0d1320" : "#161d2e";
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

    if (isHall) {
      // 복도: 대각선 스트라이프 패턴
      ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
      for (let offset = -zone.h; offset < zone.w; offset += 34) {
        ctx.fillRect(zone.x + offset, zone.y, 4, zone.h);
      }
    } else {
      // 방: 미세한 그리드 패턴으로 복도와 구분
      ctx.fillStyle = "rgba(133, 186, 255, 0.025)";
      for (let gx = zone.x; gx < zone.x + zone.w; gx += 28) {
        ctx.fillRect(gx, zone.y, 1, zone.h);
      }
      for (let gy = zone.y; gy < zone.y + zone.h; gy += 28) {
        ctx.fillRect(zone.x, gy, zone.w, 1);
      }
    }
  }

  // 복도 테두리: 첫 번째 루프에 통합
  ctx.strokeStyle = "rgba(100, 150, 220, 0.22)";
  ctx.lineWidth = 1.5;
  for (const zone of world.zones) {
    if (zone.floor === game.player.floor) {
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
    }
  }

  for (const room of world.rooms) {
    if (room.floor !== game.player.floor) {
      continue;
    }
    const playerRoom = room.owner === "player";
    const isClaimable = !room.owner && nearbyPrompt?.type === "claim";

    // 소유 방: 바닥에 청록색 틴트 오버레이
    if (playerRoom) {
      ctx.fillStyle = "rgba(100, 200, 255, 0.07)";
      ctx.fillRect(room.x, room.y, room.w, room.h);
    }

    // 점거 가능한 방: 노란 틴트로 강조
    if (isClaimable) {
      ctx.fillStyle = `rgba(255, 220, 80, ${0.04 + Math.sin(game.time * 3) * 0.02})`;
      ctx.fillRect(room.x, room.y, room.w, room.h);
    }

    drawBedFixture(room.bed.x, room.bed.y, 1, playerRoom || nearbyPrompt?.type === "claim");
    drawAltarFixture(room.altar.x, room.altar.y, 1, localOwnedRoom?.id === room.id && nearbyPrompt?.type === "summon");
    drawTerminalFixture(room.terminal.x, room.terminal.y, 1, localOwnedRoom?.id === room.id && nearbyPrompt?.type === "intel");

    // 소유 방: 더 굵고 밝은 테두리 + 코너 마크
    if (playerRoom) {
      const pulse = 0.7 + Math.sin(game.time * 2.2) * 0.2;
      ctx.strokeStyle = `rgba(133, 216, 255, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(room.x + 3, room.y + 3, room.w - 6, room.h - 6);
      // 코너 강조
      const cs = 14;
      ctx.strokeStyle = "rgba(133, 216, 255, 1)";
      ctx.lineWidth = 3;
      [[room.x + 3, room.y + 3], [room.x + room.w - 3, room.y + 3],
       [room.x + 3, room.y + room.h - 3], [room.x + room.w - 3, room.y + room.h - 3]].forEach(([cx, cy], i) => {
        const dx = i % 2 === 0 ? 1 : -1;
        const dy = i < 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * cs);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * cs, cy);
        ctx.stroke();
      });
    } else if (isClaimable) {
      // 점거 가능: 점선 테두리
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = `rgba(255, 212, 80, ${0.5 + Math.sin(game.time * 3) * 0.2})`;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(room.x + 3, room.y + 3, room.w - 6, room.h - 6);
      ctx.restore();
    }

    if (room.breach) {
      const breachPulse = 0.3 + Math.abs(Math.sin(game.time * 6.5)) * 0.45;
      ctx.save();
      ctx.shadowColor = "#ff3060";
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(255, 60, 100, ${breachPulse})`;
      ctx.fillRect(room.x + room.w - 12, room.y + room.h / 2 - 32, 12, 64);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 방 이름: 더 크고 배경 칩과 함께
    const labelX = room.x + 12;
    const labelY = room.y + 20;
    ctx.font = `700 14px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif`;
    ctx.letterSpacing = "1px";
    if (playerRoom) {
      ctx.fillStyle = "rgba(10, 20, 40, 0.72)";
      ctx.fillRect(labelX - 4, labelY - 14, ctx.measureText(room.label.toUpperCase()).width + 10, 18);
      ctx.fillStyle = "#85d8ff";
    } else {
      ctx.fillStyle = "rgba(200, 220, 255, 0.7)";
    }
    ctx.fillText(room.label.toUpperCase(), labelX, labelY);

    // Room trait label
    if (room.trait) {
      const traitDef = ROOM_TRAITS.find((t) => t.id === room.trait);
      if (traitDef) {
        ctx.font = `700 11px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif`;
        ctx.letterSpacing = "0.5px";
        ctx.fillStyle = playerRoom ? "rgba(255, 220, 100, 0.95)" : "rgba(255, 200, 60, 0.72)";
        ctx.fillText(`${traitDef.icon} ${langText(traitDef.label.ko, traitDef.label.en)}`, labelX, labelY + 16);
      }
    }

    // 오브젝트 항상 레이블 표시
    const fixtureLabelStyle = "600 11px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.font = fixtureLabelStyle;
    ctx.letterSpacing = "0.5px";
    ctx.fillStyle = "rgba(180, 220, 255, 0.55)";
    ctx.fillText("BED", room.bed.x - 10, room.bed.y - 16);
    ctx.fillStyle = "rgba(255, 200, 150, 0.55)";
    ctx.fillText("ALTAR", room.altar.x - 14, room.altar.y - 16);
    ctx.fillStyle = "rgba(140, 240, 255, 0.55)";
    ctx.fillText("TERMINAL", room.terminal.x - 22, room.terminal.y - 16);
    ctx.letterSpacing = "";
  }

  if (world.generatorRoom.floor === game.player.floor) {
    drawGeneratorFixture(world.generator.x, world.generator.y, 1.05, nearbyPrompt?.type === "generator");
  }
  if (world.exitRoom.floor === game.player.floor) {
    drawCelOrb(world.exitRoom.x + 68, world.exitRoom.y + 70, 24, colors.exit, "#ddf5ff", 0.15);
  }

  for (const elevator of world.elevators) {
    if (elevator.floor !== game.player.floor) {
      continue;
    }
    drawElevatorFixture(elevator.x, elevator.y, 1, nearbyPrompt?.type === "elevator" && nearbyPrompt.elevator?.id === elevator.id);
  }

  if (game.anomaly && game.anomaly.floor === game.player.floor) {
    const pulse = 18 + Math.sin(game.time * 5.8) * 4;
    const anomalyTypeDef = ANOMALY_TYPES.find((t) => t.id === (game.anomaly.type || "seal_rift")) || ANOMALY_TYPES[0];
    const anomalyOrbColors = {
      seal_rift:    { core: "#7c45bf", highlight: "#f4dbff", ring1: "rgba(212, 149, 255, 0.28)", ring2: "rgba(255, 221, 111, 0.18)" },
      plague_nexus: { core: "#1a7a3c", highlight: "#b8ffda", ring1: "rgba(80, 220, 120, 0.28)",  ring2: "rgba(200, 255, 180, 0.18)" },
      void_drain:   { core: "#8a1a1a", highlight: "#ffd0d0", ring1: "rgba(255, 80, 80, 0.28)",   ring2: "rgba(255, 200, 100, 0.18)" },
    };
    const ac = anomalyOrbColors[anomalyTypeDef.id] || anomalyOrbColors.seal_rift;
    drawCelOrb(game.anomaly.x, game.anomaly.y, 14, ac.core, ac.highlight, 0.22);
    drawPulseRing(game.anomaly.x, game.anomaly.y, pulse, ac.ring1);
    drawPulseRing(game.anomaly.x, game.anomaly.y, pulse + 12, ac.ring2);
  }

  if (nearbyPrompt?.type === "claim" && nearbyPrompt.room) {
    drawWorldLabel(nearbyPrompt.room.bed.x, nearbyPrompt.room.bed.y - 34, langText("빈 침대: E로 점거", "Vacant Bed: press E"), "rgba(133, 216, 255, 0.95)");
  } else if (nearbyPrompt?.type === "abandon" && nearbyPrompt.room) {
    const abandonLabel = game.player.abandonPrompt === nearbyPrompt.room.id
      ? langText("침대: E로 포기 확인", "Bed: press E to confirm abandon")
      : langText("침대: E로 방 포기", "Bed: press E to abandon room");
    drawWorldLabel(nearbyPrompt.room.bed.x, nearbyPrompt.room.bed.y - 34, abandonLabel, "rgba(255, 180, 80, 0.95)");
  } else if (nearbyPrompt?.type === "summon" && nearbyPrompt.room) {
    drawWorldLabel(nearbyPrompt.room.altar.x, nearbyPrompt.room.altar.y - 32, langText("제단: E로 소환", "Altar: press E"), "rgba(255, 199, 143, 0.95)");
  } else if (nearbyPrompt?.type === "intel" && nearbyPrompt.room) {
    drawWorldLabel(nearbyPrompt.room.terminal.x, nearbyPrompt.room.terminal.y - 32, langText("단말: E로 정보 구매", "Terminal: press E"), "rgba(143, 232, 255, 0.95)");
  } else if (nearbyPrompt?.type === "generator") {
    drawWorldLabel(world.generator.x, world.generator.y - 44, langText("발전기: E 유지", "Generator: hold E"), "rgba(255, 232, 141, 0.95)");
  } else if (nearbyPrompt?.type === "elevator" && nearbyPrompt.elevator) {
    drawWorldLabel(
      nearbyPrompt.elevator.x,
      nearbyPrompt.elevator.y - 34,
      langText(
        nearbyPrompt.elevator.destinationFloor === "f2" ? "엘리베이터: 2층" : "엘리베이터: 1층",
        nearbyPrompt.elevator.destinationFloor === "f2" ? "Elevator: Floor 2" : "Elevator: Floor 1",
      ),
      "rgba(218, 222, 255, 0.95)",
    );
  } else if (nearbyPrompt?.type === "escape") {
    const gate = world.exitRoom.gate;
    const gx = gate.x + gate.w / 2;
    const gy = gate.y - 20;
    drawWorldLabel(gx, gy, langText("탈출구: E 유지 (3초)", "Gate: hold E (3s)"), "rgba(133, 216, 255, 0.95)");
  } else if (nearbyPrompt?.type === "medic") {
    drawWorldLabel(nearbyPrompt.room.altar.x, nearbyPrompt.room.altar.y - 32, langText("제단: E 응급 치료 (60골드)", "Altar: E field medic (60g)"), "rgba(255, 230, 100, 0.95)");
  } else if (nearbyPrompt?.type === "breach_seal") {
    drawWorldLabel(nearbyPrompt.room.terminal.x, nearbyPrompt.room.terminal.y - 32, langText("단말: E 균열 봉쇄 (90골드)", "Terminal: E seal breach (90g)"), "rgba(143, 255, 220, 0.95)");
  }

  // Generator repair progress bar
  if (game.player.holdingRepair > 0 && nearbyPrompt?.type === "generator") {
    const repairDuration = 2.2 * game.runProfile.modifiers.repairDurationMultiplier;
    const pct = Math.min(1, game.player.holdingRepair / repairDuration);
    const barX = world.generator.x - 30;
    const barY = world.generator.y - 22;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(barX, barY, 60, 6);
    ctx.fillStyle = `rgba(255, 232, 141, ${0.7 + pct * 0.3})`;
    ctx.fillRect(barX, barY, 60 * pct, 6);
  }

  // Escape progress bar
  if (game.player.holdingEscape > 0 && nearbyPrompt?.type === "escape") {
    const gate = world.exitRoom.gate;
    const barX = gate.x - 10;
    const barY = gate.y - 10;
    const barW = gate.w + 20;
    const pct = Math.min(1, game.player.holdingEscape / 5.0);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(barX, barY, barW, 6);
    ctx.fillStyle = `rgba(133, 216, 255, ${0.7 + pct * 0.3})`;
    ctx.fillRect(barX, barY, barW * pct, 6);
  }

}

function roundedRectPath(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBedFixture(x, y, scale = 1, highlight = false) {
  const w = 48 * scale;
  const h = 26 * scale;
  drawShadow(x, y + 18 * scale, 34 * scale, 0.2);

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(122, 84, 61, 0.95)";
  ctx.fillRect(-w / 2 - 2, -h / 2 + 3, 6, h - 2);
  ctx.fillRect(w / 2 - 4, -h / 2 + 3, 6, h - 2);
  ctx.fillRect(-w / 2 - 2, h / 2 - 1, w + 4, 5);

  roundedRectPath(-w / 2, -h / 2, w, h, 7 * scale);
  ctx.fillStyle = "#dde9f3";
  ctx.fill();
  ctx.strokeStyle = highlight ? "rgba(133, 216, 255, 0.95)" : "rgba(34, 47, 61, 0.9)";
  ctx.lineWidth = 2.4;
  ctx.stroke();

  roundedRectPath(-w / 2 + 2, -h / 2 + 8, w - 4, h - 10, 6 * scale);
  ctx.fillStyle = "#77b6df";
  ctx.fill();

  roundedRectPath(-w / 2 + 5, -h / 2 + 2, 16 * scale, 9 * scale, 4 * scale);
  ctx.fillStyle = "#f5fbff";
  ctx.fill();

  if (highlight) {
    drawPulseRing(0, 0, 30 * scale + Math.sin(game.time * 4) * 2, "rgba(133, 216, 255, 0.26)");
  }
  ctx.restore();
}

function drawAltarFixture(x, y, scale = 1, highlight = false) {
  drawShadow(x, y + 14 * scale, 28 * scale, 0.18);
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#3d2a25";
  ctx.beginPath();
  ctx.moveTo(0, -22 * scale);
  ctx.lineTo(22 * scale, -6 * scale);
  ctx.lineTo(15 * scale, 18 * scale);
  ctx.lineTo(-15 * scale, 18 * scale);
  ctx.lineTo(-22 * scale, -6 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = highlight ? "rgba(255, 204, 157, 0.95)" : "rgba(27, 18, 17, 0.95)";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 182, 129, 0.78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10 * scale, -2 * scale);
  ctx.lineTo(0, -12 * scale);
  ctx.lineTo(10 * scale, -2 * scale);
  ctx.lineTo(0, 10 * scale);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "#ffd1ab";
  ctx.beginPath();
  ctx.arc(0, -10 * scale, 4.5 * scale + Math.sin(game.time * 5) * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTerminalFixture(x, y, scale = 1, highlight = false) {
  drawShadow(x, y + 14 * scale, 26 * scale, 0.18);
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#202f39";
  roundedRectPath(-17 * scale, -20 * scale, 34 * scale, 28 * scale, 5 * scale);
  ctx.fill();
  ctx.strokeStyle = highlight ? "rgba(143, 232, 255, 0.98)" : "rgba(16, 20, 28, 0.96)";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = "#8cecff";
  roundedRectPath(-12 * scale, -15 * scale, 24 * scale, 14 * scale, 3 * scale);
  ctx.fill();

  ctx.fillStyle = "rgba(140, 236, 255, 0.22)";
  ctx.fillRect(-9 * scale, 3 * scale, 18 * scale, 3 * scale);
  ctx.fillRect(-2 * scale, 8 * scale, 4 * scale, 11 * scale);

  ctx.strokeStyle = "rgba(178, 246, 255, 0.85)";
  ctx.beginPath();
  ctx.moveTo(-8 * scale, -8 * scale);
  ctx.lineTo(0, -4 * scale);
  ctx.lineTo(8 * scale, -8 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawGeneratorFixture(x, y, scale = 1, highlight = false) {
  drawShadow(x, y + 22 * scale, 42 * scale, 0.24);
  ctx.save();
  ctx.translate(x, y);

  roundedRectPath(-34 * scale, -24 * scale, 68 * scale, 48 * scale, 8 * scale);
  ctx.fillStyle = "#5e6240";
  ctx.fill();
  ctx.strokeStyle = highlight ? "rgba(255, 233, 140, 0.98)" : "rgba(29, 31, 16, 0.95)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#1b2216";
  roundedRectPath(-24 * scale, -14 * scale, 24 * scale, 18 * scale, 4 * scale);
  ctx.fill();
  ctx.fillStyle = "#ffef8c";
  ctx.fillRect(8 * scale, -12 * scale, 12 * scale, 8 * scale);
  ctx.fillStyle = "#d0e870";
  ctx.fillRect(8 * scale, 0, 18 * scale, 10 * scale);

  ctx.strokeStyle = "rgba(255, 244, 180, 0.78)";
  ctx.beginPath();
  ctx.moveTo(-12 * scale, -30 * scale);
  ctx.lineTo(-4 * scale, -24 * scale);
  ctx.lineTo(-10 * scale, -18 * scale);
  ctx.moveTo(8 * scale, -30 * scale);
  ctx.lineTo(16 * scale, -24 * scale);
  ctx.lineTo(10 * scale, -18 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawElevatorFixture(x, y, scale = 1, highlight = false) {
  const pulse = Math.sin(game.time * 3.8) * 1.2;
  drawShadow(x, y + 14 * scale, 28 * scale, 0.18);
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = highlight ? "rgba(215, 221, 255, 0.98)" : "rgba(160, 169, 218, 0.72)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 20 * scale + pulse, 0, Math.PI * 2);
  ctx.stroke();

  roundedRectPath(-14 * scale, -14 * scale, 28 * scale, 28 * scale, 5 * scale);
  ctx.fillStyle = "#383850";
  ctx.fill();
  ctx.strokeStyle = "rgba(221, 245, 255, 0.55)";
  ctx.stroke();

  ctx.fillStyle = "#eff6ff";
  ctx.beginPath();
  ctx.moveTo(0, -7 * scale);
  ctx.lineTo(7 * scale, 3 * scale);
  ctx.lineTo(3 * scale, 3 * scale);
  ctx.lineTo(3 * scale, 8 * scale);
  ctx.lineTo(-3 * scale, 8 * scale);
  ctx.lineTo(-3 * scale, 3 * scale);
  ctx.lineTo(-7 * scale, 3 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWorldLabel(x, y, text, color) {
  ctx.save();
  ctx.font = "700 12px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  const width = ctx.measureText(text).width + 18;
  roundedRectPath(x - width / 2, y - 12, width, 22, 10);
  ctx.fillStyle = "rgba(10, 14, 24, 0.86)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#f7fbff";
  ctx.fillText(text, x - width / 2 + 9, y + 3);
  ctx.restore();
}

function drawKeycards() {
  for (const keycard of world.keycards) {
    if (!keycard.visible || keycard.collected || keycard.floor !== game.player.floor) {
      continue;
    }
    drawDiamond(keycard.x, keycard.y, 12, "#ffd36b");
    ctx.strokeStyle = "rgba(255, 243, 184, 0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(keycard.x - 10, keycard.y - 10, 20, 20);
  }
}

function drawUnits() {
  for (const unit of game.units) {
    if (unit.floor !== game.player.floor) {
      continue;
    }
    const color = colors[unit.type];
    const bob = Math.sin(game.time * 2.8 + unit.x * 0.02 + unit.y * 0.01) * 3;
    const radius = unit.type === "relic" ? 13 : 11;
    drawShadow(unit.x, unit.y + 12, radius + 6, 0.18);
    drawCelOrb(unit.x, unit.y + bob, radius, color, "#ffffff", unit.type === "relic" ? 0.28 : 0.14);
    if (unit.role === "anchor") {
      drawPulseRing(unit.x, unit.y + bob, radius + 8, "rgba(133, 216, 255, 0.14)");
    } else if (unit.role === "interceptor") {
      drawPulseRing(unit.x, unit.y + bob, radius + 6 + Math.sin(game.time * 6 + unit.x) * 1.5, "rgba(185, 239, 170, 0.14)");
    }
    if (unit.type === "relic") {
      drawPulseRing(unit.x, unit.y + bob, 16 + Math.sin(game.time * 3.6 + unit.x) * 1.5, "rgba(212, 149, 255, 0.18)");
    }
  }
}

function drawActors() {
  drawCharacter(game.player, "player");
  if (game.hunter.floor === game.player.floor) {
    drawCharacter(game.hunter, "hunter");
  }

  for (const hider of game.hiders) {
    if (!hider.alive || hider.floor !== game.player.floor) {
      continue;
    }
    drawCharacter(hider, "hider");
  }

  for (const enemy of game.infected) {
    if (enemy.floor !== game.player.floor) {
      continue;
    }
    drawCharacter(enemy, "infected");
  }
}

function drawDoors() {
  for (const room of world.rooms) {
    if (room.floor !== game.player.floor) {
      continue;
    }
    const hpPct = clamp(room.door.hp / room.door.maxHp, 0, 1);
    const shake = room.door.closed && hpPct < 0.45 ? Math.sin(game.time * 22 + room.door.centerX) * (1 - hpPct) * 2.5 : 0;
    ctx.save();
    ctx.translate(shake, 0);
    ctx.fillStyle = room.door.closed && !room.door.broken ? colors.door : colors.doorOpen;
    ctx.fillRect(room.door.x, room.door.y, room.door.w, room.door.h);
    if (room.door.closed && !room.door.broken) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      for (let offset = -6; offset < room.door.w + 6; offset += 8) {
        ctx.fillRect(room.door.x + offset, room.door.y, 3, room.door.h);
      }
    }
    if (room.owner) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(room.door.x, room.door.y - 12, room.door.w, 6);
      ctx.fillStyle = room.door.curse ? "#ff77a8" : "#8fe9c7";
      ctx.fillRect(room.door.x, room.door.y - 12, room.door.w * hpPct, 6);
    }
    ctx.restore();

    // Door thorns: golden shimmer overlay
    if (room.door.thorns && room.door.closed) {
      const shimmer = 0.18 + Math.abs(Math.sin(game.time * 3.4 + room.door.centerX * 0.05)) * 0.18;
      ctx.save();
      ctx.globalAlpha = shimmer;
      ctx.fillStyle = "#ffd84a";
      ctx.fillRect(room.door.x, room.door.y, room.door.w, room.door.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(255, 215, 60, ${0.55 + shimmer})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(room.door.x - 1, room.door.y - 1, room.door.w + 2, room.door.h + 2);
      ctx.restore();
    }

    // Door curse: pulsing crimson aura
    if (room.door.curse && room.door.closed) {
      const pulse = 0.25 + Math.abs(Math.sin(game.time * 4.5 + room.door.centerX * 0.04)) * 0.28;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#8b0026";
      ctx.fillRect(room.door.x - 3, room.door.y - 3, room.door.w + 6, room.door.h + 6);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `rgba(220, 40, 80, ${0.5 + pulse * 0.6})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(room.door.x - 2, room.door.y - 2, room.door.w + 4, room.door.h + 4);
      ctx.restore();
    }
  }

  if (world.exitRoom.floor === game.player.floor) {
    const gate = world.exitRoom.gate;
    if (gate.closed) {
      ctx.fillStyle = "#634646";
      ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
    } else {
      const openPulse = 0.72 + Math.sin(game.time * 2.6) * 0.18;
      ctx.save();
      ctx.shadowColor = "#3dffce";
      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(61, 110, 99, ${openPulse})`;
      ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
      ctx.strokeStyle = `rgba(80, 230, 180, ${openPulse * 0.8})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(gate.x - 1, gate.y - 1, gate.w + 2, gate.h + 2);
      ctx.restore();
    }
  }
}

function drawLighting() {
  const danger = state.runtime.danger;
  if (state.lowFx) {
    ctx.save();
    const alpha = game.blackoutActive ? 0.76 : 0.44 + danger * 0.1;
    ctx.fillStyle = `rgba(3, 5, 11, ${alpha})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalCompositeOperation = "destination-out";
    const screenPlayer = worldToScreen(game.player);
    ctx.beginPath();
    ctx.arc(screenPlayer.x, screenPlayer.y, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.save();
  const blackoutWarning = !game.blackoutActive && game.blackoutWarning;
  const warningIntensity = blackoutWarning ? Math.max(0, 1 - game.blackoutTimer / 18) : 0;
  const flicker = game.blackoutActive
    ? 0.06 + Math.sin(game.time * 17) * 0.03
    : blackoutWarning
      ? Math.abs(Math.sin(game.time * (15 + warningIntensity * 25))) * warningIntensity * 0.10
      : Math.sin(game.time * 4.2) * 0.01;
  ctx.fillStyle = game.blackoutActive
    ? `rgba(3, 4, 10, ${0.80 + danger * 0.08 + flicker})`
    : `rgba(2, 4, 9, ${0.50 + danger * 0.08 + flicker + warningIntensity * 0.06})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalCompositeOperation = "destination-out";

  const screenPlayer = worldToScreen(game.player);
  const playerLightRadius = 230 + Math.sin(game.time * 5.4) * 8;
  const playerLight = ctx.createRadialGradient(screenPlayer.x, screenPlayer.y, 0, screenPlayer.x, screenPlayer.y, playerLightRadius);
  playerLight.addColorStop(0, "rgba(0, 0, 0, 1)");
  playerLight.addColorStop(0.55, "rgba(0, 0, 0, 0.88)");
  playerLight.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = playerLight;
  ctx.beginPath();
  ctx.arc(screenPlayer.x, screenPlayer.y, playerLightRadius, 0, Math.PI * 2);
  ctx.fill();

  if (!game.blackoutActive) {
    const ownedRoom = state.runtime.ownedRoom;
    if (ownedRoom && ownedRoom.floor === game.player.floor) {
      const roomCenter = worldToScreen({ x: ownedRoom.x + ownedRoom.w / 2, y: ownedRoom.y + ownedRoom.h / 2 });
      const roomRadius = 200 + Math.sin(game.time * 2.5) * 8;
      const roomLight = ctx.createRadialGradient(
        roomCenter.x,
        roomCenter.y,
        30,
        roomCenter.x,
        roomCenter.y,
        roomRadius,
      );
      roomLight.addColorStop(0, "rgba(0, 0, 0, 0.72)");
      roomLight.addColorStop(0.6, "rgba(0, 0, 0, 0.45)");
      roomLight.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = roomLight;
      ctx.beginPath();
      ctx.arc(roomCenter.x, roomCenter.y, roomRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (game.radarTime > 0) {
    for (const enemy of [game.hunter, ...game.infected]) {
      if (enemy.floor !== game.player.floor) {
        continue;
      }
      const screenEnemy = worldToScreen(enemy);
      ctx.beginPath();
      ctx.arc(screenEnemy.x, screenEnemy.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fill();
    }
  }

  ctx.restore();

  if (danger > 0.15) {
    const vignette = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 180, WIDTH / 2, HEIGHT / 2, WIDTH * 0.65);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, `rgba(255, 52, 110, ${danger * 0.22})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Blackout pre-warning: amber vignette pulse
  if (blackoutWarning && warningIntensity > 0.1) {
    const ambVig = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 200, WIDTH / 2, HEIGHT / 2, WIDTH * 0.7);
    ambVig.addColorStop(0, "rgba(0, 0, 0, 0)");
    ambVig.addColorStop(1, `rgba(255, 180, 40, ${warningIntensity * 0.14 * Math.abs(Math.sin(game.time * 4))})`);
    ctx.fillStyle = ambVig;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

function drawHudMap() {
  const panel = { x: 1020, y: 22, w: 316, h: 184 };
  ctx.fillStyle = "rgba(8, 13, 22, 0.78)";
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.strokeStyle = "rgba(155, 200, 255, 0.22)";
  ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

  ctx.fillStyle = "rgba(231, 239, 255, 0.82)";
  ctx.font = "700 14px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(langText("지도 조각", "Map Fragments"), panel.x + 16, panel.y + 24);

  const mapScale = Math.min((panel.w - 28) / worldBounds.w, (panel.h - 46) / worldBounds.h);
  const ox = panel.x + 12;
  const oy = panel.y + 34;
  const revealTier = game.fragments >= 6 ? 3 : game.fragments >= 4 ? 2 : game.fragments >= 2 ? 1 : 0;
  const ownedRoomId = getOwnedRoom()?.id;

  const floorZones = world.zones.filter((z) => z.floor === game.player.floor);
  for (const zone of floorZones) {
    const isKnown = revealTier === 3
      || (revealTier === 2 && zone.id !== "exit")
      || (revealTier === 1 && (zone.id === "hall" || zone.id === "generator" || zone.id === ownedRoomId))
      || zone.id === ownedRoomId || zone.id === "hall";
    ctx.fillStyle = isKnown ? "rgba(112, 139, 133, 0.6)" : "rgba(55, 65, 75, 0.3)";
    ctx.fillRect(
      ox + (zone.x - worldBounds.minX) * mapScale,
      oy + (zone.y - worldBounds.minY) * mapScale,
      zone.w * mapScale,
      zone.h * mapScale,
    );
  }

  ctx.fillStyle = "#dbece1";
  ctx.beginPath();
  ctx.arc(
    ox + (game.player.x - worldBounds.minX) * mapScale,
    oy + (game.player.y - worldBounds.minY) * mapScale,
    4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  if (game.radarTime > 0) {
    ctx.fillStyle = "#ff7e7e";
    for (const enemy of [game.hunter, ...game.infected]) {
      if (enemy.floor !== game.player.floor) {
        continue;
      }
      ctx.beginPath();
      ctx.arc(
        ox + (enemy.x - worldBounds.minX) * mapScale,
        oy + (enemy.y - worldBounds.minY) * mapScale,
        3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  if (game.anomaly && game.anomaly.floor === game.player.floor) {
    ctx.fillStyle = "#d495ff";
    ctx.beginPath();
    ctx.arc(
      ox + (game.anomaly.x - worldBounds.minX) * mapScale,
      oy + (game.anomaly.y - worldBounds.minY) * mapScale,
      4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  if (game.compassTime > 0) {
    // Point to nearest uncollected visible sigil on any floor, or to exit gate
    const targetSigil =
      world.keycards.find((k) => k.visible && !k.collected && k.floor === game.player.floor) ||
      world.keycards.find((k) => k.visible && !k.collected);
    const gate = world.exitRoom.gate;
    const sigilOnOtherFloor = targetSigil && targetSigil.floor !== game.player.floor;
    const targetX = targetSigil ? targetSigil.x : gate.x + gate.w / 2;
    const targetY = targetSigil ? targetSigil.y : gate.y + gate.h / 2;
    const label = targetSigil
      ? sigilOnOtherFloor ? langText("시질(다른층)", "Sigil(↕)") : langText("시질", "Sigil")
      : langText("탈출", "Exit");
    const arrowColor = targetSigil ? "#8fe9c7" : "#ffd36b";
    const angle = Math.atan2(targetY - game.player.y, targetX - game.player.x);
    const cx = panel.x + panel.w - 41;
    const cy = panel.y + 42;
    const arrowLen = 17;
    const tipX = cx + Math.cos(angle) * arrowLen;
    const tipY = cy + Math.sin(angle) * arrowLen;
    const headA = 0.42;
    ctx.save();
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX - Math.cos(angle - headA) * 8, tipY - Math.sin(angle - headA) * 8);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - Math.cos(angle + headA) * 8, tipY - Math.sin(angle + headA) * 8);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = arrowColor;
    ctx.fillText(label, panel.x + panel.w - 58, panel.y + 72);
  }
}

function drawMessageOverlay() {
  if (game.phase === "running") {
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(5, 8, 9, 0.72)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = game.phase === "escaped" ? "#8fe9c7" : "#ff8a8a";
  ctx.font = "700 52px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(game.phase === "escaped" ? langText("탈출 성공", "You Escaped") : langText("런 실패", "Run Failed"), WIDTH / 2, HEIGHT / 2 - 60);
  ctx.fillStyle = "#e7efe8";
  ctx.font = "700 18px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(state.outcomeText || "", WIDTH / 2, HEIGHT / 2 - 26);

  // Run stats panel
  const panelW = 540;
  const panelH = 140;
  const panelX = WIDTH / 2 - panelW / 2;
  const panelY = HEIGHT / 2 - 10;
  const accentColor = game.phase === "escaped" ? "rgba(133, 216, 255, 0.45)" : "rgba(255, 100, 130, 0.45)";
  ctx.fillStyle = "rgba(10, 16, 28, 0.88)";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX, panelY, panelW, panelH);
  // Corner marks
  const cs = 14;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = accentColor;
  [[panelX, panelY, 1, 1], [panelX + panelW, panelY, -1, 1], [panelX, panelY + panelH, 1, -1], [panelX + panelW, panelY + panelH, -1, -1]].forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(cx + dx * cs, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * cs); ctx.stroke();
  });

  ctx.font = "600 13px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillStyle = "rgba(200, 225, 255, 0.68)";
  const stats = game.stats || {};
  const statLines = [
    [langText("경과 시간", "Time"), formatTime(game.time)],
    [langText("골드 최대", "Peak Gold"), `${Math.floor(stats.peakGold || 0)} g`],
    [langText("감염체 처치", "Infected Kills"), String(stats.infectedKills || 0)],
    [langText("문 강화", "Reinforces"), String(stats.reinforceDone || 0)],
    [langText("정보 구매", "Intel Buys"), String(stats.intelPurchases || 0)],
    [langText("계약 완료", "Contracts"), String(stats.contractsCompleted || 0)],
  ];
  const colW = panelW / 3;
  statLines.forEach(([label, val], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = panelX + 18 + col * colW;
    const y = panelY + 28 + row * 44;
    ctx.fillStyle = "rgba(160, 200, 255, 0.5)";
    ctx.font = "500 11px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x, y);
    ctx.fillStyle = "#e7eff8";
    ctx.font = "700 16px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.fillText(val, x, y + 18);
  });

  ctx.textAlign = "center";
  ctx.font = "600 14px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillStyle = "rgba(231, 239, 248, 0.65)";
  ctx.fillText(langText("다시 시작을 눌러 새 런을 시작하세요.", "Press Restart Run to begin again."), WIDTH / 2, panelY + 150);

  if (game.phase === "failed") {
    const hint = getDeathHint();
    ctx.fillStyle = "rgba(255, 210, 100, 0.72)";
    ctx.font = "500 12px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.fillText(`▶ ${hint}`, WIDTH / 2, panelY + 172);
  }
  ctx.restore();
}

function getDeathHint() {
  const stats = game.stats || {};
  const src = game.player.lastDamageSource;
  if (src === "hunter" && (stats.reinforceDone || 0) < 2) {
    return langText("문을 자주 강화하면(R) 술래가 방으로 들어오기 어려워집니다.", "Reinforce your door often (R) to slow the hunter's entry.");
  }
  if (src === "infected" && game.units.filter((u) => u.ownerId === "player").length === 0) {
    return langText("제단에서 가디언을 소환하면 감염체를 자동으로 처치합니다.", "Summon guardians at the altar — they automatically fight infected.");
  }
  if (game.fragments < 3) {
    return langText("단말기 정보 구매를 우선하면 탈출 진행이 크게 빨라집니다.", "Prioritize terminal intel to speed up your escape progress.");
  }
  if (game.player.hp <= 0 && game.time < 90) {
    return langText("게임 초반에는 술래를 피해 방 위치를 먼저 파악하세요.", "Early game: scout room locations before engaging threats.");
  }
  if ((stats.contractsCompleted || 0) === 0) {
    return langText("계약을 완료하면 골드와 단편을 추가로 획득할 수 있습니다.", "Completing contracts earns bonus gold and map fragments.");
  }
  return langText("응급 키트(제단, 50골드)와 미끼 신호(단말기, 70골드)를 활용하세요.", "Use Emergency Kit (altar, 50g) and Decoy Signal (terminal, 70g).");
}

function drawCircle(x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawDiamond(x, y, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawCelOrb(x, y, radius, fill, rim, glow) {
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.drawImage(_glowCanvas, x - radius * 2.3, y - radius * 2.3, radius * 4.6, radius * 4.6);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(20, 23, 34, 0.95)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x - radius * 0.22, y - radius * 0.25, radius * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.globalAlpha = 0.34;
  ctx.fill();
  ctx.restore();
}

function drawCharacter(entity, kind) {
  const infectedType = kind === "infected" ? entity.type || "infected" : null;
  const palette = {
    player: { fill: colors.player, rim: "#ffffff", glow: 0.28, accent: "#85d8ff" },
    hunter: { fill: colors.hunter, rim: "#ffd0d8", glow: 0.3, accent: "#ff6f95" },
    hider: { fill: colors.hider, rim: "#ffffff", glow: 0.12, accent: "#85d8ff" },
    infected:
      infectedType === "wisp"
        ? (game.wardEvent?.id === "blood_moon" ? { fill: "#c84444", rim: "#ffd0d0", glow: 0.38, accent: "#ff8080" } : { fill: "#8e6cff", rim: "#efe4ff", glow: 0.24, accent: "#d3c0ff" })
        : infectedType === "brute"
          ? (game.wardEvent?.id === "blood_moon" ? { fill: "#8b1a1a", rim: "#ffaaaa", glow: 0.44, accent: "#ff5555" } : { fill: "#b94f4f", rim: "#ffd3c5", glow: 0.22, accent: "#ffb078" })
          : (game.wardEvent?.id === "blood_moon" ? { fill: "#aa2222", rim: "#ffcccc", glow: 0.36, accent: "#ff6666" } : { fill: colors.infected, rim: "#ffd6b5", glow: 0.16, accent: "#ffb464" }),
  }[kind];

  const radius = entity.radius || (kind === "hider" ? 11 : 10);
  const phaseSeed = (entity.x + entity.y + radius * 13) * 0.01;
  const bob = Math.sin(game.time * (kind === "hunter" ? 4.4 : 5.2) + phaseSeed) * (kind === "hunter" ? 2.6 : 2.2);
  const breath = 1 + Math.sin(game.time * (kind === "hunter" ? 2.6 : 3.4) + phaseSeed) * 0.045;
  const drawX = entity.x;
  const drawY = entity.y + bob;

  drawShadow(drawX, drawY + radius + 8, radius + (kind === "hunter" ? 10 : 6), kind === "hunter" ? 0.26 : 0.18);

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.scale(breath, 1 / breath);
  drawCelOrb(0, 0, radius, palette.fill, palette.rim, palette.glow);
  ctx.restore();

  if (kind === "player") {
    ctx.save();
    ctx.strokeStyle = "rgba(133, 216, 255, 1)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(drawX, drawY, radius + 13 + Math.sin(game.time * 3.8) * 1.8, 0, Math.PI * 2);
    ctx.stroke();
    drawPulseRing(drawX, drawY, radius + 22 + Math.sin(game.time * 4.8) * 2, "rgba(133, 216, 255, 0.28)");
    if (entity.spawnShield > 0) {
      drawPulseRing(drawX, drawY, radius + 24 + Math.sin(game.time * 7.2) * 2, "rgba(255, 221, 111, 0.18)");
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 16px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.fillText(t("player_tag"), drawX - 16, drawY - radius - 20);
    ctx.beginPath();
    ctx.moveTo(drawX, drawY - radius - 18);
    ctx.lineTo(drawX - 8, drawY - radius - 34);
    ctx.lineTo(drawX + 8, drawY - radius - 34);
    ctx.closePath();
    ctx.fillStyle = entity.spawnShield > 0 ? "#ffd46d" : "#85d8ff";
    ctx.fill();
    ctx.restore();
  } else if (kind === "hunter") {
    drawPulseRing(drawX, drawY, radius + 16 + Math.sin(game.time * 6.4) * 2, "rgba(255, 92, 132, 0.12)");
    // Charge telegraph: expanding crimson ring
    if (game.hunter.charging) {
      const chargeProgress = 1 - game.hunter.chargeTimer / 0.45;
      const ringR = radius + 8 + chargeProgress * 22;
      // Outer glow ring
      ctx.strokeStyle = `rgba(255, 40, 80, ${(0.9 - chargeProgress * 0.4) * 0.38})`;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(drawX, drawY, ringR, 0, Math.PI * 2);
      ctx.stroke();
      // Inner crisp ring
      ctx.strokeStyle = `rgba(255, 40, 80, ${0.9 - chargeProgress * 0.4})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(drawX, drawY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.scale(breath, 1 / breath);
  ctx.strokeStyle = "rgba(18, 18, 28, 0.95)";
  ctx.lineWidth = 2.5;
  ctx.fillStyle = palette.accent;

  if (kind === "player") {
    ctx.beginPath();
    ctx.moveTo(0, -radius - 4);
    ctx.lineTo(radius * 0.95, radius * 0.45);
    ctx.lineTo(0, radius * 0.1);
    ctx.lineTo(-radius * 0.95, radius * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "hunter") {
    ctx.beginPath();
    ctx.moveTo(-radius * 0.8, -radius * 0.85);
    ctx.lineTo(0, -radius * 0.15);
    ctx.lineTo(radius * 0.8, -radius * 0.85);
    ctx.lineTo(radius * 0.36, radius * 0.9);
    ctx.lineTo(-radius * 0.36, radius * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "infected") {
    if (infectedType === "wisp") {
      ctx.beginPath();
      ctx.moveTo(0, -radius * 1.15);
      ctx.lineTo(radius * 0.82, 0);
      ctx.lineTo(0, radius * 0.68);
      ctx.lineTo(-radius * 0.82, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (infectedType === "brute") {
      ctx.fillRect(-radius * 0.75, -radius * 0.82, radius * 1.5, radius * 1.6);
      ctx.strokeRect(-radius * 0.75, -radius * 0.82, radius * 1.5, radius * 1.6);
    } else {
      ctx.beginPath();
      ctx.moveTo(-radius * 0.75, -radius * 0.2);
      ctx.lineTo(0, -radius);
      ctx.lineTo(radius * 0.75, -radius * 0.2);
      ctx.lineTo(radius * 0.25, radius * 0.95);
      ctx.lineTo(-radius * 0.25, radius * 0.95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.9, 0);
    ctx.lineTo(0, radius * 0.9);
    ctx.lineTo(-radius * 0.9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawShadow(x, y, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(_shadowCanvas, x - radius, y - radius * 0.42, radius * 2, radius * 0.84);
  ctx.restore();
}

function drawPulseRing(x, y, radius, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawThreatOverlay() {
  const danger = state.runtime.danger;
  if (
    danger < 0.12 &&
    game.suppressionTime <= 0 &&
    game.floorHazards.powerSurge <= 0 &&
    game.floorHazards.archiveLock <= 0
  ) {
    return;
  }

  const alpha = clamp(
    danger * 0.55 +
      (game.suppressionTime > 0 ? 0.18 : 0) +
      (game.floorHazards.archiveLock > 0 ? 0.12 : 0) +
      (game.floorHazards.powerSurge > 0 ? 0.1 : 0),
    0,
    0.55,
  );
  const pulse = 1 + Math.sin(game.time * 8) * 0.08;
  ctx.fillStyle =
    game.suppressionTime > 0 || game.floorHazards.archiveLock > 0
      ? `rgba(187, 122, 255, ${alpha})`
      : `rgba(255, 62, 116, ${alpha})`;
  ctx.fillRect(24, HEIGHT - 72, 240 * pulse, 28);
  ctx.fillStyle = "#fff3f8";
  ctx.font = "700 16px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  const label = game.suppressionTime > 0
    ? langText("억제 장막", "SUPPRESSION FIELD")
    : game.floorHazards.archiveLock > 0
      ? langText("아카이브 봉쇄", "ARCHIVE LOCK")
      : game.floorHazards.powerSurge > 0
        ? langText("전력 폭주", "POWER SURGE")
    : game.blackoutActive
      ? langText("정전 경보", "BLACKOUT ALERT")
      : langText("위협 상승", "THREAT RISING");
  ctx.fillText(label, 38, HEIGHT - 50);
}

function drawBanner() {
  if (!state.banner) {
    return;
  }

  const palette = effectPalette(state.banner.color);
  const alpha = Math.min(1, state.banner.life / state.banner.maxLife * 1.4);
  const progress = 1 - state.banner.life / state.banner.maxLife;
  const width = 560;
  const height = 96;
  const x = WIDTH / 2 - width / 2;
  const y = 56 + Math.sin(progress * Math.PI) * 8;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(10, 14, 24, 0.88)";
  ctx.beginPath();
  ctx.moveTo(x, y + 16);
  ctx.lineTo(x + 18, y);
  ctx.lineTo(x + width - 18, y);
  ctx.lineTo(x + width, y + 16);
  ctx.lineTo(x + width, y + height - 16);
  ctx.lineTo(x + width - 18, y + height);
  ctx.lineTo(x + 18, y + height);
  ctx.lineTo(x, y + height - 16);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = palette.main;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = palette.main;
  ctx.fillRect(x + 18, y + 12, 150, 8);
  ctx.fillStyle = "#f4f7ff";
  ctx.font = "700 28px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(state.banner.title.toUpperCase(), x + 22, y + 48);
  ctx.fillStyle = "rgba(244, 247, 255, 0.78)";
  ctx.font = "600 15px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(state.banner.subtitle, x + 22, y + 74);
  ctx.restore();
}

function drawFlashOverlay() {
  if (!state.flash) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = state.flash.alpha;
  ctx.fillStyle = state.flash.color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();
}

function drawSpeedLines(alpha) {
  if (alpha <= 0.01) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i += 1) {
    const x = ((i * 41) + game.time * 40) % (WIDTH + 240) - 120;
    ctx.beginPath();
    ctx.moveTo(x, -20);
    ctx.lineTo(x - 120, HEIGHT + 20);
    ctx.stroke();
  }
  ctx.restore();
}

function dangerLevel() {
  const localInfectedCount = game.infected.filter((enemy) => enemy.floor === game.player.floor).length;
  let level = 0;
  level += game.blackoutActive ? 0.38 : 0;
  level += countBreaches() * 0.14;
  level += Math.min(0.28, localInfectedCount * 0.04);
  level += game.player.hp < 40 ? 0.18 : 0;
  level += game.anomaly && game.anomaly.floor === game.player.floor ? 0.12 : 0;
  level += game.floorHazards.powerSurge > 0 && game.player.floor === "f1" ? 0.08 : 0;
  level += game.floorHazards.archiveLock > 0 && game.player.floor === "f2" ? 0.12 : 0;
  level += game.hunter.floor === game.player.floor && distance(game.hunter, game.player) < 240 ? 0.1 : 0;
  return clamp(level, 0, 1);
}

function updateBanner(dt) {
  if (!state.banner) {
    return;
  }
  state.banner.life -= dt;
  if (state.banner.life <= 0) {
    state.banner = null;
  }
}

function showBanner(title, subtitle, color, duration) {
  state.banner = {
    title,
    subtitle,
    color,
    life: state.lowFx ? duration * 0.75 : duration,
    maxLife: state.lowFx ? duration * 0.75 : duration,
  };
}

function updateFlash(dt) {
  if (!state.flash) {
    return;
  }
  state.flash.life -= dt;
  if (state.flash.life <= 0) {
    state.flash = null;
    return;
  }
  state.flash.alpha = state.flash.maxAlpha * (state.flash.life / state.flash.maxLife);
}

function flashScreen(color, alpha, duration) {
  state.flash = {
    color,
    alpha: state.lowFx ? alpha * 0.45 : alpha,
    maxAlpha: state.lowFx ? alpha * 0.45 : alpha,
    life: duration,
    maxLife: duration,
  };
}

function updateEffects(dt) {
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    const effect = state.effects[i];
    effect.life -= dt;
    if (effect.life <= 0) {
      state.effects.splice(i, 1);
    }
  }
}

function spawnImpact(x, y, color, size, spikes) {
  if (state.lowFx) {
    return;
  }
  if (state.effects.length > 80) {
    state.effects.splice(0, state.effects.length - 80);
  }
  state.effects.push({
    kind: "impact",
    x,
    y,
    color,
    size,
    spikes,
    life: 0.22,
    maxLife: 0.22,
  });
}

function spawnSlash(x1, y1, x2, y2, color) {
  if (state.lowFx) {
    return;
  }
  if (state.effects.length > 80) {
    state.effects.splice(0, state.effects.length - 80);
  }
  state.effects.push({
    kind: "slash",
    x1,
    y1,
    x2,
    y2,
    angle: Math.atan2(y2 - y1, x2 - x1),
    length: Math.max(18, distance({ x: x1, y: y1 }, { x: x2, y: y2 })),
    color,
    life: 0.14,
    maxLife: 0.14,
  });
}

function spawnTracer(x1, y1, x2, y2, color) {
  if (state.lowFx) {
    return;
  }
  if (state.effects.length > 80) {
    state.effects.splice(0, state.effects.length - 80);
  }
  state.effects.push({
    kind: "tracer",
    x1,
    y1,
    x2,
    y2,
    color,
    life: 0.08,
    maxLife: 0.08,
  });
}

function effectPalette(name) {
  const palettes = {
    crimson: { main: "rgba(255, 98, 138, 0.95)", glow: "rgba(255, 185, 208, 0.95)" },
    cyan: { main: "rgba(133, 216, 255, 0.95)", glow: "rgba(221, 247, 255, 0.95)" },
    amber: { main: "rgba(255, 191, 102, 0.95)", glow: "rgba(255, 233, 175, 0.95)" },
    violet: { main: "rgba(212, 149, 255, 0.95)", glow: "rgba(241, 220, 255, 0.95)" },
    gold: { main: "rgba(255, 221, 111, 0.95)", glow: "rgba(255, 243, 196, 0.95)" },
  };
  return palettes[name] || palettes.crimson;
}

function drawAfterimages() {
  if (state.lowFx) {
    return;
  }
  const danger = state.runtime.danger;
  if (danger < 0.08) {
    return;
  }

  const actors = [{ entity: game.player, color: "rgba(133, 216, 255, 0.1)" }];
  if (game.hunter.floor === game.player.floor) {
    actors.push({ entity: game.hunter, color: "rgba(255, 90, 140, 0.16)" });
  }

  for (const { entity, color } of actors) {
    for (let step = 1; step <= 3; step += 1) {
      ctx.beginPath();
      ctx.arc(entity.x - step * 5, entity.y - step * 2, (entity.radius || 12) + 1, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

function drawEffects() {
  if (state.lowFx) {
    return;
  }
  for (const effect of state.effects) {
    if (effect.kind === "impact") {
      drawImpactEffect(effect);
    } else if (effect.kind === "slash") {
      drawSlashEffect(effect);
    } else if (effect.kind === "tracer") {
      drawTracerEffect(effect);
    }
  }
}

function drawImpactEffect(effect) {
  const palette = effectPalette(effect.color);
  const progress = 1 - effect.life / effect.maxLife;
  const radius = effect.size * (8 + progress * 20);

  ctx.save();
  ctx.globalAlpha = effect.life / effect.maxLife;
  ctx.strokeStyle = palette.main;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < effect.spikes; i += 1) {
    const angle = (Math.PI * 2 * i) / effect.spikes + progress * 0.6;
    const inner = radius * 0.6;
    const outer = radius + 9;
    ctx.beginPath();
    ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
    ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlashEffect(effect) {
  const palette = effectPalette(effect.color);
  const progress = 1 - effect.life / effect.maxLife;
  const alpha = effect.life / effect.maxLife;

  ctx.save();
  ctx.translate(effect.x1, effect.y1);
  ctx.rotate(effect.angle);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = palette.main;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(effect.length * 0.45, -16 - progress * 10, effect.length, 0);
  ctx.stroke();

  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6, 2);
  ctx.quadraticCurveTo(effect.length * 0.45, -8 - progress * 6, effect.length - 4, 2);
  ctx.stroke();
  ctx.restore();
}

function drawTracerEffect(effect) {
  const palette = effectPalette(effect.color);
  const alpha = effect.life / effect.maxLife;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = palette.glow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(effect.x1, effect.y1);
  ctx.lineTo(effect.x2, effect.y2);
  ctx.stroke();

  ctx.strokeStyle = palette.main;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(effect.x1, effect.y1);
  ctx.lineTo(effect.x2, effect.y2);
  ctx.stroke();
  ctx.restore();
}

function renderHud(force = false) {
  const now = performance.now();
  if (!force && now - state.hudCache.lastRenderAt < (state.lowFx ? 180 : 120)) {
    return;
  }
  state.hudCache.lastRenderAt = now;
  const ownedRoom = state.runtime.ownedRoom;
  const playerGuardians = game.units.filter((u) => u.ownerId === "player");
  const secondaryStats = [
    [t("stat_floor"), formatFloorName(game.player.floor), ""],
    [t("stat_room"), ownedRoom ? ownedRoom.label : t("room_none"), ""],
    [t("stat_blackout"), game.blackoutActive ? langText("활성", "ACTIVE") : `${Math.ceil(game.blackoutTimer)}s`, game.blackoutActive ? "danger" : ""],
    [t("stat_fragments"), `${game.fragments} / 6`, ""],
    [t("stat_sigils"), `${game.keycardsCollected} / 2`, ""],
    [t("stat_contract"), formatContractStatus(), game.contract ? (game.contract.expiresIn <= 15 ? "danger" : "gold") : ""],
    [t("stat_anomaly"), formatAnomalyStatus(), game.anomaly ? "danger" : ""],
    ...(game.escapeWindow ? [[langText("탈출 창", "Exit Window"), `${Math.ceil(game.escapeWindow.timer)}s`, game.escapeWindow.timer <= 30 ? "danger" : "gold"]] : []),
    ...(playerGuardians.length > 0 ? [[langText("수호자", "Guardians"), String(playerGuardians.length), "gold"]] : []),
    [t("stat_hunter"), `${localize(game.runProfile.hunter.label)}${game.hunter.floor === game.player.floor ? langText(" ★같은층", " ★same floor") : ""}`, game.hunter.floor === game.player.floor ? "danger" : ""],
    ...(state.adminMode ? [[t("stat_admin"), state.godMode ? "GOD" : "ON", "gold admin-active"]] : []),
  ];

  const hpPct = Math.max(0, Math.min(100, (game.player.hp / game.player.maxHp) * 100));
  const hpBarColor = hpPct < 25 ? "var(--danger)" : hpPct < 55 ? "#ffb347" : "#5be8a0";
  const statsHtml = `
    <div class="stats-primary">
      <div class="stat-card stat-card-hp">
        <span>${t("stat_health")}</span>
        <strong class="${game.player.hp < 30 ? "danger" : ""}">${Math.ceil(game.player.hp)}</strong>
        <div class="hp-bar-track"><div class="hp-bar-fill" style="width:${hpPct}%;background:${hpBarColor}"></div></div>
      </div>
      <div class="stat-card">
        <span>${t("stat_gold")}</span>
        <strong class="gold">${Math.floor(game.gold)}</strong>
      </div>
      <div class="stat-card">
        <span>${t("stat_time")}</span>
        <strong>${formatTime(game.time)}</strong>
      </div>
    </div>
    <div class="stats-secondary">
      ${secondaryStats
        .map(
          ([label, value, className]) => `
            <div class="stat-chip${className === "danger" ? " chip-danger" : className === "gold" ? " chip-gold" : ""}">
              <span>${label}</span>
              <strong class="${className}">${value}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
  if (statsHtml !== state.hudCache.stats) {
    state.hudCache.stats = statsHtml;
    statsEl.innerHTML = statsHtml;
  }

  const metaRows = [
    [t("meta_runs"), String(state.meta.runs)],
    [t("meta_escapes"), String(state.meta.escapes)],
    [t("meta_bestTime"), formatTime(state.meta.bestTime)],
    [t("meta_shards"), String(state.meta.shards)],
    [t("meta_unlock"), getUnlockSummary(state.meta)],
  ];

  if (!state.sidebarCollapsed) {
    const metaHtml = metaRows
      .map(([label, value]) => `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`)
      .join("") + renderMetaTree();
    if (metaHtml !== state.hudCache.meta) {
      state.hudCache.meta = metaHtml;
      metaEl.innerHTML = metaHtml;
    }
  }

  const ownedObjective = !ownedRoom
    ? t("objective_findRoom")
    : game.anomaly
      ? langText(
          `${formatFloorName(game.anomaly.floor)}의 봉인 균열을 처리하세요.`,
          `Resolve the seal rift on ${formatFloorName(game.anomaly.floor)}.`,
        )
      : game.contract
        ? `${localize(game.contract.title)}: ${localize(game.contract.description)}`
        : game.fragments < 6
          ? t("objective_fragments")
          : game.keycardsCollected < 2
            ? t("objective_sigils")
            : t("objective_escape");

  const objectiveHtml = `<span class="mission-kicker">${langText("현재 목표", "Current Goal")}</span><span class="mission-body">${ownedObjective}</span>`;
  if (objectiveHtml !== state.hudCache.objective) {
    state.hudCache.objective = objectiveHtml;
    objectiveEl.innerHTML = objectiveHtml;
  }

  const prompt = state.runtime.prompt;
  const incomeText = state.runtime.incomeText;
  const promptHtml = `
    <span class="prompt-kicker">${langText("지금 할 행동", "Next Action")}</span>
    <strong class="prompt-main">${prompt ? prompt.text : t("prompt_none")}</strong>
    <span class="prompt-income">${incomeText}</span>
  `;
  if (promptHtml !== state.hudCache.prompt) {
    state.hudCache.prompt = promptHtml;
    promptEl.innerHTML = promptHtml;
  }
  let helpValue;
  if (game.suppressionTime > 0) {
    helpValue = langText(
      `억제 장막 ${game.suppressionTime.toFixed(1)}초 남음. 수호자들이 멈췄습니다.`,
      `Suppression field ${game.suppressionTime.toFixed(1)}s remaining. Guardians are stalled.`,
    );
  } else if (game.floorHazards.archiveLock > 0 && game.player.floor === "f2") {
    helpValue = langText(
      `아카이브 봉쇄 ${game.floorHazards.archiveLock.toFixed(1)}초. 2층 이동이 무거워집니다.`,
      `Archive lock ${game.floorHazards.archiveLock.toFixed(1)}s. Movement is heavier on Floor 2.`,
    );
  } else if (game.floorHazards.powerSurge > 0 && game.player.floor === "f1") {
    helpValue = langText(
      `전력 폭주 ${game.floorHazards.powerSurge.toFixed(1)}초. 하층 문선이 위험합니다.`,
      `Power surge ${game.floorHazards.powerSurge.toFixed(1)}s. Door lines on Floor 1 are unstable.`,
    );
  } else if (game.anomaly && game.anomaly.floor === game.player.floor) {
    helpValue = langText(
      `봉인 균열이 열렸습니다. ${game.anomaly.timer.toFixed(1)}초 안에 닿아 봉합하세요.`,
      `A seal rift is open. Reach it within ${game.anomaly.timer.toFixed(1)}s to seal it.`,
    );
  } else if (game.contract) {
    helpValue = `${localize(game.contract.title)}: ${localize(game.contract.description)}`;
  } else if (state.paused) {
    helpValue = langText("정지 중입니다. 계속 버튼이나 Esc/P로 복귀하세요.", "Paused. Resume with the button or Esc/P.");
  } else {
    helpValue = t("helpText");
  }
  if (helpValue !== state.hudCache.help) {
    state.hudCache.help = helpValue;
    helpText.textContent = helpValue;
  }

  const logHtml = state.logs
    .slice(-8)
    .reverse()
    .map(
      (entry) =>
        `<div class="log-entry${entry.type ? ` ${entry.type}` : ""}"><span class="log-time">${entry.time}</span><span>${entry.text}</span></div>`,
    )
    .join("");
  if (logHtml !== state.hudCache.log) {
    state.hudCache.log = logHtml;
    logEl.innerHTML = logHtml;
  }
}

function pushLog(text, type) {
  state.logs.push({ time: formatTime(game.time), text, type: type || inferLogType(text) });
  if (state.logs.length > 48) {
    state.logs.splice(0, state.logs.length - 48);
  }
  renderHud(true);
}

function inferLogType(text) {
  const t = text.toLowerCase();
  if (t.includes("데미지") || t.includes("damage") || t.includes("정전") || t.includes("blackout") || t.includes("침입") || t.includes("breach") || t.includes("사망") || t.includes("dead") || t.includes("처치") || t.includes("kill")) return "danger";
  if (t.includes("골드") || t.includes("gold") || t.includes("조각") || t.includes("fragment") || t.includes("시질") || t.includes("sigil") || t.includes("탈출") || t.includes("escape") || t.includes("수집") || t.includes("recover")) return "gold";
  return "info";
}

function formatIncomeStatus() {
  const ownedRooms = getOwnedRooms();
  if (ownedRooms.length === 0) {
    return langText(
      `수익 규칙: 방 안 +${CONFIG.economy.goldPerSecondInRoom}/초, 침대 보너스 +${CONFIG.economy.goldPerSecondOnBedBonus}/초`,
      `Income: room +${CONFIG.economy.goldPerSecondInRoom}/s, bed bonus +${CONFIG.economy.goldPerSecondOnBedBonus}/s`,
    );
  }

  const currentRoom = ownedRooms.find((r) => r.floor === game.player.floor && pointInRect(game.player.x, game.player.y, r));
  if (!currentRoom) {
    return langText(`내 방(${ownedRooms.length}개)으로 돌아가면 기본 수익이 다시 들어옵니다.`, `Return to your room (${ownedRooms.length}) to resume base income.`);
  }

  if (distance(game.player, currentRoom.bed) < 34) {
    return langText(
      `수익 중: +${CONFIG.economy.goldPerSecondInRoom + CONFIG.economy.goldPerSecondOnBedBonus}/초, 회복 중 (방 ${ownedRooms.length}개 보유)`,
      `Earning: +${CONFIG.economy.goldPerSecondInRoom + CONFIG.economy.goldPerSecondOnBedBonus}/s and healing (${ownedRooms.length} rooms owned)`,
    );
  }

  return langText(
    `수익 중: +${CONFIG.economy.goldPerSecondInRoom}/초. 침대에 가면 더 빨라집니다. (방 ${ownedRooms.length}개 보유)`,
    `Earning: +${CONFIG.economy.goldPerSecondInRoom}/s. Move to the bed for more. (${ownedRooms.length} rooms owned)`,
  );
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const remain = String(total % 60).padStart(2, "0");
  return `${minutes}:${remain}`;
}

function pointInRect(x, y, rect) {
  return x >= rect.x && y >= rect.y && x <= rect.x + rect.w && y <= rect.y + rect.h;
}

function isMovePressed(direction) {
  const mapping = {
    up: ["w", "W", "KeyW", "ArrowUp", "ㅈ"],
    down: ["s", "S", "KeyS", "ArrowDown", "ㄴ"],
    left: ["a", "A", "KeyA", "ArrowLeft", "ㅁ"],
    right: ["d", "D", "KeyD", "ArrowRight", "ㅇ"],
  };
  return mapping[direction].some((key) => keys.has(key));
}

function isActionPressed(action) {
  const mapping = {
    interact: ["e", "E", "KeyE", "Enter"],
  };
  return (mapping[action] || []).some((key) => keys.has(key));
}

function syncStageLayout() {
  if (!stageEl) {
    return;
  }
  const viewportRect = stageEl.parentElement.getBoundingClientRect();
  const availableWidth = Math.max(320, viewportRect.width);
  const availableHeight = Math.max(260, window.innerHeight - viewportRect.top - 18);
  let width = availableWidth;
  let height = width / STAGE_RATIO;

  if (height > availableHeight) {
    height = availableHeight;
    width = height * STAGE_RATIO;
  }

  stageEl.style.width = `${width}px`;
  stageEl.style.height = `${height}px`;
}

function circleIntersectsRect(x, y, radius, rect) {
  const nearestX = clamp(x, rect.x, rect.x + rect.w);
  const nearestY = clamp(y, rect.y, rect.y + rect.h);
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function awardRunRewards(escaped) {
  const beforeTier = computeUnlockTier(state.meta.archiveXp ?? state.meta.shards ?? 0);
  const timeBonus = Math.min(3, Math.floor(game.time / 75));
  let shardsEarned = escaped
    ? CONFIG.meta.shardEscapeBase + timeBonus
    : CONFIG.meta.shardFailBase + Math.min(2, Math.floor(game.time / 90));

  // Achievement bonus shards
  const bonusLog = [];
  const stats = game.stats || {};
  if (escaped && game.time < 180) { shardsEarned += 2; bonusLog.push(langText("빠른 탈출 +2", "Speed run +2")); }
  if (escaped && state.meta.escapes === 1) { shardsEarned += 10; bonusLog.push(langText("첫 탈출 +10", "First escape +10")); }
  if ((stats.infectedKills || 0) >= 10) { shardsEarned += 1; bonusLog.push(langText("감염체 학살 +1", "Mass cleanse +1")); }
  if ((stats.intelPurchases || 0) >= 3) { shardsEarned += 1; bonusLog.push(langText("정보 수집 +1", "Intel hunter +1")); }
  if ((stats.reinforceDone || 0) >= 3) { shardsEarned += 1; bonusLog.push(langText("방어 달인 +1", "Defender +1")); }
  if ((stats.contractsCompleted || 0) >= 1) { shardsEarned += 1; bonusLog.push(langText("계약 완료 +1", "Contractor +1")); }
  const anomaliesClosedBonus = Math.min(3, stats.anomaliesClosed || 0);
  if (anomaliesClosedBonus > 0) { shardsEarned += anomaliesClosedBonus; bonusLog.push(langText(`이상현상 봉인 +${anomaliesClosedBonus}`, `Anomalies sealed +${anomaliesClosedBonus}`)); }
  if (!escaped && game.time >= 300) { shardsEarned += 1; bonusLog.push(langText("5분 생존 +1", "5min survivor +1")); }
  // Minimum guarantee: failed runs always earn at least 2 shards
  if (!escaped) shardsEarned = Math.max(2, shardsEarned);
  if (bonusLog.length > 0) {
    pushLog(langText(`보너스 잔재: ${bonusLog.join(", ")}`, `Bonus shards: ${bonusLog.join(", ")}`));
  }

  state.meta.shards = (state.meta.shards || 0) + shardsEarned;
  state.meta.archiveXp = (state.meta.archiveXp || 0) + shardsEarned;
  state.meta.unlockTier = computeUnlockTier(state.meta.archiveXp);
  pushLog(langText(`잔재 ${shardsEarned}개를 확보했습니다.`, `Secured ${shardsEarned} shards.`));
  if (state.meta.unlockTier > beforeTier) {
    showBanner(
      langText("기록 단계 상승", "Archive Upgraded"),
      getUnlockSummary(state.meta),
      "gold",
      1.8,
    );
    pushLog(langText(`새 기록 보정 해금: ${getUnlockSummary(state.meta)}`, `New archive perk unlocked: ${getUnlockSummary(state.meta)}`));
  }
}

function loadMeta() {
  try {
    const raw = localStorage.getItem("night-shift-escape-meta");
    if (!raw) {
      return { runs: 0, escapes: 0, bestTime: 0, shards: 0, archiveXp: 0, unlockTier: 0, unlockedNodes: [], selectedNodes: [], seenTutorial: false };
    }
    const parsed = JSON.parse(raw);
    const shards = parsed.shards || 0;
    const archiveXp = parsed.archiveXp ?? parsed.shards ?? 0;
    return {
      runs: parsed.runs || 0,
      escapes: parsed.escapes || 0,
      bestTime: parsed.bestTime || 0,
      shards,
      archiveXp,
      unlockTier: computeUnlockTier(archiveXp),
      seenTutorial: parsed.seenTutorial || false,
      unlockedNodes: Array.isArray(parsed.unlockedNodes) ? parsed.unlockedNodes.filter((id) => META_TREE.some((node) => node.id === id)) : [],
      selectedNodes: Array.isArray(parsed.selectedNodes)
        ? parsed.selectedNodes.filter((id) => META_TREE.some((node) => node.id === id)).slice(0, getMetaSelectionLimit({ archiveXp }))
        : [],
    };
  } catch {
    return { runs: 0, escapes: 0, bestTime: 0, shards: 0, archiveXp: 0, unlockTier: 0, unlockedNodes: [], selectedNodes: [], seenTutorial: false };
  }
}

function loadLanguage() {
  try {
    const value = localStorage.getItem("night-shift-escape-lang");
    if (value === "ko" || value === "en") {
      return value;
    }
  } catch {}
  return "ko";
}

function saveLanguage(lang) {
  try {
    localStorage.setItem("night-shift-escape-lang", lang);
  } catch {}
}

function saveMeta(meta) {
  try {
    localStorage.setItem("night-shift-escape-meta", JSON.stringify(meta));
  } catch {
    pushLog(t("save_unavailable"));
  }
}

function pulseShake(amount) {
  state.screenShake = Math.max(state.screenShake, state.lowFx ? amount * 0.45 : amount);
}

function createAudioState() {
  return {
    context: null,
    unlocked: false,
    muted: loadMutePreference(),
    ambient: null,
  };
}

function ensureAudio() {
  if (state.audio.unlocked) {
    return;
  }
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  try {
    state.audio.context = state.audio.context || new AudioContextCtor();
    if (state.audio.context.state === "suspended") {
      state.audio.context.resume();
    }
    ensureAmbientLoop();
    state.audio.unlocked = true;
  } catch {
    state.audio.unlocked = false;
  }
}

function playUiTone(frequency, duration, type, volume) {
  if (!state.audio.unlocked || !state.audio.context || state.audio.muted) {
    return;
  }

  const context = state.audio.context;
  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function ensureAmbientLoop() {
  if (!state.audio.context || state.audio.ambient) {
    return;
  }
  const context = state.audio.context;
  const master = context.createGain();
  const drone = context.createOscillator();
  const shimmer = context.createOscillator();
  const filter = context.createBiquadFilter();

  drone.type = "sine";
  drone.frequency.setValueAtTime(58, context.currentTime);
  shimmer.type = "triangle";
  shimmer.frequency.setValueAtTime(121, context.currentTime);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, context.currentTime);
  master.gain.setValueAtTime(0.0001, context.currentTime);

  drone.connect(filter);
  shimmer.connect(filter);
  filter.connect(master);
  master.connect(context.destination);

  drone.start();
  shimmer.start();

  state.audio.ambient = {
    master,
    drone,
    shimmer,
    filter,
  };
}

function updateAmbientAudio() {
  if (!state.audio.unlocked || !state.audio.context || !state.audio.ambient) {
    return;
  }
  if (state.perf.ambientTick > 0) {
    return;
  }
  state.perf.ambientTick = state.lowFx ? 0.28 : 0.16;
  const { context, ambient } = state.audio;
  const now = context.currentTime;
  const danger = state.runtime.danger;
  const pausedFactor = state.paused || state.titleVisible ? 0.25 : 1;
  const suppressionFactor =
    (game.suppressionTime > 0 ? 0.18 : 0) +
    (game.floorHazards.archiveLock > 0 ? 0.08 : 0) +
    (game.floorHazards.powerSurge > 0 ? 0.06 : 0);
  const floorFactor = game.player.floor === "f2" ? 1 : 0;
  const targetGain = state.audio.muted ? 0.0001 : (0.012 + danger * 0.028 + suppressionFactor) * pausedFactor;
  const targetFilter = game.blackoutActive ? 260 : 380 + danger * 260 + floorFactor * 110;
  const droneFreq = 54 + danger * 14 + (game.blackoutActive ? 6 : 0) + floorFactor * 5;
  const shimmerFreq = 118 + danger * 22 + (game.suppressionTime > 0 ? 20 : 0) + floorFactor * 28;

  ambient.master.gain.cancelScheduledValues(now);
  ambient.master.gain.setTargetAtTime(targetGain, now, 0.24);
  ambient.filter.frequency.cancelScheduledValues(now);
  ambient.filter.frequency.setTargetAtTime(targetFilter, now, 0.28);
  ambient.drone.frequency.cancelScheduledValues(now);
  ambient.drone.frequency.setTargetAtTime(droneFreq, now, 0.28);
  ambient.shimmer.frequency.cancelScheduledValues(now);
  ambient.shimmer.frequency.setTargetAtTime(shimmerFreq, now, 0.28);
}

function loadMutePreference() {
  try {
    return localStorage.getItem("night-shift-escape-muted") === "1";
  } catch {
    return false;
  }
}

function loadPerformanceMode() {
  try {
    return localStorage.getItem("night-shift-escape-lowfx") === "1";
  } catch {
    return false;
  }
}

function savePerformanceMode(value) {
  try {
    localStorage.setItem("night-shift-escape-lowfx", value ? "1" : "0");
  } catch {}
}

function saveMutePreference(muted) {
  try {
    localStorage.setItem("night-shift-escape-muted", muted ? "1" : "0");
  } catch {}
}

function loop(now) {
  const dt = Math.max(0, Math.min(0.033, (now - state.lastFrame) / 1000));
  state.lastFrame = now;
  state.perf.avgDt = state.perf.avgDt * 0.92 + dt * 0.08;
  state.perf.ambientTick = Math.max(0, state.perf.ambientTick - dt);
  if (!state.lowFx && state.perf.avgDt > 0.026) {
    state.perf.slowFrames += 1;
    if (state.perf.slowFrames > 100) {
      state.lowFx = true;
      state.perf.autoLowFx = true;
      savePerformanceMode(true);
      applyStaticText();
      pushLog(langText("프레임 저하를 감지해 간소화 모드로 전환했습니다.", "Frame drop detected. Switched to Lite FX."));
    }
  } else if (state.perf.avgDt < 0.021) {
    state.perf.slowFrames = Math.max(0, state.perf.slowFrames - 2);
  } else {
    state.perf.slowFrames = Math.max(0, state.perf.slowFrames - 1);
  }
  update(dt);
  updateAmbientAudio();
  draw();
  renderHud(false);
  requestAnimationFrame(loop);
}

if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
  state.movementMode = "click";
}

refreshRuntimeState();
applyStaticText();
syncStageLayout();
pushLog(langText("빈 방을 점거하고, 운을 뚫으며 탈출하세요.", "Find a vacant room, then build enough luck to escape."));
announceRunSetup();
requestAnimationFrame(loop);
