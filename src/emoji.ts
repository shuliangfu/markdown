/**
 * @module emoji
 *
 * Emoji 简码支持模块
 */

// ============================================================================
// Emoji 映射表
// ============================================================================

/**
 * 常用 Emoji 映射表
 *
 * 支持 300+ 常用 emoji 简码
 */
export const EMOJI_MAP: Record<string, string> = {
  // 表情
  smile: "😄",
  laughing: "😆",
  blush: "😊",
  smiley: "😃",
  relaxed: "☺️",
  smirk: "😏",
  heart_eyes: "😍",
  kissing_heart: "😘",
  kissing_closed_eyes: "😚",
  flushed: "😳",
  relieved: "😌",
  satisfied: "😆",
  grin: "😁",
  wink: "😉",
  stuck_out_tongue_winking_eye: "😜",
  stuck_out_tongue_closed_eyes: "😝",
  grinning: "😀",
  kissing: "😗",
  kissing_smiling_eyes: "😙",
  stuck_out_tongue: "😛",
  sleeping: "😴",
  worried: "😟",
  frowning: "😦",
  anguished: "😧",
  open_mouth: "😮",
  grimacing: "😬",
  confused: "😕",
  hushed: "😯",
  expressionless: "😑",
  unamused: "😒",
  sweat_smile: "😅",
  sweat: "😓",
  disappointed_relieved: "😥",
  weary: "😩",
  pensive: "😔",
  disappointed: "😞",
  confounded: "😖",
  fearful: "😨",
  cold_sweat: "😰",
  persevere: "😣",
  cry: "😢",
  sob: "😭",
  joy: "😂",
  astonished: "😲",
  scream: "😱",
  tired_face: "😫",
  angry: "😠",
  rage: "😡",
  triumph: "😤",
  sleepy: "😪",
  yum: "😋",
  mask: "😷",
  sunglasses: "😎",
  dizzy_face: "😵",
  imp: "👿",
  smiling_imp: "😈",
  neutral_face: "😐",
  no_mouth: "😶",
  innocent: "😇",
  alien: "👽",

  // 手势
  "+1": "👍",
  thumbsup: "👍",
  "-1": "👎",
  thumbsdown: "👎",
  ok_hand: "👌",
  punch: "👊",
  fist: "✊",
  v: "✌️",
  wave: "👋",
  hand: "✋",
  open_hands: "👐",
  point_up: "☝️",
  point_down: "👇",
  point_left: "👈",
  point_right: "👉",
  raised_hands: "🙌",
  pray: "🙏",
  clap: "👏",
  muscle: "💪",

  // 心形
  heart: "❤️",
  yellow_heart: "💛",
  green_heart: "💚",
  blue_heart: "💙",
  purple_heart: "💜",
  broken_heart: "💔",
  heartbeat: "💓",
  heartpulse: "💗",
  two_hearts: "💕",
  sparkling_heart: "💖",

  // 符号
  star: "⭐",
  star2: "🌟",
  sparkles: "✨",
  zap: "⚡",
  fire: "🔥",
  boom: "💥",
  exclamation: "❗",
  question: "❓",
  grey_exclamation: "❕",
  grey_question: "❔",
  zzz: "💤",
  dash: "💨",
  sweat_drops: "💦",
  notes: "🎶",
  musical_note: "🎵",
  bulb: "💡",
  anger: "💢",
  bomb: "💣",
  speech_balloon: "💬",
  thought_balloon: "💭",

  // 天气/自然
  sunny: "☀️",
  umbrella: "☔",
  cloud: "☁️",
  snowflake: "❄️",
  snowman: "⛄",
  cyclone: "🌀",
  foggy: "🌁",
  rainbow: "🌈",
  ocean: "🌊",

  // 物品
  gift: "🎁",
  bell: "🔔",
  tada: "🎉",
  balloon: "🎈",
  crystal_ball: "🔮",
  cd: "💿",
  dvd: "📀",
  camera: "📷",
  movie_camera: "🎥",
  computer: "💻",
  tv: "📺",
  iphone: "📱",
  phone: "📞",
  telephone: "☎️",
  pager: "📟",
  fax: "📠",
  minidisc: "💽",
  vhs: "📼",
  battery: "🔋",
  electric_plug: "🔌",
  mag: "🔍",
  mag_right: "🔎",
  lock: "🔒",
  unlock: "🔓",
  key: "🔑",
  hammer: "🔨",
  gun: "🔫",
  wrench: "🔧",
  nut_and_bolt: "🔩",
  link: "🔗",
  pill: "💊",
  syringe: "💉",
  moneybag: "💰",
  dollar: "💵",
  euro: "💶",
  yen: "💴",
  credit_card: "💳",
  money_with_wings: "💸",
  email: "📧",
  inbox_tray: "📥",
  outbox_tray: "📤",
  envelope: "✉️",
  incoming_envelope: "📨",
  postal_horn: "📯",
  mailbox: "📫",
  mailbox_closed: "📪",
  mailbox_with_mail: "📬",
  mailbox_with_no_mail: "📭",
  package: "📦",
  memo: "📝",
  page_facing_up: "📄",
  page_with_curl: "📃",
  bookmark_tabs: "📑",
  bar_chart: "📊",
  chart_with_upwards_trend: "📈",
  chart_with_downwards_trend: "📉",
  scroll: "📜",
  clipboard: "📋",
  calendar: "📆",
  date: "📅",
  card_index: "📇",
  file_folder: "📁",
  open_file_folder: "📂",
  scissors: "✂️",
  pushpin: "📌",
  paperclip: "📎",
  black_nib: "✒️",
  pencil2: "✏️",
  straight_ruler: "📏",
  triangular_ruler: "📐",
  book: "📖",
  closed_book: "📕",
  green_book: "📗",
  blue_book: "📘",
  orange_book: "📙",
  open_book: "📖",
  notebook: "📓",
  notebook_with_decorative_cover: "📔",
  ledger: "📒",
  books: "📚",
  bookmark: "🔖",
  name_badge: "📛",
  microscope: "🔬",
  telescope: "🔭",
  newspaper: "📰",
  art: "🎨",
  clapper: "🎬",
  microphone: "🎤",
  headphones: "🎧",

  // 动物
  dog: "🐶",
  cat: "🐱",
  mouse: "🐭",
  hamster: "🐹",
  rabbit: "🐰",
  wolf: "🐺",
  frog: "🐸",
  tiger: "🐯",
  koala: "🐨",
  bear: "🐻",
  pig: "🐷",
  cow: "🐮",
  boar: "🐗",
  monkey_face: "🐵",
  monkey: "🐒",
  horse: "🐴",
  sheep: "🐑",
  elephant: "🐘",
  panda_face: "🐼",
  penguin: "🐧",
  bird: "🐦",
  baby_chick: "🐤",
  hatched_chick: "🐥",
  hatching_chick: "🐣",
  chicken: "🐔",
  snake: "🐍",
  turtle: "🐢",
  bug: "🐛",
  bee: "🐝",
  ant: "🐜",
  beetle: "🐞",
  snail: "🐌",
  octopus: "🐙",
  shell: "🐚",
  tropical_fish: "🐠",
  fish: "🐟",
  whale: "🐳",
  whale2: "🐋",
  dolphin: "🐬",

  // 食物
  apple: "🍎",
  green_apple: "🍏",
  tangerine: "🍊",
  lemon: "🍋",
  cherries: "🍒",
  grapes: "🍇",
  watermelon: "🍉",
  strawberry: "🍓",
  peach: "🍑",
  melon: "🍈",
  banana: "🍌",
  pear: "🍐",
  pineapple: "🍍",
  tomato: "🍅",
  eggplant: "🍆",
  corn: "🌽",
  pizza: "🍕",
  hamburger: "🍔",
  fries: "🍟",
  poultry_leg: "🍗",
  meat_on_bone: "🍖",
  spaghetti: "🍝",
  curry: "🍛",
  fried_shrimp: "🍤",
  bento: "🍱",
  sushi: "🍣",
  rice_ball: "🍙",
  rice_cracker: "🍘",
  rice: "🍚",
  ramen: "🍜",
  stew: "🍲",
  oden: "🍢",
  dango: "🍡",
  egg: "🥚",
  bread: "🍞",
  doughnut: "🍩",
  custard: "🍮",
  icecream: "🍦",
  ice_cream: "🍨",
  shaved_ice: "🍧",
  birthday: "🎂",
  cake: "🍰",
  cookie: "🍪",
  chocolate_bar: "🍫",
  candy: "🍬",
  lollipop: "🍭",
  honey_pot: "🍯",
  beer: "🍺",
  beers: "🍻",
  wine_glass: "🍷",
  cocktail: "🍸",
  tropical_drink: "🍹",
  sake: "🍶",
  tea: "🍵",
  coffee: "☕",

  // 交通工具
  car: "🚗",
  taxi: "🚕",
  bus: "🚌",
  ambulance: "🚑",
  fire_engine: "🚒",
  police_car: "🚓",
  truck: "🚚",
  bike: "🚲",
  motorcycle: "🏍️",
  helicopter: "🚁",
  airplane: "✈️",
  rocket: "🚀",
  ship: "🚢",
  boat: "⛵",
  anchor: "⚓",

  // 建筑
  house: "🏠",
  office: "🏢",
  hospital: "🏥",
  bank: "🏦",
  hotel: "🏨",
  school: "🏫",
  church: "⛪",

  // 运动
  soccer: "⚽",
  basketball: "🏀",
  football: "🏈",
  baseball: "⚾",
  tennis: "🎾",
  golf: "⛳",
  trophy: "🏆",
  medal: "🏅",

  // 其他常用
  warning: "⚠️",
  construction: "🚧",
  no_entry: "⛔",
  check: "✅",
  x: "❌",
  o: "⭕",
  100: "💯",
  copyright: "©️",
  registered: "®️",
  tm: "™️",

  // 地球/世界
  globe: "🌐",
  globe_with_meridians: "🌐",
  world: "🌍",
  earth_africa: "🌍",
  earth_americas: "🌎",
  earth_asia: "🌏",

  // 符号别名
  collision: "💥",
  lightning: "⚡",
  lightbulb: "💡",
  idea: "💡",
  search: "🔍",

  // 科技/太空
  satellite: "🛰️",
  rocket_launch: "🚀",
  satellite_antenna: "📡",

  // 通讯/邮件
  e_mail: "📧",
  postbox: "📮",
  mailbox_open: "📬",
  megaphone: "📣",
  loudspeaker: "📢",
  inbox: "📥",
  outbox: "📤",

  // 标签/票据
  label: "🏷️",
  tag: "🏷️",
  ticket: "🎫",
  admission_tickets: "🎟️",
  receipt: "🧾",

  // 艺术/手工
  performing_arts: "🎭",
  palette: "🎨",
  thread: "🧵",
  yarn: "🧶",

  // 购物
  shopping_cart: "🛒",
  shopping_bags: "🛍️",
  package_box: "📦",

  // 办公用品
  chart: "📊",
  pin: "📍",
  round_pushpin: "📍",
  paperclips: "🖇️",
  card_file_box: "🗃️",
  file_cabinet: "🗄️",
  wastebasket: "🗑️",
  trash: "🗑️",
  spiral_notepad: "🗒️",
  spiral_calendar: "🗓️",
  ballot_box: "🗳️",

  // 猴子表情
  speak_no_evil: "🙊",
  see_no_evil: "🙈",
  hear_no_evil: "🙉",

  // 更多表情
  thinking: "🤔",
  thinking_face: "🤔",
  nerd: "🤓",
  nerd_face: "🤓",
  face_with_monocle: "🧐",
  partying_face: "🥳",
  speaking_head: "🗣️",
  right_anger_bubble: "🗯️",

  // 庆祝/礼物
  party: "🎉",
  confetti_ball: "🎊",
  ribbon: "🎀",
  wrapped_gift: "🎁",

  // 游戏/娱乐
  joystick: "🕹️",
  video_game: "🎮",
  game_die: "🎲",
  chess_pawn: "♟️",
  jigsaw: "🧩",
  puzzle: "🧩",
  teddy_bear: "🧸",
  cinema: "🎦",

  // 扑克牌
  spades: "♠️",
  diamonds: "♦️",
  clubs: "♣️",
  black_joker: "🃏",
  flower_playing_cards: "🎴",

  // 工具
  gear: "⚙️",
  hammer_and_wrench: "🛠️",
  tools: "🛠️",
  chains: "⛓️",
  magnet: "🧲",
  axe: "🪓",
  carpentry_saw: "🪚",
  screwdriver: "🪛",
  ladder: "🪜",

  // 科学/医疗
  test_tube: "🧪",
  petri_dish: "🧫",
  dna: "🧬",
  stethoscope: "🩺",

  // 家居
  door: "🚪",
  bed: "🛏️",
  couch: "🛋️",
  chair: "🪑",
  window: "🪟",
  mirror: "🪞",

  // 浴室
  toilet: "🚽",
  shower: "🚿",
  bathtub: "🛁",
  toothbrush: "🪥",
  soap: "🧼",
  lotion_bottle: "🧴",
  roll_of_paper: "🧻",
  potable_water: "🚰",

  // 清洁用品
  safety_pin: "🧷",
  broom: "🧹",
  basket: "🧺",
  bucket: "🪣",

  // 安全/武器
  old_key: "🗝️",
  lock_with_ink_pen: "🔏",
  closed_lock_with_key: "🔐",
  shield: "🛡️",
  crossed_swords: "⚔️",
  bow_and_arrow: "🏹",
  dagger: "🗡️",
  boomerang: "🪃",

  // 其他物品
  headstone: "🪦",
  placard: "🪧",

  // 方向/导航
  stop_sign: "🛑",
  end: "🔚",
  back: "🔙",
  on: "🔛",
  top: "🔝",
  soon: "🔜",

  // 按钮标签
  new: "🆕",
  free: "🆓",
  up: "🆙",
  cool: "🆒",
  ok: "🆗",
  ng: "🆖",
  information: "ℹ️",
  info: "ℹ️",

  // 字母/数字
  abc: "🔤",
  abcd: "🔡",
  symbols: "🔣",
  capital_abcd: "🔠",
  1234: "🔢",
  hash: "🔢",
  keycap_star: "✳️",
  asterisk: "✳️",

  // 媒体控制
  eject: "⏏️",
  arrow_forward: "▶️",
  pause_button: "⏸️",
  play_pause: "⏯️",
  stop_button: "⏹️",
  record_button: "⏺️",
  next_track: "⏭️",
  previous_track: "⏮️",
  fast_forward: "⏩",
  rewind: "⏪",
  repeat: "🔁",
  repeat_one: "🔂",
  shuffle: "🔀",

  // 亮度/信号
  low_brightness: "🔅",
  high_brightness: "🔆",
  signal_strength: "📶",
  vibration_mode: "📳",
  mobile_phone_off: "📴",

  // 特殊符号
  recycle: "♻️",
  infinity: "♾️",
  fleur_de_lis: "⚜️",
  trident: "🔱",
  beginner: "🔰",
  heavy_check_mark: "✔️",
  ballot_box_with_check: "☑️",
  radio_button: "🔘",

  // 时钟
  clock1: "🕐",
  clock2: "🕑",
  clock3: "🕒",
  clock4: "🕓",
  clock5: "🕔",
  clock6: "🕕",
  clock7: "🕖",
  clock8: "🕗",
  clock9: "🕘",
  clock10: "🕙",
  clock11: "🕚",
  clock12: "🕛",
  clock130: "🕜",
  clock230: "🕝",
  clock330: "🕞",
  clock430: "🕟",
  clock530: "🕠",
  clock630: "🕡",
  clock730: "🕢",
  clock830: "🕣",
  clock930: "🕤",
  clock1030: "🕥",
  clock1130: "🕦",
  clock1230: "🕧",

  // 圆圈颜色
  white_circle: "⚪",
  black_circle: "⚫",
  red_circle: "🔴",
  blue_circle: "🔵",
  orange_circle: "🟠",
  yellow_circle: "🟡",
  green_circle: "🟢",
  purple_circle: "🟣",
  brown_circle: "🟤",

  // 方块颜色
  red_square: "🟥",
  blue_square: "🟦",
  orange_square: "🟧",
  yellow_square: "🟨",
  green_square: "🟩",
  purple_square: "🟪",
  brown_square: "🟫",
  black_large_square: "⬛",
  white_large_square: "⬜",
  black_medium_square: "◼️",
  white_medium_square: "◻️",
  black_small_square: "▪️",
  white_small_square: "▫️",

  // 菱形/三角形
  large_orange_diamond: "🔶",
  large_blue_diamond: "🔷",
  small_orange_diamond: "🔸",
  small_blue_diamond: "🔹",
  small_red_triangle: "🔺",
  small_red_triangle_down: "🔻",
  diamond_shape_with_a_dot_inside: "💠",

  // 声音
  speaker: "🔈",
  mute: "🔇",
  sound: "🔉",
  loud_sound: "🔊",
  no_bell: "🔕",
};

// ============================================================================
// 设置别名
// ============================================================================

// 表情别名（无下划线版本）
EMOJI_MAP.hearteyes = EMOJI_MAP.heart_eyes;
EMOJI_MAP.heartbreak = EMOJI_MAP.broken_heart;
// thumbsup 和 thumbsdown 已在 EMOJI_MAP 中直接定义
EMOJI_MAP.stuckouttongue = EMOJI_MAP.stuck_out_tongue;

// 状态标记别名
EMOJI_MAP.whitecheckmark = EMOJI_MAP.check;
EMOJI_MAP.white_check_mark = EMOJI_MAP.check;
EMOJI_MAP.greencheck = EMOJI_MAP.check;
EMOJI_MAP.checkmark = EMOJI_MAP.check;
EMOJI_MAP.redx = EMOJI_MAP.x;
EMOJI_MAP.crossmark = EMOJI_MAP.x;

// 常用简写别名
EMOJI_MAP.ok = EMOJI_MAP.ok_hand;
EMOJI_MAP.info = EMOJI_MAP.information_source;
EMOJI_MAP.warn = EMOJI_MAP.warning;
EMOJI_MAP.danger = EMOJI_MAP.no_entry;
EMOJI_MAP.note = EMOJI_MAP.memo;
EMOJI_MAP.tip = EMOJI_MAP.bulb;
EMOJI_MAP.idea = EMOJI_MAP.bulb;

// 箭头别名
EMOJI_MAP.left = EMOJI_MAP.arrow_left;
EMOJI_MAP.right = EMOJI_MAP.arrow_right;
EMOJI_MAP.up = EMOJI_MAP.arrow_up;
EMOJI_MAP.down = EMOJI_MAP.arrow_down;

// 其他常用别名
EMOJI_MAP.happy = EMOJI_MAP.smile;
EMOJI_MAP.sad = EMOJI_MAP.cry;
EMOJI_MAP.love = EMOJI_MAP.heart;
EMOJI_MAP.like = EMOJI_MAP.thumbs_up;
EMOJI_MAP.dislike = EMOJI_MAP.thumbs_down;
EMOJI_MAP.yes = EMOJI_MAP.check;
EMOJI_MAP.no = EMOJI_MAP.x;
EMOJI_MAP.done = EMOJI_MAP.check;
EMOJI_MAP.todo = EMOJI_MAP.white_circle;
EMOJI_MAP.wip = EMOJI_MAP.construction;
EMOJI_MAP.bug = EMOJI_MAP.beetle;
EMOJI_MAP.fix = EMOJI_MAP.wrench;
EMOJI_MAP.new = EMOJI_MAP.sparkles;
EMOJI_MAP.update = EMOJI_MAP.pencil;
EMOJI_MAP.delete = EMOJI_MAP.wastebasket;
EMOJI_MAP.search = EMOJI_MAP.mag;
EMOJI_MAP.settings = EMOJI_MAP.gear;
EMOJI_MAP.config = EMOJI_MAP.gear;
EMOJI_MAP.docs = EMOJI_MAP.book;
EMOJI_MAP.doc = EMOJI_MAP.page_facing_up;
EMOJI_MAP.external = EMOJI_MAP.arrow_upper_right;
EMOJI_MAP.download = EMOJI_MAP.arrow_down;
EMOJI_MAP.upload = EMOJI_MAP.arrow_up;
EMOJI_MAP.save = EMOJI_MAP.floppy_disk;
EMOJI_MAP.edit = EMOJI_MAP.pencil;
EMOJI_MAP.copy = EMOJI_MAP.clipboard;
EMOJI_MAP.paste = EMOJI_MAP.clipboard;
EMOJI_MAP.cut = EMOJI_MAP.scissors;
EMOJI_MAP.undo = EMOJI_MAP.arrow_left;
EMOJI_MAP.redo = EMOJI_MAP.arrow_right;
EMOJI_MAP.refresh = EMOJI_MAP.arrows_counterclockwise;
EMOJI_MAP.sync = EMOJI_MAP.arrows_counterclockwise;
EMOJI_MAP.loading = EMOJI_MAP.hourglass;
EMOJI_MAP.wait = EMOJI_MAP.hourglass;
EMOJI_MAP.time = EMOJI_MAP.clock1;
EMOJI_MAP.date = EMOJI_MAP.calendar;
EMOJI_MAP.user = EMOJI_MAP.bust_in_silhouette;
EMOJI_MAP.users = EMOJI_MAP.busts_in_silhouette;
EMOJI_MAP.team = EMOJI_MAP.busts_in_silhouette;
EMOJI_MAP.home = EMOJI_MAP.house;
EMOJI_MAP.folder = EMOJI_MAP.file_folder;
EMOJI_MAP.file = EMOJI_MAP.page_facing_up;
EMOJI_MAP.code = EMOJI_MAP.computer;
EMOJI_MAP.terminal = EMOJI_MAP.desktop_computer;
EMOJI_MAP.web = EMOJI_MAP.globe_with_meridians;
EMOJI_MAP.api = EMOJI_MAP.electric_plug;
EMOJI_MAP.db = EMOJI_MAP.floppy_disk;
EMOJI_MAP.database = EMOJI_MAP.floppy_disk;
EMOJI_MAP.server = EMOJI_MAP.desktop_computer;
EMOJI_MAP.security = EMOJI_MAP.lock;
EMOJI_MAP.locked = EMOJI_MAP.lock;
EMOJI_MAP.unlocked = EMOJI_MAP.unlock;
EMOJI_MAP.password = EMOJI_MAP.key;
EMOJI_MAP.email = EMOJI_MAP.envelope;
EMOJI_MAP.mail = EMOJI_MAP.envelope;
EMOJI_MAP.send = EMOJI_MAP.envelope;
EMOJI_MAP.receive = EMOJI_MAP.inbox_tray;
EMOJI_MAP.inbox = EMOJI_MAP.inbox_tray;
EMOJI_MAP.outbox = EMOJI_MAP.outbox_tray;
EMOJI_MAP.chat = EMOJI_MAP.speech_balloon;
EMOJI_MAP.message = EMOJI_MAP.speech_balloon;
EMOJI_MAP.comment = EMOJI_MAP.speech_balloon;
EMOJI_MAP.notification = EMOJI_MAP.bell;
EMOJI_MAP.alert = EMOJI_MAP.bell;
EMOJI_MAP.sound = EMOJI_MAP.speaker;
EMOJI_MAP.play = EMOJI_MAP.arrow_forward;
EMOJI_MAP.pause = EMOJI_MAP.pause_button;
EMOJI_MAP.stop = EMOJI_MAP.stop_button;
EMOJI_MAP.record = EMOJI_MAP.red_circle;
EMOJI_MAP.video = EMOJI_MAP.video_camera;
EMOJI_MAP.image = EMOJI_MAP.framed_picture;
EMOJI_MAP.photo = EMOJI_MAP.camera;
EMOJI_MAP.music = EMOJI_MAP.musical_note;
EMOJI_MAP.audio = EMOJI_MAP.speaker;

// ============================================================================
// Emoji 函数
// ============================================================================

/**
 * 根据简码获取 Emoji
 *
 * @param name - Emoji 简码
 * @returns Emoji 字符或 undefined
 *
 * @example
 * ```typescript
 * getEmoji("smile"); // "😄"
 * getEmoji("heart"); // "❤️"
 * getEmoji("unknown"); // undefined
 * ```
 */
export function getEmoji(name: string): string | undefined {
  return EMOJI_MAP[name.toLowerCase()];
}

/**
 * 解析文本中的 Emoji 简码
 *
 * @param text - 包含 Emoji 简码的文本
 * @returns 替换后的文本
 *
 * @example
 * ```typescript
 * parseEmoji("Hello :smile:"); // "Hello 😄"
 * ```
 */
export function parseEmoji(text: string): string {
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, name) => {
    const emoji = getEmoji(name);
    return emoji || match;
  });
}
