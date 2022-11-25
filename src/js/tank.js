const tank_state = { destroy: 0, normal: 1 };
const tank_faction_position = {
  red: { x: 0, y: 0 },
  blue: { x: 0, y: 50 },
  green: { x: 0, y: 103 },
  yellow: { x: 0, y: 155 },
};

export class Tank {
  /**
   * @param {Number} x 横坐标
   * @param {Number} y 纵坐标
   * @param {Number} tank_angle 坦克角度
   * @param {Number} cannon_angle 炮塔角度
   * @param {String} tank_color 坦克颜色 [red, blue, yellow, green]
   * @param {Number} faction 队伍 [0，1，2，3]
   * @param {Boolean} is_player 是否是玩家控制，默认true
   * @author: Banana
   */
  constructor(
    x,
    y,
    tank_angle,
    cannon_angle,
    tank_color,
    faction,
    is_player = true
  ) {
    this.x = x;
    this.y = y;
    this.tank_angle = tank_angle;
    this.cannon_angle = cannon_angle;
    this.faction = faction;

    this.tank_color = tank_faction_position[tank_color] ? tank_color : "red";
    console.log("tank_color :>> ", this.tank_color);

    this.tank_state = tank_state.normal;
    this.adjust_radar_speed = Math.PI / 2;
    this.adjust_cannon_speed = Math.PI / 2; // 一秒旋转炮塔45°
    this.largest_cannon_speed = 3;
    this.move_speed = 1;
    this.recent_launch_time = 0;
    this.draw();
  }
  draw() {
    const canvas = window.game_canvas.canvas;
    const ctx = window.game_canvas.ctx;
    const square_width = window.game_canvas.square_width;
    const square_height = window.game_canvas.square_height;

    console.log("square width and height:>> ", square_width, square_height);
    ctx.beginPath();
    // 坦克
    ctx.drawImage(
      window.tank_img,
      tank_faction_position[this.tank_color].x,
      tank_faction_position[this.tank_color].y,
      50,
      45,
      this.x,
      this.y,
      square_width,
      square_height
    );
    // ctx.translate((square_width / 2)-5, square_height / 2);

    //炮管
    ctx.drawImage(
      window.tank_img,
      0,
      210,
      50,
      45,
      this.x,
      this.y + square_height / 2,
      square_width,
      square_height
    );

    ctx.closePath();
  }
  move(second) {
    this.x += this.move_speed * second;
  }
  collision_detection(func) {
    let direction = "";
    // ...
    return func(direction);
  }
  search_enemy(func) {
    let angle = 0;
    let distance = 10;
    // ...
    return func(angle, distance);
  }
}
