module.exports.CANVAS_WIDTH = 1920;
module.exports.CANVAS_HEIGHT = 1080;

module.exports.EDGEBOARD_X = 126;
module.exports.EDGEBOARD_Y = 100;

module.exports.FPS = 60;
module.exports.FPS_TIME = 1000 / 60;
module.exports.DISABLE_SOUND_MOBILE = false;
module.exports.FONT_GAME = "Montserrat";
module.exports.PRIMARY_FONT_COLOR = "#fff";
module.exports.FONT_STROKE_COLOR = "rgba(0,0,0,0)";

module.exports.STATE_LOADING = 0;
module.exports.STATE_MENU = 1;
module.exports.STATE_GAME = 2;

module.exports.ON_MOUSE_DOWN = 0;
module.exports.ON_MOUSE_UP = 1;
module.exports.ON_MOUSE_OVER = 2;
module.exports.ON_MOUSE_OUT = 3;
module.exports.ON_BALL_INTO_HOLE = 4;
module.exports.ON_BALL_WITH_BALL = 5;
module.exports.ON_BALL_WITH_BANK = 6;
module.exports.ON_LOST = 7;
module.exports.ON_WON = 8;
module.exports.ON_RESTART = 9;
module.exports.ON_EXIT_GAME = 10;
module.exports.ON_SELECT_LANG = 11;

module.exports.SOUNDTRACK_VOLUME_DEFAULT = 1.0;
module.exports.SOUNDTRACK_VOLUME_IN_GAME = 0.1;

module.exports.GAME_MODE_EIGHT = 0;
module.exports.GAME_MODE_NINE = 1;
module.exports.GAME_MODE_TIME = 2;

module.exports.GAME_STATUS_READY = 0;
module.exports.GAME_STATUS_START = 1;
module.exports.GAME_STATUS_IDLE = 2;

module.exports.NEXT_PLAYER = "NEXT_PLAYER";
module.exports.GAME_STATUS = "GAME_STATUS";

module.exports.GAME_MODE_CPU = 0;
module.exports.GAME_MODE_TWO = 1;

module.exports.STATE_TABLE_PLACE_CUE_BALL_BREAKSHOT = 0;
module.exports.STATE_TABLE_PLACE_CUE_BALL = 1;
module.exports.STATE_TABLE_MOVE_STICK = 2;
module.exports.STATE_TABLE_SHOOT = 3;
module.exports.STATE_TABLE_SHOOTING = 4;

module.exports.COMMAND_STICK_MAX_SPEED = 5;
module.exports.COMMAND_STICK_SPEED_INCREMENT = 0.05;
module.exports.COMMAND_STICK_START_SPEED = 0.05;

module.exports.HAND_ANIM_NUM_FRAMES = 20;

module.exports.ON_CUE_PLACEABLE = 0;
module.exports.ON_CUE_NOT_PLACEABLE = 1;
module.exports.PREVISION_TRAJECTORY_COLORS = [
  ["#fff", "#f00"],
  ["#00f", "#f00"],
];

module.exports.EASY = 0;
module.exports.MEDIUM = 1;
module.exports.HARD = 2;
const GAME_DIFFICULTY_PARAMS = new Array();
GAME_DIFFICULTY_PARAMS[0] = [
  { max: 0.99, min: 0.9 },
  { max: 0.9, min: 0.85 },
  { max: 0.87, min: 0.8 },
  { max: 0.8, min: 0.75 },
  { max: 0.7, min: 0.6 },
];

GAME_DIFFICULTY_PARAMS[1] = [
  { max: 0.99, min: 0.95 },
  { max: 0.97, min: 0.93 },
  { max: 0.9, min: 0.87 },
  { max: 0.85, min: 0.8 },
  { max: 0.83, min: 0.8 },
];

GAME_DIFFICULTY_PARAMS[2] = [
  { max: 0.99, min: 0.99 },
  { max: 0.99, min: 0.97 },
  { max: 0.97, min: 0.95 },
  { max: 0.95, min: 0.93 },
  { max: 0.93, min: 0.9 },
];

module.exports.GAME_DIFFICULTY_PARAMS = GAME_DIFFICULTY_PARAMS;

module.exports.TABLE_CENTER;
module.exports.TABLE_CENTER_COORDINATE;
module.exports.FIELD_POINTS = [
  { x: 88, y: 46 }, // 0
  { x: 130, y: 81 }, // 1
  { x: 607, y: 81 }, // 2
  { x: 620, y: 32 }, // 3
  { x: 659, y: 32 }, // 4
  { x: 673, y: 81 }, // 5
  { x: 1150, y: 81 }, // 6
  { x: 1193, y: 44 }, // 7
  { x: 1226, y: 77 }, // 8
  { x: 1189, y: 121 }, // 9
  { x: 1189, y: 591 }, // 10
  { x: 1226, y: 636 }, // 11
  { x: 1193, y: 667 }, // 12
  { x: 1150, y: 631 }, // 13
  { x: 673, y: 631 }, // 14
  { x: 658, y: 679 }, // 15
  { x: 622, y: 679 }, // 16
  { x: 607, y: 631 }, // 17
  { x: 130, y: 631 }, // 18
  { x: 86, y: 665 }, // 19
  { x: 55, y: 635 }, // 20
  { x: 91, y: 592 }, // 21
  { x: 91, y: 114 }, // 22
  { x: 53, y: 74 }, // 23
];
/*
module.exports.FIELD_POINTS = [
                    {x:88,  y:46},// 0
                    {x:123, y:81},// 1
                    {x:614, y:81},// 2
                    {x:620, y:32},// 3
                    {x:659, y:32},// 4
                    {x:666, y:81},// 5
                    {x:1157,y:81},// 6
                    {x:1193,y:44},// 7
                    {x:1226,y:77},// 8
                    {x:1189,y:114},// 9
                    {x:1189,y:598},// 10
                    {x:1226,y:636},// 11
                    {x:1193,y:667},// 12
                    {x:1157,y:630},// 13
                    {x:666, y:630},// 14
                    {x:658, y:679},// 15
                    {x:622, y:679},// 16
                    {x:614, y:630},// 17
                    {x:123, y:630},// 18
                    {x:86,  y:665},// 19
                    {x:55,  y:635},// 20
                    {x:91,  y:599},// 21
                    {x:91,  y:114},// 22
                    {x:53,  y:74}// 23
            ];
*/
module.exports.HOLE_POINT_TO_DETECT = [
  // ID POINTS OF EDGE WHERE CLOSEST TO EDGE HOLE
  [1, 22][(2, 5)],
  [6, 9],
  [10, 13],
  [14, 17],
  [18, 21],
];

module.exports.HOLE_CENTER_POS = [
  { x: 95, y: 85 },
  { x: 640, y: 72 },
  { x: 1185, y: 88 },
  { x: 1185, y: 628 },
  { x: 640, y: 639 },
  { x: 95, y: 628 },
];

module.exports.HOLE_CPU_POINTS = [
  { x: 105, y: 97 },
  { x: 640, y: 80 },
  { x: 1173, y: 97 },
  { x: 1173, y: 613 },
  { x: 640, y: 632 },
  { x: 105, y: 613 },
];

module.exports.MAX_FORCE_PER_DISTANCE = 850;

module.exports.TABLE_UPPER_BUMPER = [
  { x: 366, y: 63, sprite: "bumper_top_left", regX: 2, regY: 0 },
  { x: 915, y: 63, sprite: "bumper_top_right", regX: 2, regY: 0 },
  { x: 1206, y: 356, sprite: "bumper_right", regX: 1, regY: 2 },
  { x: 915, y: 649, sprite: "bumper_bottom_right", regX: 2, regY: 1 },
  { x: 366, y: 649, sprite: "bumper_bottom_left", regX: 2, regY: 1 },
  { x: 74, y: 356, sprite: "bumper_left", regX: 0, regY: 2 },
];

module.exports.POS_RAIL_EXIT = { x: 250, y: 742 };
const OFFSET_X_RAILS = new Array();
OFFSET_X_RAILS[0] = 890;
OFFSET_X_RAILS[1] = 890;
OFFSET_X_RAILS[2] = 890;
module.exports.OFFSET_X_RAILS = OFFSET_X_RAILS;

module.exports.TIME_RAILS = 5000;
module.exports.CUE_BALL_HIT_AREA_DIMENSION = 100;

module.exports.ON_PRESS_DOWN_BALL = "mousedown";
module.exports.ON_PRESS_MOVE_BALL = "pressmove";
module.exports.ON_PRESS_UP_BALL = "pressup";

module.exports.POOL_HOLE_RADIUS = 30;
module.exports.DIST_BALL_HOLE = 66;
const BALL_DIAMETER = 28;
module.exports.BALL_DIAMETER = BALL_DIAMETER;
module.exports.BALL_DIAMETER_QUADRO = Math.pow(BALL_DIAMETER, 2);
const BALL_RADIUS = BALL_DIAMETER / 2;
module.exports.BALL_RADIUS = BALL_RADIUS;
module.exports.BALL_RADIUS_QUADRO = Math.pow(BALL_RADIUS, 2);
module.exports.BALL_NUMBER = 15;
module.exports.CUE_BALL_POS = { x: 357, y: 356 };
module.exports.CUE_BALL_RESPOT_1 = { x: 109, y: 102 };
module.exports.CUE_BALL_RESPOT_3 = { x: 1168, y: 616 };
module.exports.RACK_POS;
const STARTING_RACK_POS = new Array();
STARTING_RACK_POS[0] = [
  { x: 916, y: 356 },
  { x: 941, y: 370 },
  { x: 941, y: 342 },
  { x: 966, y: 384 },
  { x: 966, y: 356 }, //BALL 8
  { x: 966, y: 328 },
  { x: 991, y: 398 },
  { x: 991, y: 370 },
  { x: 991, y: 342 },
  { x: 991, y: 314 },
  { x: 1016, y: 412 },
  { x: 1016, y: 384 },
  { x: 1016, y: 356 },
  { x: 1016, y: 328 },
  { x: 1016, y: 300 },
];

STARTING_RACK_POS[1] = [
  { x: 916, y: 356 },
  { x: 949, y: 376 },
  { x: 949, y: 335 },
  { x: 982, y: 396 },
  { x: 982, y: 356 },
  { x: 982, y: 316 },
  { x: 1015, y: 376 },
  { x: 1015, y: 335 },
  { x: 1048, y: 356 },
];

STARTING_RACK_POS[2] = [
  { x: 916, y: 356 },
  { x: 949, y: 376 },
  { x: 949, y: 335 },
  { x: 982, y: 396 },
  { x: 982, y: 356 },
  { x: 982, y: 316 },
  { x: 1015, y: 416 },
  { x: 1015, y: 376 },
  { x: 1015, y: 335 },
  { x: 1015, y: 295 },
  { x: 1048, y: 436 },
  { x: 1048, y: 396 },
  { x: 1048, y: 356 },
  { x: 1048, y: 316 },
  { x: 1048, y: 276 },
];
module.exports.STARTING_RACK_POS = STARTING_RACK_POS;
module.exports.TABLE_CENTER = { x: 640, y: 347.5 };

var Rectangle = function (x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.contains = function (a, b, c, d) {
    return (
      (c = c || 0),
      (d = d || 0),
      a >= this.x &&
        a + c <= this.x + this.width &&
        b >= this.y &&
        b + d <= this.y + this.height
    );
  };
};
module.exports.RECT_COLLISION = new Rectangle(124, 117, 1037, 483);
module.exports.MAX_SPIN_VALUE = 50;
module.exports.K_IMPACT_BALL = 0.97;
module.exports.K_FRICTION = 0.985;
module.exports.K_MIN_FORCE = 0.016;
module.exports.MAX_POWER_SHOT = 200;
module.exports.MIN_POWER_SHOT = 10;
module.exports.MAX_POWER_FORCE_BALL = 40;

module.exports.MAX_BACK_SPIN_CUE_FORCE = 3;

module.exports.MAIN_TABLE_EDGE = [1, 5, 9, 13, 17, 21];

//THREE JS
module.exports.BALL_3D_DIAMETER = BALL_DIAMETER;
module.exports.TEXTURE_NAME = [
  { path: "sprites/textures/ball_0.jpg", name: "cue_ball" },
  { path: "sprites/textures/ball_1.jpg", name: "ball_1" },
  { path: "sprites/textures/ball_2.jpg", name: "ball_2" },
  { path: "sprites/textures/ball_3.jpg", name: "ball_3" },
  { path: "sprites/textures/ball_4.jpg", name: "ball_4" },
  { path: "sprites/textures/ball_5.jpg", name: "ball_5" },
  { path: "sprites/textures/ball_6.jpg", name: "ball_6" },
  { path: "sprites/textures/ball_7.jpg", name: "ball_7" },
  { path: "sprites/textures/ball_8.jpg", name: "ball_8" },
  { path: "sprites/textures/ball_9.jpg", name: "ball_9" },
  { path: "sprites/textures/ball_10.jpg", name: "ball_10" },
  { path: "sprites/textures/ball_11.jpg", name: "ball_11" },
  { path: "sprites/textures/ball_12.jpg", name: "ball_12" },
  { path: "sprites/textures/ball_13.jpg", name: "ball_13" },
  { path: "sprites/textures/ball_14.jpg", name: "ball_14" },
  { path: "sprites/textures/ball_15.jpg", name: "ball_15" },
];

module.exports.BALL_Z_POSITION = 50;
module.exports.DAMPING_BALL_EFFECT = 0.9;

//DEBUG
module.exports.DEBUG_SHOW_2D_SPRITE = false;
module.exports.DEBUG_SHOW_TABLE_CENTER_SHAPE = false;
module.exports.DEBUG_SHOW_HOLE_CENTER_POS_SHAPE = false;
module.exports.DEBUG_SHOW_EDGE_TABLE = false;
module.exports.DEBUG_SHOW_RECT_COLLISION = false;
module.exports.DEBUG_SHOW_CPU_BALL_TRAJECTORY = false;
module.exports.DEBUG_SHOW_PREDICT_TRAJECTORY_COLLISION = false;
module.exports.SHOW_TRAJECTORY_UNSUCCESSFUL_SHOTS = false;

module.exports.TIME_ANIMATION_SHOT_ELASTIC = 1500;
module.exports.TIME_ANIMATION_SHOT_BACK = 300;
module.exports.ADD_POINT_RATIO_EVERY_SHOT_EDGE_COLLISION = 1;

module.exports.ENABLE_FULLSCREEN;
module.exports.ENABLE_CHECK_ORIENTATION;
module.exports.POINTS_FOR_BALL_POT = 0;
module.exports.POINTS_FOR_FAULT;

module.exports.NUM_LANGUAGES = 7;
module.exports.LANG_EN = 0;
module.exports.LANG_ES = 1;
module.exports.LANG_FR = 2;
module.exports.LANG_DE = 3;
module.exports.LANG_PT = 4;
module.exports.LANG_IT = 5;
module.exports.LANG_RU = 6;
const LANG_CODES = {};
LANG_CODES["en"] = this.LANG_EN;
LANG_CODES["es"] = this.LANG_ES;
LANG_CODES["fr"] = this.LANG_FR;
LANG_CODES["de"] = this.LANG_DE;
LANG_CODES["pt"] = this.LANG_PT;
LANG_CODES["it"] = this.LANG_IT;
LANG_CODES["ru"] = this.LANG_RU;
module.exports.LANG_CODES = LANG_CODES;
