"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
const hudToggleButton = document.getElementById("hudToggleButton");
const muteButton = document.getElementById("muteButton");
const pauseButton = document.getElementById("pauseButton");
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

const I18N = {
  ko: {
    subtitle: "브라우저용 애니 호러 솔로 디펜스 런.",
    themeChip: "셀 호러 HUD",
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
      "빈 방을 점거하고, 확률을 뚫어 버티고, 정전을 견디고, 복도가 네 이름을 기억하기 전에 탈출하세요.",
    start: "작전 시작",
    missionHeading: "임무 피드",
    runHeading: "현재 런",
    controlsHeading: "조작",
    logHeading: "이벤트 로그",
    metaHeading: "기록",
    helpHeading: "빠른 도움말",
    helpText:
      "방을 먼저 점거한 뒤 침대에서 자금을 벌고, 제단에서 소환하고, 단말에서 지도 조각을 사세요. 모바일은 왼쪽 스틱으로 이동하고 오른쪽 버튼으로 행동합니다.",
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
      ["운영자 모드", "F1"],
      ["운영자 자금", "Insert"],
    ],
    stat_health: "체력",
    stat_gold: "골드",
    stat_time: "시간",
    stat_movement: "이동",
    stat_admin: "운영자",
    stat_room: "방",
    stat_fragments: "지도 조각",
    stat_sigils: "시질",
    stat_blackout: "정전",
    stat_hunter: "술래 유형",
    stat_boon: "가호",
    stat_omen: "흉조",
    meta_runs: "플레이 수",
    meta_escapes: "탈출 수",
    meta_bestTime: "최고 시간",
    meta_shards: "잔재",
    meta_unlock: "기록 단계",
    room_none: "없음",
    movement_wasd: "키보드",
    movement_click: "포인트",
    objective_findRoom: "빈 방을 찾아 점거하고, 추격자가 문을 기억하기 전에 자리를 잡으세요.",
    objective_fragments: "침대에서 돈을 벌고, 수호자를 뽑고, 단말기에서 지도 조각을 도박처럼 수집하세요.",
    objective_sigils: "두 개의 시질을 회수해 서비스 게이트를 강제로 여세요.",
    objective_escape: "복도가 널 삼키기 전에 서비스 게이트로 달리세요.",
    prompt_none: "지금 당장 할 상호작용이 없습니다.",
    prompt_generator: "E를 누르고 유지해 발전기를 수리하세요.",
    prompt_escape: "E를 눌러 탈출하세요.",
    prompt_claim: "E를 눌러 이 방을 점거하세요.",
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
      "Claim a room. Rig the odds. Survive the blackout. Escape before the corridor learns your name.",
    start: "Start Operation",
    missionHeading: "Mission Feed",
    runHeading: "Run",
    controlsHeading: "Controls",
    logHeading: "Event Log",
    metaHeading: "Meta",
    helpHeading: "Quick Help",
    helpText:
      "Claim a room first, farm gold on the bed, summon at the altar, and buy map fragments at the terminal. On mobile, move with the left stick and use the right buttons for actions.",
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
      ["Admin mode", "F1"],
      ["Admin money", "Insert"],
    ],
    stat_health: "Health",
    stat_gold: "Gold",
    stat_time: "Time",
    stat_movement: "Movement",
    stat_admin: "Admin",
    stat_room: "Room",
    stat_fragments: "Fragments",
    stat_sigils: "Sigils",
    stat_blackout: "Blackout",
    stat_hunter: "Hunter",
    stat_boon: "Boon",
    stat_omen: "Omen",
    meta_runs: "Runs",
    meta_escapes: "Escapes",
    meta_bestTime: "Best time",
    meta_shards: "Shards",
    meta_unlock: "Archive tier",
    room_none: "None",
    movement_wasd: "Keyboard",
    movement_click: "Point",
    objective_findRoom: "Find a vacant room and bind it before the ward closes around you.",
    objective_fragments: "Hold the room, harvest gold from the bed, and gamble for fragments at the terminal.",
    objective_sigils: "Recover both sigils and force the service gate to yield.",
    objective_escape: "Run for the service gate before the ward swallows you.",
    prompt_none: "No immediate interaction.",
    prompt_generator: "Hold E to repair the generator.",
    prompt_escape: "Press E to escape.",
    prompt_claim: "Press E to claim this room.",
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
  },
  admin: {
    toggleKey: "f1",
    payoutKey: "insert",
    payoutAmount: 250,
  },
  economy: {
    startingGold: 85,
    goldPerSecondOnBed: 12,
  },
  summon: {
    baseCost: 60,
    slotCostStep: 18,
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
    fragmentCostStep: 18,
    timeInflation: 0.45,
    fragmentChance: 0.5,
    radarChance: 0.72,
    failChance: 0.92,
    maxFragments: 6,
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
    maxPressureBonus: 2,
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
    goldGainMultiplier: 0.58,
    decisionMin: 3.6,
    decisionMax: 6.4,
    baseUnitCap: 2,
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
      startingGoldBonus: 70,
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
  paused: false,
  sidebarCollapsed: window.matchMedia && window.matchMedia("(max-width: 1120px)").matches,
  screenShake: 0,
  audio: createAudioState(),
  effects: [],
  titleVisible: true,
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
  const tier = computeUnlockTier(meta.shards || 0);
  return {
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
  };
  const additive = new Set([
    "startingGoldBonus",
    "playerMaxHpBonus",
    "blackoutSpawnBonus",
    "playerRelicWeightBonus",
    "playerAggroBonus",
    "hiderUnitCapBonus",
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
  const tier = computeUnlockTier(meta.shards || 0);
  const summaries = [
    { ko: "T0 기본", en: "T0 Base" },
    { ko: "T1 시작 골드 보정", en: "T1 Bonus start gold" },
    { ko: "T2 체력 + 비용 할인", en: "T2 HP + cost cuts" },
    { ko: "T3 상위 기록 보정", en: "T3 advanced archive" },
  ];
  return localize(summaries[tier] || summaries[0]);
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
let game = createGame();
const navGraph = buildNavGraph(world);

function buildWorld() {
  const hall = { id: "hall", x: 150, y: 250, w: 900, h: 240, label: "Central Hall" };
  const exitConnector = { id: "exitConnector", x: 1050, y: 320, w: 130, h: 100, label: "Exit Corridor" };
  const generatorConnector = { id: "generatorConnector", x: 980, y: 490, w: 120, h: 110, label: "Service Drop" };
  const rooms = [
    createRoom("northWest", "North Ward", 60, 60, 280, 190, 240, 250),
    createRoom("northCenter", "Observation", 360, 60, 280, 190, 500, 250),
    createRoom("northEast", "Old Infirmary", 660, 60, 280, 190, 800, 250),
    createRoom("southWest", "Storage Wing", 60, 490, 280, 190, 240, 490),
    createRoom("southCenter", "Dormitory", 360, 490, 280, 190, 500, 490),
    createRoom("southEast", "Isolation", 660, 490, 280, 190, 800, 490),
  ];
  const generatorRoom = {
    id: "generator",
    x: 920,
    y: 600,
    w: 300,
    h: 120,
    label: "Generator Room",
    door: {
      x: 1050,
      y: 600,
      w: 40,
      h: 10,
      centerX: 1070,
      centerY: 600,
      closed: false,
    },
  };
  const exitRoom = {
    id: "exit",
    x: 1180,
    y: 300,
    w: 140,
    h: 140,
    label: "Service Gate",
    gate: {
      x: 1180,
      y: 350,
      w: 10,
      h: 40,
      centerX: 1185,
      centerY: 370,
      closed: true,
    },
  };

  const zones = [hall, exitConnector, generatorConnector, generatorRoom, exitRoom, ...rooms];
  const barriers = [];

  for (const room of rooms) {
    const sharedY = room.y + room.h === hall.y ? hall.y : room.y;
    barriers.push(
      { x: room.x, y: sharedY - 4, w: room.door.x - room.x, h: 8 },
      {
        x: room.door.x + room.door.w,
        y: sharedY - 4,
        w: room.x + room.w - (room.door.x + room.door.w),
        h: 8,
      },
    );
  }

  barriers.push(
    { x: generatorRoom.x, y: generatorRoom.y - 4, w: generatorRoom.door.x - generatorRoom.x, h: 8 },
    {
      x: generatorRoom.door.x + generatorRoom.door.w,
      y: generatorRoom.y - 4,
      w: generatorRoom.x + generatorRoom.w - (generatorRoom.door.x + generatorRoom.door.w),
      h: 8,
    },
    { x: exitRoom.x - 4, y: exitRoom.y, w: 8, h: exitRoom.gate.y - exitRoom.y },
    {
      x: exitRoom.x - 4,
      y: exitRoom.gate.y + exitRoom.gate.h,
      w: 8,
      h: exitRoom.y + exitRoom.h - (exitRoom.gate.y + exitRoom.gate.h),
    },
  );

  return {
    hall,
    exitConnector,
    generatorConnector,
    rooms,
    generatorRoom,
    exitRoom,
    zones,
    barriers,
    generator: { x: 1070, y: 658, radius: 28 },
    keycards: [
      { id: "sigilWest", x: 1070, y: 690, roomId: "generator", threshold: 2, collected: false, visible: false },
      { id: "sigilEast", x: 880, y: 585, roomId: "southEast", threshold: 4, collected: false, visible: false },
    ],
  };
}

function createRoom(id, label, x, y, w, h, doorCenterX, doorY) {
  const doorHeight = 10;
  const doorWidth = 40;
  const bed = { x: x + w * 0.28, y: y + h * 0.42, radius: 26 };
  return {
    id,
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
  }

  for (const keycard of world.keycards) {
    keycard.collected = false;
    keycard.visible = false;
  }

  world.exitRoom.gate.closed = true;

  const player = {
    x: 590,
    y: 370,
    radius: 12,
    hp: CONFIG.player.maxHp + runProfile.modifiers.playerMaxHpBonus,
    maxHp: CONFIG.player.maxHp + runProfile.modifiers.playerMaxHpBonus,
    speed: CONFIG.player.speed,
    roomId: null,
    ownedRoomId: null,
    holdingRepair: 0,
    lastSafeHeal: 0,
    lastDamageSource: "unknown",
  };

  const hunter = {
    x: 590,
    y: 310,
    radius: 16,
    hp: (CONFIG.hunter.baseHp + CONFIG.hunter.hpPerLevel) * runProfile.modifiers.hunterHpMultiplier,
    targetRoomId: null,
    targetX: 590,
    targetY: 370,
    speed: 72,
    attackCooldown: 0,
    retargetTimer: 0,
    level: 1,
    mode: "stalk",
    modeTimer: 0,
    skillCooldown: randomRange(
      HUNTER_SKILLS[runProfile.hunter.id].cooldownMin,
      HUNTER_SKILLS[runProfile.hunter.id].cooldownMax,
    ),
  };

  const assigned = new Map([
    ["northWest", "hiderA"],
    ["northEast", "hiderB"],
    ["southEast", "hiderC"],
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
    blackoutTimer: rollBlackoutTimer(runProfile),
    blackoutDuration: 0,
    suppressionTime: 0,
    mutationClock: 0,
    repairNoise: 0,
    intelNoise: 0,
    winFlash: 0,
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
  game = createGame();
  pushLog(langText("런을 초기화했습니다. 방을 점거하고 탈출까지 버텨보세요.", "Run reset. Claim a room and survive long enough to escape."));
  announceRunSetup();
  renderHud();
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
  const rect = mobileStick.getBoundingClientRect();
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
  showBanner(
    localize(game.runProfile.hunter.label),
    `${localize(game.runProfile.boon.label)} / ${localize(game.runProfile.omen.label)}`,
    "cyan",
    1.8,
  );
  flashScreen("rgba(133, 216, 255, 0.18)", 0.34, 0.2);
}

function toggleLanguage() {
  state.lang = state.lang === "ko" ? "en" : "ko";
  saveLanguage(state.lang);
  applyStaticText();
  renderHud();
}

function applyStaticText() {
  document.documentElement.lang = state.lang;
  subtitleText.textContent = t("subtitle");
  themeChip.textContent = t("themeChip");
  hudToggleButton.textContent = state.sidebarCollapsed ? t("hud_show") : t("hud_hide");
  muteButton.textContent = state.audio.muted ? t("mute_off") : t("mute_on");
  pauseButton.textContent = state.paused ? t("resume") : t("pause");
  restartButton.textContent = t("restart");
  alarmStrip.textContent = t("alarm");
  titleKicker.textContent = t("titleKicker");
  titleOverlayHeading.textContent = t("titleOverlayHeading");
  titleOverlayCopy.textContent = t("titleOverlayCopy");
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
  controlsList.innerHTML = I18N[state.lang].controls
    .map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`)
    .join("");
}

restartButton.addEventListener("click", resetGame);
startButton.addEventListener("click", startRun);
languageButton.addEventListener("click", toggleLanguage);
hudToggleButton.addEventListener("click", () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applyStaticText();
});
muteButton.addEventListener("click", toggleMute);
pauseButton.addEventListener("click", () => {
  togglePause();
});
resumeButton.addEventListener("click", () => {
  setPaused(false);
});
pauseMuteButton.addEventListener("click", toggleMute);
dockModeButton.addEventListener("click", () => {
  state.movementMode = state.movementMode === "wasd" ? "click" : "wasd";
  state.clickTarget = null;
  pushLog(state.lang === "ko" ? `이동 방식: ${t(`movement_${state.movementMode}`)}` : `Movement mode: ${state.movementMode.toUpperCase()}`);
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

  if (state.titleVisible) {
    const launchKeys = new Set(["enter", " ", "w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
    if (launchKeys.has(event.key.toLowerCase())) {
      event.preventDefault();
      startRun();
    }
  }

  if (event.key === "Escape" || event.key.toLowerCase() === "p") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    state.movementMode = state.movementMode === "wasd" ? "click" : "wasd";
    state.clickTarget = null;
    pushLog(state.lang === "ko" ? `이동 방식: ${t(`movement_${state.movementMode}`)}` : `Movement mode: ${state.movementMode.toUpperCase()}`);
    return;
  }

  if (event.key.toLowerCase() === CONFIG.admin.toggleKey) {
    event.preventDefault();
    state.adminMode = !state.adminMode;
    pushLog(state.lang === "ko" ? `운영자 모드 ${state.adminMode ? "활성화" : "비활성화"}.` : `Admin mode ${state.adminMode ? "enabled" : "disabled"}.`);
    playUiTone(state.adminMode ? 680 : 280, 0.08, "triangle", 0.035);
    return;
  }

  if (event.key.toLowerCase() === CONFIG.admin.payoutKey) {
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

  if (event.key.toLowerCase() === "e") {
    if (state.paused) {
      return;
    }
    triggerInteract();
  }

  if (event.key.toLowerCase() === "r") {
    if (state.paused) {
      return;
    }
    attemptReinforce();
  }

  keys.add(event.key.toLowerCase());
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
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
});

mobileStick.addEventListener("pointerdown", handleStickPointerDown);
window.addEventListener("pointermove", handleStickPointerMove);
window.addEventListener("pointerup", handleStickPointerUp);
window.addEventListener("pointercancel", handleStickPointerUp);

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
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
      escapeRun();
      break;
    default:
      break;
  }
}

function attemptReinforce() {
  if (game.phase !== "running") {
    return;
  }

  const ownedRoom = getOwnedRoom();
  if (!ownedRoom) {
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

function getReinforceCost() {
  return (
    CONFIG.door.reinforceBaseCost +
    Math.floor(game.time / CONFIG.door.reinforceTimeStep) * CONFIG.door.reinforceCostStep
  );
}

function reinforceDoor(room, actorType, hider = null) {
  const cost = getReinforceCost();
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
    room.aggro += 20;
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
}

function claimRoom(room) {
  if (game.player.ownedRoomId || room.owner) {
    return;
  }
  room.owner = "player";
  room.occupied = true;
  room.door.closed = true;
  room.door.broken = false;
  room.aggro = 20 + game.runProfile.modifiers.playerAggroBonus;
  game.player.ownedRoomId = room.id;
  pushLog(langText(`${room.label}을 점거했습니다.`, `${room.label} is now yours.`));
  showBanner(langText("방 점거", "Room Claimed"), room.label, "cyan", 1.4);
}

function toggleDoor(room) {
  if (room.owner !== "player" || room.door.broken) {
    return;
  }
  room.door.closed = !room.door.closed;
  pushLog(room.door.closed ? langText("문을 봉쇄했습니다.", "Door sealed.") : langText("문을 열었습니다.", "Door opened."));
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
  const roll = Math.random();
  if (roll < CONFIG.intel.fragmentChance) {
    game.fragments = Math.min(CONFIG.intel.maxFragments, game.fragments + 1);
    pushLog(langText(`지도 조각 확보 (${game.fragments}/6).`, `Map fragment recovered (${game.fragments}/6).`));
    playUiTone(540, 0.08, "triangle", 0.04);
    showBanner(langText("지도 조각", "Map Fragment"), langText(`${game.fragments} / 6 확보`, `Recovered ${game.fragments} of 6.`), "cyan", 1);
  } else if (roll < CONFIG.intel.radarChance) {
    game.radarTime = Math.max(game.radarTime, 12 * game.runProfile.modifiers.radarDurationMultiplier);
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

  for (const keycard of world.keycards) {
    if (game.fragments >= keycard.threshold) {
      keycard.visible = true;
    }
  }

  if (game.fragments >= 6 && game.keycardsCollected >= 2) {
    world.exitRoom.gate.closed = false;
    pulseShake(1.8);
  }
}

function getSummonCost(room, actorType = "player") {
  const occupiedSlots = roomUnits(room.id).length;
  const rawCost = CONFIG.summon.baseCost + occupiedSlots * CONFIG.summon.slotCostStep;
  const multiplier = actorType === "player" ? game.runProfile.modifiers.summonCostMultiplier : 1;
  return Math.round(rawCost * multiplier);
}

function getIntelCost() {
  const rawCost =
    CONFIG.intel.baseCost +
    game.fragments * CONFIG.intel.fragmentCostStep +
    Math.floor(game.time * CONFIG.intel.timeInflation);
  return Math.round(rawCost * game.runProfile.modifiers.intelCostMultiplier);
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
  return world.rooms.find((room) => room.id === game.player.ownedRoomId) || null;
}

function getRoomById(roomId) {
  return world.rooms.find((room) => room.id === roomId) || null;
}

function getRoomByOwner(ownerId) {
  return world.rooms.find((room) => room.owner === ownerId) || null;
}

function getRoomAt(x, y) {
  return world.rooms.find((room) => pointInRect(x, y, room)) || null;
}

function getZoneAt(x, y) {
  return world.zones.find((zone) => pointInRect(x, y, zone)) || null;
}

function getPrompt() {
  const player = game.player;
  const room = getRoomAt(player.x, player.y);
  const ownedRoom = getOwnedRoom();

  if (game.blackoutActive && distance(player, world.generator) < 46) {
    return { type: "generator", text: t("prompt_generator") };
  }

  if (world.exitRoom.gate.closed === false && pointInRect(player.x, player.y, world.exitRoom)) {
    return { type: "escape", text: t("prompt_escape") };
  }

  if (room && !room.owner && distance(player, room.bed) < 42) {
    return { type: "claim", room, text: t("prompt_claim") };
  }

  if (ownedRoom && distance(player, ownedRoom.altar) < 42) {
    return { type: "summon", room: ownedRoom, text: t("prompt_summon") };
  }

  if (ownedRoom && distance(player, ownedRoom.terminal) < 42) {
    return { type: "intel", room: ownedRoom, text: t("prompt_intel") };
  }

  if (ownedRoom && distance(player, { x: ownedRoom.door.centerX, y: ownedRoom.door.centerY }) < 42) {
    return { type: "door", room: ownedRoom, text: t("prompt_door") };
  }

  return null;
}

function escapeRun() {
  if (world.exitRoom.gate.closed) {
    return;
  }
  resetTouchStick();
  setPaused(false);
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
  showBanner(langText("런 실패", "Run Failed"), reason, "crimson", 2.2);
  flashScreen("rgba(255, 72, 118, 0.28)", 0.55, 0.28);
}

function update(dt) {
  if (state.titleVisible) {
    updateEffects(dt);
    updateBanner(dt);
    updateFlash(dt);
    return;
  }

  if (state.paused) {
    updateEffects(dt * 0.25);
    updateBanner(dt * 0.25);
    updateFlash(dt * 0.25);
    return;
  }

  if (game.phase !== "running") {
    game.winFlash = Math.max(0, game.winFlash - dt);
    updateEffects(dt);
    updateBanner(dt);
    updateFlash(dt);
    return;
  }

  game.time += dt;
  game.radarTime = Math.max(0, game.radarTime - dt);
  game.compassTime = Math.max(0, game.compassTime - dt);
  game.suppressionTime = Math.max(0, game.suppressionTime - dt);
  game.intelNoise = Math.max(0, game.intelNoise - dt);
  state.screenShake = Math.max(0, state.screenShake - dt * CONFIG.feedback.shakeDecayPerSecond);
  updateEffects(dt);
  updateBanner(dt);
  updateFlash(dt);
  updatePlayer(dt);
  updateEconomy(dt);
  updateBlackout(dt);
  updateMutation(dt);
  updateHiders(dt);
  updateUnits(dt);
  updateHunter(dt);
  updateInfected(dt);
  collectKeycards();

  if (game.player.hp <= 0) {
    failRun(
      game.player.lastDamageSource === "infected"
        ? langText("감염체에게 찢겼습니다.", "You were torn apart by infected.")
        : langText("술래에게 붙잡혔습니다.", "You were taken by the hunter."),
    );
  }
}

function updatePlayer(dt) {
  const player = game.player;
  let dx = 0;
  let dy = 0;

  if (state.touchStick.active) {
    dx = state.touchStick.dx;
    dy = state.touchStick.dy;
  } else if (state.movementMode === "wasd") {
    if (keys.has("w")) {
      dy -= 1;
    }
    if (keys.has("s")) {
      dy += 1;
    }
    if (keys.has("a")) {
      dx -= 1;
    }
    if (keys.has("d")) {
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

  const speed = player.speed;
  moveEntity(player, dx * speed * dt, dy * speed * dt);
  player.roomId = getRoomAt(player.x, player.y)?.id || null;

  if (game.blackoutActive && distance(player, world.generator) < 46 && keys.has("e")) {
    player.holdingRepair += dt;
    if (player.holdingRepair >= 2.2 * game.runProfile.modifiers.repairDurationMultiplier) {
      repairGenerator();
    }
  } else {
    player.holdingRepair = 0;
  }
}

function updateEconomy(dt) {
  const ownedRoom = getOwnedRoom();
  if (!ownedRoom) {
    return;
  }

  if (distance(game.player, ownedRoom.bed) < 34) {
    addGold(CONFIG.economy.goldPerSecondOnBed * game.runProfile.modifiers.goldGainMultiplier * dt);
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + CONFIG.player.healPerSecondOnBed * dt);
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
        pointInRect(enemy.x, enemy.y, room) ||
        distance(enemy, { x: room.door.centerX, y: room.door.centerY }) < 120,
    ).length;

    const safeIncome =
      CONFIG.economy.goldPerSecondOnBed *
      CONFIG.hider.goldGainMultiplier *
      game.runProfile.modifiers.hiderGoldMultiplier;
    hider.gold += safeIncome * dt * (localThreats > 0 || game.blackoutActive ? 0.18 : 1);
    hider.panic = Math.max(0, hider.panic - dt);

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

    if (room.door.hp < room.door.maxHp * 0.72 && hider.gold >= getReinforceCost()) {
      if (reinforceDoor(room, "hider", hider)) {
        continue;
      }
    }

    const ownedUnits = roomUnits(room.id, hider.id).length;
    const shouldSummon =
      ownedUnits < hider.unitCap &&
      hider.gold >= getSummonCost(room, "hider") &&
      (localThreats > 0 || Math.random() < 0.72);

    if (shouldSummon) {
      summonUnitFor(room, "hider", hider);
      continue;
    }

    if (hider.gold >= getIntelCost() * 0.8 && Math.random() < 0.22) {
      room.aggro += 2;
      hider.gold -= getIntelCost() * 0.28;
      pushLog(langText(`${room.label}의 생존자가 단말을 뒤졌습니다.`, `${room.label}'s hider rifled through the terminal.`));
    }
  }
}

function updateBlackout(dt) {
  game.blackoutTimer -= dt;
  if (!game.blackoutActive && game.blackoutTimer <= 0) {
    game.blackoutActive = true;
    game.blackoutDuration = 0;
    pushLog(langText("정전. 구역 전체가 어두워졌습니다.", "Blackout. The whole ward goes dark."));
    pulseShake(2.2);
    playUiTone(90, 0.4, "sawtooth", 0.05);
    showBanner(langText("정전", "Blackout"), langText("활성 방어 장치가 전부 멎었습니다.", "All active defenses are offline."), "crimson", 1.6);
    flashScreen("rgba(255, 86, 128, 0.18)", 0.45, 0.18);
  }

  if (game.blackoutActive) {
    game.blackoutDuration += dt;
    if (game.blackoutDuration > CONFIG.blackout.spawnAtSeconds) {
      spawnInfectedAt(world.generator.x, world.generator.y + 20, 2 + game.runProfile.modifiers.blackoutSpawnBonus);
      game.blackoutDuration = -999;
      pushLog(langText("어둠이 벽 속의 것들을 더 끌어냈습니다.", "The dark dragged more things out of the walls."));
      pulseShake(1.2);
    }
  }
}

function repairGenerator() {
  game.blackoutActive = false;
  game.blackoutTimer = rollBlackoutTimer();
  game.player.holdingRepair = 0;
  pushLog(langText("발전기 복구 완료. 방어 장치가 다시 살아났습니다.", "Generator repaired. Defenses are live again."));
  playUiTone(420, 0.14, "triangle", 0.04);
  showBanner(langText("전력 복구", "Power Restored"), langText("구역이 잠깐 숨을 쉽니다.", "The ward exhales for now."), "cyan", 1.4);
}

function updateMutation(dt) {
  const ownedRoom = getOwnedRoom();
  if (!ownedRoom) {
    return;
  }

  const inOwnedRoom = game.player.roomId === ownedRoom.id;
  if (inOwnedRoom) {
    const pressure =
      (1 + Math.min(CONFIG.mutation.maxPressureBonus, game.gold / CONFIG.mutation.goldPressureDivisor)) *
      game.runProfile.modifiers.mutationPressureMultiplier;
    game.mutationClock += dt * pressure;
  } else {
    game.mutationClock = Math.max(0, game.mutationClock - dt * 2);
  }

  if (!ownedRoom.breach && game.mutationClock > CONFIG.mutation.triggerClock * game.runProfile.modifiers.mutationThresholdMultiplier) {
    ownedRoom.breach = true;
    ownedRoom.aggro += 24;
    pushLog(langText("방이 찢어졌습니다. 무언가 옆길을 찾았습니다.", "The room split open. Something found a side path."));
    pulseShake(1.6);
    playUiTone(150, 0.22, "sawtooth", 0.04);
  }

  if (ownedRoom.breach) {
    ownedRoom.breachTimer -= dt;
    if (ownedRoom.breachTimer <= 0) {
      spawnInfectedAt(ownedRoom.x + ownedRoom.w - 38, ownedRoom.y + ownedRoom.h / 2, 1);
      ownedRoom.breachTimer = randomRange(14, 22) * game.runProfile.modifiers.breachIntervalMultiplier;
      pushLog(langText("균열이 또 다른 감염체를 방 안에 토해냈습니다.", "A breach spat another infected into your room."));
      pulseShake(1.1);
    }
  }
}

function updateUnits(dt) {
  for (let i = game.units.length - 1; i >= 0; i -= 1) {
    const unit = game.units[i];
    const unitRoom = getRoomById(unit.roomId);
    unit.cooldown -= dt;

    if (unit.type === "husk") {
      unit.life -= dt;
      const target = nearestEnemy(unit, 80);
      if (unit.life <= 0 || target) {
        explodeAt(unit.x, unit.y, 56, 32);
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
    const damage = unit.type === "relic" ? 24 : unit.type === "rover" ? 13 : targetNearDoor ? 14 : 10;
    target.hp -= damage;
    spawnImpact(target.x, target.y, unit.type === "relic" ? "violet" : "cyan", unit.type === "relic" ? 1.35 : 0.85, 10);
    spawnTracer(unit.x, unit.y, target.x, target.y, unit.type === "relic" ? "violet" : "cyan");
    if (unit.type === "relic") {
      for (const extra of game.infected) {
        if (extra !== target && distance(extra, target) < 80) {
          extra.hp -= 10;
          spawnImpact(extra.x, extra.y, "violet", 0.8, 8);
        }
      }
      if (game.hunter && distance(unit, game.hunter) < 150) {
        game.hunter.speed = Math.max(CONFIG.hunter.baseSpeed, game.hunter.speed - 12);
      }
    }
    unit.cooldown = unit.type === "relic" ? 1.15 : unit.type === "rover" ? 0.42 : targetNearDoor ? 0.56 : 0.8;
  }

  game.infected = game.infected.filter((enemy) => enemy.hp > 0);
  if (game.hunter.hp <= 0) {
    game.hunter.hp = hunterMaxHp();
    game.hunter.x = 590;
    game.hunter.y = 310;
    pushLog(langText("술래가 홀에서 다시 형체를 만들었습니다.", "The hunter reformed in the hall."));
    pulseShake(1.8);
    playUiTone(110, 0.28, "triangle", 0.035);
  }
}

function updateHunter(dt) {
  const hunter = game.hunter;
  hunter.level = 1 + Math.floor(game.time / 55) + Math.floor(game.fragments / 2) + countBreaches();
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
    hunter.retargetTimer = 0.8;
  }

  hunter.skillCooldown -= dt;
  if (hunter.skillCooldown <= 0) {
    castHunterSkill();
    const skillProfile = HUNTER_SKILLS[game.runProfile.hunter.id];
    hunter.skillCooldown = randomRange(skillProfile.cooldownMin, skillProfile.cooldownMax);
  }

  moveEntityWithPath(hunter, hunter.targetX, hunter.targetY, hunter.speed * dt);
  handleHunterDoorDamage();
  handleHunterAttacks();
}

function castHunterSkill() {
  const ownedRoom = getOwnedRoom();
  const hunterType = game.runProfile.hunter.id;
  if (!ownedRoom) {
    return;
  }

  if (hunterType === "stalker") {
    const anchor = game.player.roomId === ownedRoom.id
      ? { x: clamp(game.player.x - 40, ownedRoom.x + 26, ownedRoom.x + ownedRoom.w - 26), y: clamp(game.player.y + 24, ownedRoom.y + 26, ownedRoom.y + ownedRoom.h - 26) }
      : { x: ownedRoom.door.centerX - 18, y: ownedRoom.door.centerY + 24 };
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
    const slamRoom = getRoomById(game.hunter.targetRoomId) || ownedRoom;
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
    const spawnPoint = ownedRoom.breach
      ? { x: ownedRoom.x + ownedRoom.w - 30, y: ownedRoom.y + ownedRoom.h / 2 }
      : { x: ownedRoom.door.centerX, y: ownedRoom.door.centerY };
    spawnInfectedAt(spawnPoint.x, spawnPoint.y, 2 + game.runProfile.modifiers.blackoutSpawnBonus);
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
  let nextMode = "stalk";
  if (game.blackoutActive) {
    nextMode = "rush";
  }
  if (ownedRoom) {
    const doorHealthRatio = ownedRoom.door.maxHp > 0 ? ownedRoom.door.hp / ownedRoom.door.maxHp : 0;
    const defenders = game.units.filter((unit) => unit.roomId === ownedRoom.id && unit.type !== "husk").length;
    if (ownedRoom.breach || game.player.hp < 38) {
      nextMode = "enrage";
    } else if (ownedRoom.door.closed && !ownedRoom.door.broken && doorHealthRatio < 0.5) {
      nextMode = "siege";
    } else if (defenders >= 3) {
      nextMode = "rush";
    }
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
  return {
    stalk: { speed: 0.96, damage: 1, cooldown: 1 },
    siege: { speed: 0.88, damage: 1.35, cooldown: 0.8 },
    rush: { speed: 1.28, damage: 1.12, cooldown: 0.78 },
    enrage: { speed: 1.42, damage: 1.42, cooldown: 0.62 },
  }[game.hunter.mode];
}

function retargetHunter() {
  const ownedRoom = getOwnedRoom();
  const occupiedRooms = world.rooms.filter((room) => room.owner && room.owner !== "infected");
  let best = null;
  let bestScore = -Infinity;

  for (const room of occupiedRooms) {
    let score = room.aggro + randomRange(0, 8);
    if (room.id === ownedRoom?.id) {
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
    hunterSeekPoint(world.hall.x + world.hall.w / 2, world.hall.y + world.hall.h / 2);
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
    game.runProfile.modifiers.hunterDoorDamageMultiplier *
    game.runProfile.modifiers.hunterDamageMultiplier;
  room.door.hp -= damage;
  spawnImpact(room.door.centerX, room.door.centerY, "crimson", 1.05, 12);
  if (room.door.thorns) {
    game.hunter.hp = (game.hunter.hp || hunterMaxHp()) - 8;
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
  const room = world.rooms.find((entry) => entry.id === game.hunter.targetRoomId);
  if (!room) {
    return;
  }

  if (room.owner === "player") {
    if (distance(game.hunter, game.player) < 24 && game.hunter.attackCooldown <= 0) {
      const mode = hunterModeProfile();
      game.hunter.attackCooldown = 0.65 * mode.cooldown;
      game.player.hp -=
        (CONFIG.hunter.basePlayerDamage + game.hunter.level * CONFIG.hunter.playerDamagePerLevel) *
        mode.damage *
        game.runProfile.modifiers.hunterPlayerDamageMultiplier *
        game.runProfile.modifiers.hunterDamageMultiplier;
      game.player.lastDamageSource = "hunter";
      pulseShake(1.25);
      playUiTone(150, 0.08, "square", 0.04);
      spawnImpact(game.player.x, game.player.y, "crimson", 1.4, 16);
      spawnSlash(game.hunter.x, game.hunter.y, game.player.x, game.player.y, "crimson");
    }
    return;
  }

  const hider = game.hiders.find((entry) => entry.roomId === room.id && entry.alive);
  if (hider && distance(game.hunter, hider) < 24 && game.hunter.attackCooldown <= 0) {
    game.hunter.attackCooldown = 1.1;
    hider.alive = false;
    room.owner = "infected";
    room.occupied = false;
    spawnInfectedAt(room.bed.x, room.bed.y, 3);
    pushLog(langText(`${room.label}이 함락됐습니다. 또 한 명이 감염됐습니다.`, `${room.label} fell. Another hider turned.`));
    pulseShake(1.1);
  }
}

function updateInfected(dt) {
  for (const enemy of game.infected) {
    const target = pickInfectedTarget(enemy);
    moveEntityWithPath(enemy, target.x, target.y, enemy.speed * dt);

    const ownedRoom = getOwnedRoom();
    if (
      ownedRoom &&
      ownedRoom.door.closed &&
      !ownedRoom.door.broken &&
      distance(enemy, { x: ownedRoom.door.centerX, y: ownedRoom.door.centerY }) < 20
    ) {
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = 1.1;
        ownedRoom.door.hp -= CONFIG.infected.doorDamage * game.runProfile.modifiers.infectedDamageMultiplier;
        spawnImpact(ownedRoom.door.centerX, ownedRoom.door.centerY, "amber", 0.7, 8);
        if (ownedRoom.door.hp <= 0) {
          ownedRoom.door.hp = 0;
          ownedRoom.door.broken = true;
          ownedRoom.door.closed = false;
          pushLog(langText("감염체가 문을 씹어 뚫었습니다.", "Infected chewed through your door."));
          pulseShake(1.4);
          playUiTone(150, 0.16, "sawtooth", 0.04);
        }
      }
    } else {
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    }

    if (distance(enemy, game.player) < 18) {
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = 1;
        game.player.hp -= CONFIG.infected.playerDamage * game.runProfile.modifiers.infectedDamageMultiplier;
        game.player.lastDamageSource = "infected";
        pulseShake(0.9);
        playUiTone(180, 0.06, "square", 0.03);
        spawnImpact(game.player.x, game.player.y, "amber", 1.0, 10);
        spawnSlash(enemy.x, enemy.y, game.player.x, game.player.y, "amber");
      }
    }
  }
}

function pickInfectedTarget(enemy) {
  const ownedRoom = getOwnedRoom();
  if (!ownedRoom) {
    return game.player;
  }
  const enemyInsideOwnedRoom = pointInRect(enemy.x, enemy.y, ownedRoom);
  if (game.player.roomId === ownedRoom.id && !enemyInsideOwnedRoom && !ownedRoom.breach) {
    return { x: ownedRoom.door.centerX, y: ownedRoom.door.centerY };
  }
  if (distance(enemy, game.player) < 240) {
    return game.player;
  }
  if (!enemyInsideOwnedRoom && ownedRoom.door.closed && !ownedRoom.door.broken) {
    return { x: ownedRoom.door.centerX, y: ownedRoom.door.centerY };
  }
  return game.player;
}

function collectKeycards() {
  for (const keycard of world.keycards) {
    if (keycard.collected || !keycard.visible) {
      continue;
    }
    if (distance(game.player, keycard) < 18) {
      keycard.collected = true;
      game.keycardsCollected += 1;
      pushLog(langText(`${keycard.id} 확보.`, `Recovered ${keycard.id}.`));
      playUiTone(620, 0.12, "triangle", 0.045);
      showBanner(langText("시질 회수", "Sigil Recovered"), keycard.id, "gold", 1.15);
      if (game.fragments >= 6 && game.keycardsCollected >= 2) {
        world.exitRoom.gate.closed = false;
        pushLog(langText("서비스 게이트가 열렸습니다.", "The service gate unlocked."));
        pulseShake(2.1);
        playUiTone(760, 0.18, "triangle", 0.05);
        showBanner(langText("게이트 해금", "Gate Unlocked"), langText("지금 뛰지 않으면 여기 묻힙니다.", "Run now or be buried here."), "gold", 1.6);
        flashScreen("rgba(255, 211, 107, 0.24)", 0.48, 0.22);
      }
    }
  }
}

function spawnInfectedAt(x, y, count) {
  for (let index = 0; index < count; index += 1) {
    game.infected.push({
      x: x + randomRange(-18, 18),
      y: y + randomRange(-18, 18),
      radius: 11,
      hp: 26 * game.runProfile.modifiers.infectedHpMultiplier,
      speed: randomRange(72, 92) * game.runProfile.modifiers.infectedSpeedMultiplier,
      attackCooldown: 0,
    });
  }
}

function explodeAt(x, y, radius, damage) {
  const targets = [game.hunter, ...game.infected];
  for (const target of targets) {
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
  const waypoint = getNextWaypoint(entity.x, entity.y, x, y);
  if (waypoint) {
    moveTowardTarget(entity, waypoint.x, waypoint.y, amount);
    return;
  }
  moveTowardTarget(entity, x, y, amount);
}

function buildNavGraph(currentWorld) {
  const nodes = [];
  const pushNode = (id, x, y) => nodes.push({ id, x, y, links: [] });
  const link = (a, b) => {
    const from = nodes.find((node) => node.id === a);
    const to = nodes.find((node) => node.id === b);
    if (from && to) {
      from.links.push(b);
      to.links.push(a);
    }
  };

  pushNode("hallLeft", currentWorld.hall.x + 150, currentWorld.hall.y + currentWorld.hall.h / 2);
  pushNode("hallCenter", currentWorld.hall.x + currentWorld.hall.w / 2, currentWorld.hall.y + currentWorld.hall.h / 2);
  pushNode("hallRight", currentWorld.hall.x + currentWorld.hall.w - 120, currentWorld.hall.y + currentWorld.hall.h / 2);
  pushNode("exitConnector", currentWorld.exitConnector.x + currentWorld.exitConnector.w / 2, currentWorld.exitConnector.y + currentWorld.exitConnector.h / 2);
  pushNode("generatorConnector", currentWorld.generatorConnector.x + currentWorld.generatorConnector.w / 2, currentWorld.generatorConnector.y + currentWorld.generatorConnector.h / 2);

  link("hallLeft", "hallCenter");
  link("hallCenter", "hallRight");
  link("hallRight", "exitConnector");
  link("hallRight", "generatorConnector");

  for (const room of currentWorld.rooms) {
    const doorId = `${room.id}Door`;
    const roomId = `${room.id}Room`;
    pushNode(doorId, room.door.centerX, room.door.centerY + (room.y < currentWorld.hall.y ? 28 : -28));
    pushNode(roomId, room.x + room.w / 2, room.y + room.h / 2);
    const hub = room.door.centerX < currentWorld.hall.x + currentWorld.hall.w / 3
      ? "hallLeft"
      : room.door.centerX < currentWorld.hall.x + (currentWorld.hall.w * 2) / 3
        ? "hallCenter"
        : "hallRight";
    link(hub, doorId);
    link(doorId, roomId);
  }

  pushNode("generatorDoor", currentWorld.generatorRoom.door.centerX, currentWorld.generatorRoom.door.centerY - 30);
  pushNode("generatorRoom", currentWorld.generatorRoom.x + currentWorld.generatorRoom.w / 2, currentWorld.generatorRoom.y + currentWorld.generatorRoom.h / 2);
  pushNode("exitDoor", currentWorld.exitRoom.gate.centerX + 34, currentWorld.exitRoom.gate.centerY);
  pushNode("exitRoom", currentWorld.exitRoom.x + currentWorld.exitRoom.w / 2, currentWorld.exitRoom.y + currentWorld.exitRoom.h / 2);

  link("generatorConnector", "generatorDoor");
  link("generatorDoor", "generatorRoom");
  link("exitConnector", "exitDoor");
  link("exitDoor", "exitRoom");

  return nodes;
}

function getNextWaypoint(fromX, fromY, targetX, targetY) {
  const start = nearestNavNode(fromX, fromY);
  const goal = nearestNavNode(targetX, targetY);
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

function nearestNavNode(x, y) {
  let chosen = null;
  let bestDistance = Infinity;
  for (const node of navGraph) {
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
  if (canMoveTo(nextX, entity.y, entity.radius)) {
    entity.x = nextX;
  }
  const nextY = entity.y + dy;
  if (canMoveTo(entity.x, nextY, entity.radius)) {
    entity.y = nextY;
  }
}

function canMoveTo(x, y, radius) {
  if (!world.zones.some((zone) => pointInRect(x, y, zone))) {
    return false;
  }

  const colliders = [...world.barriers];
  for (const room of world.rooms) {
    if (room.door.closed && !room.door.broken) {
      colliders.push(room.door);
    }
  }
  if (world.exitRoom.gate.closed) {
    colliders.push(world.exitRoom.gate);
  }

  return !colliders.some((rect) => circleIntersectsRect(x, y, radius, rect));
}

function draw() {
  drawBackdrop();
  ctx.save();
  const shakeX = (Math.random() - 0.5) * state.screenShake * 10;
  const shakeY = (Math.random() - 0.5) * state.screenShake * 10;
  ctx.translate(shakeX, shakeY);
  drawAtmosphere();
  drawZones();
  drawThreatOverlay();
  drawKeycards();
  drawAfterimages();
  drawUnits();
  drawActors();
  drawDoors();
  drawEffects();
  drawHudMap();
  drawLighting();
  ctx.restore();
  drawBanner();
  drawFlashOverlay();
  drawMessageOverlay();
}

function drawBackdrop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#140d1c");
  gradient.addColorStop(0.45, "#08111d");
  gradient.addColorStop(1, "#04070c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const bloom = ctx.createRadialGradient(
    WIDTH * 0.74,
    HEIGHT * 0.1,
    20,
    WIDTH * 0.74,
    HEIGHT * 0.1,
    340,
  );
  bloom.addColorStop(0, "rgba(255, 74, 126, 0.2)");
  bloom.addColorStop(1, "rgba(255, 74, 126, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const blueBloom = ctx.createRadialGradient(
    WIDTH * 0.2,
    HEIGHT * 0.85,
    20,
    WIDTH * 0.2,
    HEIGHT * 0.85,
    420,
  );
  blueBloom.addColorStop(0, "rgba(91, 186, 255, 0.16)");
  blueBloom.addColorStop(1, "rgba(91, 186, 255, 0)");
  ctx.fillStyle = blueBloom;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawSpeedLines(dangerLevel() * 0.22);
}

function drawAtmosphere() {
  const time = game.time;
  const danger = dangerLevel();

  ctx.save();
  for (let i = 0; i < 4; i += 1) {
    const y = 110 + i * 170 + Math.sin(time * 0.22 + i) * 18;
    const x = ((time * (18 + i * 6)) % (WIDTH + 340)) - 220;
    const fog = ctx.createLinearGradient(x, y, x + 260, y + 40);
    fog.addColorStop(0, "rgba(130, 176, 255, 0)");
    fog.addColorStop(0.5, `rgba(130, 176, 255, ${0.035 + danger * 0.03})`);
    fog.addColorStop(1, "rgba(130, 176, 255, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(x, y, 320, 54);
  }

  for (let i = 0; i < 24; i += 1) {
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
  for (const zone of world.zones) {
    const fill = zone.id === "hall" ? "#131a28" : "#111827";
    ctx.fillStyle = fill;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    for (let offset = -zone.h; offset < zone.w; offset += 18) {
      ctx.fillRect(zone.x + offset, zone.y, 6, zone.h);
    }
  }

  ctx.strokeStyle = "rgba(166, 204, 255, 0.16)";
  ctx.lineWidth = 2.5;
  for (const zone of world.zones) {
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
  }

  for (const room of world.rooms) {
    drawCelOrb(room.bed.x, room.bed.y, room.bed.radius, colors.bed, "#e6fdff", 0.18);
    drawCelOrb(room.altar.x, room.altar.y, room.altar.radius, colors.altar, "#ffd0b8", 0.12);
    drawCelOrb(room.terminal.x, room.terminal.y, room.terminal.radius, colors.terminal, "#b8efff", 0.12);

    if (room.owner === "player") {
      ctx.strokeStyle = "rgba(133, 216, 255, 0.8)";
      ctx.lineWidth = 3.5;
      ctx.strokeRect(room.x + 4, room.y + 4, room.w - 8, room.h - 8);
    }

    if (room.breach) {
      ctx.fillStyle = "rgba(255, 92, 132, 0.34)";
      ctx.fillRect(room.x + room.w - 12, room.y + room.h / 2 - 30, 12, 60);
    }

    ctx.fillStyle = room.owner === "player" ? "#f5fbff" : "rgba(230, 236, 255, 0.54)";
    ctx.font = "700 13px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText(room.label.toUpperCase(), room.x + 14, room.y + 22);
  }

  drawCelOrb(world.generator.x, world.generator.y, world.generator.radius, colors.generator, "#f8f7bf", 0.15);
  drawCelOrb(world.exitRoom.x + 68, world.exitRoom.y + 70, 24, colors.exit, "#ddf5ff", 0.15);
}

function drawKeycards() {
  for (const keycard of world.keycards) {
    if (!keycard.visible || keycard.collected) {
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
    const color = colors[unit.type];
    const bob = Math.sin(game.time * 2.8 + unit.x * 0.02 + unit.y * 0.01) * 3;
    const radius = unit.type === "relic" ? 13 : 11;
    drawShadow(unit.x, unit.y + 12, radius + 6, 0.18);
    drawCelOrb(unit.x, unit.y + bob, radius, color, "#ffffff", unit.type === "relic" ? 0.28 : 0.14);
    if (unit.role === "anchor") {
      drawPulseRing(unit.x, unit.y + bob, radius + 10, "rgba(133, 216, 255, 0.18)");
    } else if (unit.role === "interceptor") {
      drawPulseRing(unit.x, unit.y + bob, radius + 8 + Math.sin(game.time * 6 + unit.x) * 2, "rgba(185, 239, 170, 0.18)");
    }
    if (unit.type === "relic") {
      drawPulseRing(unit.x, unit.y + bob, 18 + Math.sin(game.time * 3.6 + unit.x) * 2, "rgba(212, 149, 255, 0.28)");
    }
  }
}

function drawActors() {
  drawCharacter(game.player, "player");
  drawCharacter(game.hunter, "hunter");

  for (const hider of game.hiders) {
    if (!hider.alive) {
      continue;
    }
    drawCharacter(hider, "hider");
  }

  for (const enemy of game.infected) {
    drawCharacter(enemy, "infected");
  }
}

function drawDoors() {
  for (const room of world.rooms) {
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
      ctx.fillRect(room.door.x, room.door.y - 10, room.door.w, 4);
      ctx.fillStyle = room.door.curse ? "#ff77a8" : "#8fe9c7";
      ctx.fillRect(room.door.x, room.door.y - 10, room.door.w * hpPct, 4);
    }
    ctx.restore();
  }

  ctx.fillStyle = world.exitRoom.gate.closed ? "#634646" : "#3d6e63";
  ctx.fillRect(world.exitRoom.gate.x, world.exitRoom.gate.y, world.exitRoom.gate.w, world.exitRoom.gate.h);
}

function drawLighting() {
  ctx.save();
  const danger = dangerLevel();
  const flicker = game.blackoutActive ? 0.06 + Math.sin(game.time * 17) * 0.03 : Math.sin(game.time * 4.2) * 0.012;
  ctx.fillStyle = game.blackoutActive
    ? `rgba(3, 4, 10, ${0.82 + danger * 0.08 + flicker})`
    : `rgba(2, 4, 9, ${0.68 + danger * 0.06 + flicker})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalCompositeOperation = "destination-out";

  const playerLightRadius = 168 + Math.sin(game.time * 5.4) * 6;
  const playerLight = ctx.createRadialGradient(game.player.x, game.player.y, 24, game.player.x, game.player.y, playerLightRadius);
  playerLight.addColorStop(0, "rgba(0, 0, 0, 0.92)");
  playerLight.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = playerLight;
  ctx.beginPath();
  ctx.arc(game.player.x, game.player.y, playerLightRadius, 0, Math.PI * 2);
  ctx.fill();

  if (!game.blackoutActive) {
    const ownedRoom = getOwnedRoom();
    if (ownedRoom) {
      const roomLight = ctx.createRadialGradient(
        ownedRoom.x + ownedRoom.w / 2,
        ownedRoom.y + ownedRoom.h / 2,
        50,
        ownedRoom.x + ownedRoom.w / 2,
        ownedRoom.y + ownedRoom.h / 2,
        150 + Math.sin(game.time * 2.5) * 5,
      );
      roomLight.addColorStop(0, "rgba(0, 0, 0, 0.4)");
      roomLight.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = roomLight;
      ctx.beginPath();
      ctx.arc(ownedRoom.x + ownedRoom.w / 2, ownedRoom.y + ownedRoom.h / 2, 150, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (game.radarTime > 0) {
    for (const enemy of [game.hunter, ...game.infected]) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 40, 0, Math.PI * 2);
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

  const mapScale = 0.2;
  const ox = panel.x + 12;
  const oy = panel.y + 34;
  const revealTier = game.fragments >= 6 ? 3 : game.fragments >= 4 ? 2 : game.fragments >= 2 ? 1 : 0;

  const shownZones = world.zones.filter((zone) => {
    if (revealTier === 3) {
      return true;
    }
    if (revealTier === 2) {
      return zone.id !== "exit";
    }
    if (revealTier === 1) {
      return zone.id === "hall" || zone.id === "generator" || zone.id === getOwnedRoom()?.id;
    }
    return zone.id === getOwnedRoom()?.id || zone.id === "hall";
  });

  for (const zone of shownZones) {
    ctx.fillStyle = "rgba(112, 139, 133, 0.6)";
    ctx.fillRect(ox + zone.x * mapScale, oy + zone.y * mapScale, zone.w * mapScale, zone.h * mapScale);
  }

  ctx.fillStyle = "#dbece1";
  ctx.beginPath();
  ctx.arc(ox + game.player.x * mapScale, oy + game.player.y * mapScale, 4, 0, Math.PI * 2);
  ctx.fill();

  if (game.radarTime > 0) {
    ctx.fillStyle = "#ff7e7e";
    for (const enemy of [game.hunter, ...game.infected]) {
      ctx.beginPath();
      ctx.arc(ox + enemy.x * mapScale, oy + enemy.y * mapScale, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (game.compassTime > 0 && game.fragments >= 6) {
    ctx.strokeStyle = "#ffd36b";
    ctx.beginPath();
    ctx.moveTo(panel.x + panel.w - 58, panel.y + 42);
    ctx.lineTo(panel.x + panel.w - 24, panel.y + 42);
    ctx.lineTo(panel.x + panel.w - 34, panel.y + 30);
    ctx.moveTo(panel.x + panel.w - 24, panel.y + 42);
    ctx.lineTo(panel.x + panel.w - 34, panel.y + 54);
    ctx.stroke();
    ctx.fillStyle = "#ffd36b";
    ctx.fillText(langText("탈출", "Exit"), panel.x + panel.w - 58, panel.y + 72);
  }
}

function drawMessageOverlay() {
  if (game.phase === "running") {
    return;
  }
  ctx.fillStyle = "rgba(5, 8, 9, 0.68)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = game.phase === "escaped" ? "#8fe9c7" : "#ff8a8a";
  ctx.font = "700 52px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(game.phase === "escaped" ? langText("탈출 성공", "You Escaped") : langText("런 실패", "Run Failed"), WIDTH / 2, HEIGHT / 2 - 20);
  ctx.fillStyle = "#e7efe8";
  ctx.font = "700 20px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillText(state.outcomeText || langText("다시 시작을 눌러 새 런을 시작하세요.", "Press Restart Run to begin again."), WIDTH / 2, HEIGHT / 2 + 18);
  ctx.font = "700 16px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  ctx.fillStyle = "rgba(231, 239, 248, 0.78)";
  ctx.fillText(langText("다시 시작을 눌러 새 런을 시작하세요.", "Press Restart Run to begin again."), WIDTH / 2, HEIGHT / 2 + 50);
  ctx.textAlign = "left";
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
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 2.3);
  glowGradient.addColorStop(0, `rgba(255, 255, 255, ${glow})`);
  glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(20, 23, 34, 0.95)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x - radius * 0.22, y - radius * 0.25, radius * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.globalAlpha = 0.34;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawCharacter(entity, kind) {
  const palette = {
    player: { fill: colors.player, rim: "#ffffff", glow: 0.16, accent: "#85d8ff" },
    hunter: { fill: colors.hunter, rim: "#ffd0d8", glow: 0.3, accent: "#ff6f95" },
    hider: { fill: colors.hider, rim: "#ffffff", glow: 0.12, accent: "#85d8ff" },
    infected: { fill: colors.infected, rim: "#ffd6b5", glow: 0.16, accent: "#ffb464" },
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
    ctx.strokeStyle = "rgba(133, 216, 255, 0.95)";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(drawX, drawY, radius + 9 + Math.sin(game.time * 3.8) * 1.4, 0, Math.PI * 2);
    ctx.stroke();
    drawPulseRing(drawX, drawY, radius + 15 + Math.sin(game.time * 4.8) * 2, "rgba(133, 216, 255, 0.18)");
    ctx.fillStyle = "#f5fbff";
    ctx.font = "700 12px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
    ctx.fillText(t("player_tag"), drawX - 10, drawY - radius - 14);
    ctx.restore();
  } else if (kind === "hunter") {
    drawPulseRing(drawX, drawY, radius + 18 + Math.sin(game.time * 6.4) * 3, "rgba(255, 92, 132, 0.16)");
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
    ctx.beginPath();
    ctx.moveTo(-radius * 0.75, -radius * 0.2);
    ctx.lineTo(0, -radius);
    ctx.lineTo(radius * 0.75, -radius * 0.2);
    ctx.lineTo(radius * 0.25, radius * 0.95);
    ctx.lineTo(-radius * 0.25, radius * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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
  const shadow = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
  shadow.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
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
  const danger = dangerLevel();
  if (danger < 0.12 && game.suppressionTime <= 0) {
    return;
  }

  const alpha = clamp(danger * 0.55 + (game.suppressionTime > 0 ? 0.18 : 0), 0, 0.55);
  const pulse = 1 + Math.sin(game.time * 8) * 0.08;
  ctx.fillStyle = game.suppressionTime > 0 ? `rgba(187, 122, 255, ${alpha})` : `rgba(255, 62, 116, ${alpha})`;
  ctx.fillRect(24, HEIGHT - 72, 240 * pulse, 28);
  ctx.fillStyle = "#fff3f8";
  ctx.font = "700 16px 'Avenir Next Condensed', 'BIZ UDPGothic', sans-serif";
  const label = game.suppressionTime > 0
    ? langText("억제 장막", "SUPPRESSION FIELD")
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
  let level = 0;
  level += game.blackoutActive ? 0.38 : 0;
  level += countBreaches() * 0.14;
  level += Math.min(0.28, game.infected.length * 0.04);
  level += game.player.hp < 40 ? 0.18 : 0;
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
    life: duration,
    maxLife: duration,
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
    alpha,
    maxAlpha: alpha,
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
  const danger = dangerLevel();
  if (danger < 0.08) {
    return;
  }

  const actors = [
    { entity: game.player, color: "rgba(133, 216, 255, 0.1)" },
    { entity: game.hunter, color: "rgba(255, 90, 140, 0.16)" },
  ];

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

function renderHud() {
  const ownedRoom = getOwnedRoom();
  const stats = [
    [t("stat_health"), `${Math.ceil(game.player.hp)} / ${game.player.maxHp}`, game.player.hp < 30 ? "danger" : ""],
    [t("stat_gold"), `${Math.floor(game.gold)}`, "gold"],
    [t("stat_time"), formatTime(game.time), ""],
    [t("stat_movement"), t(`movement_${state.movementMode}`), ""],
    [t("stat_admin"), state.adminMode ? "ON" : "OFF", state.adminMode ? "gold" : ""],
    [t("stat_room"), ownedRoom ? ownedRoom.label : t("room_none"), ""],
    [t("stat_hunter"), localize(game.runProfile.hunter.label), "danger"],
    [t("stat_boon"), localize(game.runProfile.boon.label), "gold"],
    [t("stat_omen"), localize(game.runProfile.omen.label), "danger"],
    [t("stat_fragments"), `${game.fragments} / 6`, ""],
    [t("stat_sigils"), `${game.keycardsCollected} / 2`, ""],
    [t("stat_blackout"), game.blackoutActive ? langText("활성", "ACTIVE") : `${Math.ceil(game.blackoutTimer)}s`, game.blackoutActive ? "danger" : ""],
  ];

  statsEl.innerHTML = stats
    .map(
      ([label, value, className]) =>
        `<div class="stat-row"><span>${label}</span><strong class="${className}">${value}</strong></div>`,
    )
    .join("");

  const metaRows = [
    [t("meta_runs"), String(state.meta.runs)],
    [t("meta_escapes"), String(state.meta.escapes)],
    [t("meta_bestTime"), formatTime(state.meta.bestTime)],
    [t("meta_shards"), String(state.meta.shards)],
    [t("meta_unlock"), getUnlockSummary(state.meta)],
  ];

  metaEl.innerHTML = metaRows
    .map(([label, value]) => `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  const ownedObjective = !ownedRoom
    ? t("objective_findRoom")
    : game.fragments < 6
      ? t("objective_fragments")
      : game.keycardsCollected < 2
        ? t("objective_sigils")
        : t("objective_escape");

  objectiveEl.textContent = ownedObjective;

  const prompt = getPrompt();
  promptEl.textContent = prompt ? prompt.text : t("prompt_none");
  if (game.suppressionTime > 0) {
    helpText.textContent = langText(
      `억제 장막 ${game.suppressionTime.toFixed(1)}초 남음. 수호자들이 멈췄습니다.`,
      `Suppression field ${game.suppressionTime.toFixed(1)}s remaining. Guardians are stalled.`,
    );
  } else if (state.paused) {
    helpText.textContent = langText("정지 중입니다. 계속 버튼이나 Esc/P로 복귀하세요.", "Paused. Resume with the button or Esc/P.");
  } else {
    helpText.textContent = t("helpText");
  }

  logEl.innerHTML = state.logs
    .slice(-8)
    .reverse()
    .map(
      (entry) =>
        `<div class="log-entry"><span class="log-time">${entry.time}</span><span>${entry.text}</span></div>`,
    )
    .join("");
}

function pushLog(text) {
  state.logs.push({ time: formatTime(game.time), text });
  renderHud();
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
  const beforeTier = computeUnlockTier(state.meta.shards || 0);
  const timeBonus = Math.min(3, Math.floor(game.time / 75));
  const shardsEarned = escaped
    ? CONFIG.meta.shardEscapeBase + timeBonus
    : CONFIG.meta.shardFailBase + Math.min(2, Math.floor(game.time / 90));
  state.meta.shards = (state.meta.shards || 0) + shardsEarned;
  state.meta.unlockTier = computeUnlockTier(state.meta.shards);
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
      return { runs: 0, escapes: 0, bestTime: 0, shards: 0, unlockTier: 0 };
    }
    const parsed = JSON.parse(raw);
    const shards = parsed.shards || 0;
    return {
      runs: parsed.runs || 0,
      escapes: parsed.escapes || 0,
      bestTime: parsed.bestTime || 0,
      shards,
      unlockTier: computeUnlockTier(shards),
    };
  } catch {
    return { runs: 0, escapes: 0, bestTime: 0, shards: 0, unlockTier: 0 };
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
  state.screenShake = Math.max(state.screenShake, amount);
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
  const { context, ambient } = state.audio;
  const now = context.currentTime;
  const danger = dangerLevel();
  const pausedFactor = state.paused || state.titleVisible ? 0.25 : 1;
  const suppressionFactor = game.suppressionTime > 0 ? 0.18 : 0;
  const targetGain = state.audio.muted ? 0.0001 : (0.012 + danger * 0.028 + suppressionFactor) * pausedFactor;
  const targetFilter = game.blackoutActive ? 260 : 380 + danger * 260;
  const droneFreq = 54 + danger * 14 + (game.blackoutActive ? 6 : 0);
  const shimmerFreq = 118 + danger * 22 + (game.suppressionTime > 0 ? 20 : 0);

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

function saveMutePreference(muted) {
  try {
    localStorage.setItem("night-shift-escape-muted", muted ? "1" : "0");
  } catch {}
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.lastFrame) / 1000);
  state.lastFrame = now;
  update(dt);
  updateAmbientAudio();
  draw();
  renderHud();
  requestAnimationFrame(loop);
}

if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
  state.movementMode = "click";
}

applyStaticText();
pushLog(langText("빈 방을 점거하고, 운을 뚫으며 탈출하세요.", "Find a vacant room, then build enough luck to escape."));
announceRunSetup();
requestAnimationFrame(loop);
