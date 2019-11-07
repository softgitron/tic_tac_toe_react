// Checking table defined by x and y slope pairs
const CHECK_TABLE = [[1, 0], [0, 1], [1, 1], [1, -1]]
// Define how many markins in the row are needed
const NEEDED_COUNT = 5;
// Define how many free spaces there should be
const FREE_AT_LEAST = 3;

export function check_status(tics_and_toes, x, y) {
  // Check winner from x and y position
  // Check left and right, up and down and diagonal directions based on check table
  for (let check = 0; check < CHECK_TABLE.length; check++) {
    let first = check_lines(tics_and_toes, x, y, CHECK_TABLE[check][0], CHECK_TABLE[check][1]);
    let second = check_lines(tics_and_toes, x, y, -CHECK_TABLE[check][0], -CHECK_TABLE[check][1]);
    // If there is at least needed count return immidiately
    if (first + second - 1 >= NEEDED_COUNT) {
      return true;
    }
  }
  return false;
}


function check_lines(tics_and_toes, start_x, start_y, direction_x, direction_y) {
  // Check lines using basic analytical math
  // Return line lenght
  let mark = tics_and_toes[start_x][start_y];
  let x_size = tics_and_toes.length;
  let y_size = tics_and_toes[0].length;
  let x;
  let y;
  let count
  for (count = 1; count < NEEDED_COUNT; count++) {
    x = start_x + direction_x * count;
    y = start_y + direction_y * count;
    // Check have we reatched edge
    if (x < 0 || x >= x_size || y < 0 || y >= y_size) {
      break;
    }
    if (tics_and_toes[x][y] !== mark) {
      // If found different mark break and return length
      break;
    }

  }
  return count;
}

export function update_table(tics_and_toes, x_start, y_start) {
  // If the last tick or toe came closer than three spaces to edge
  // Generate more space to that side
  let x_size = tics_and_toes.length;
  let y_size = tics_and_toes[0].length;
  let more = 0;
  // Generate space left
  if (x_start < FREE_AT_LEAST) {
    more = FREE_AT_LEAST - x_start
    for (let x = 0; x < more; x++) {
      tics_and_toes.unshift(new Array(y_size).fill(null));
    }
    x_start++;
  }
  // In case should be expanded to two or more directions
  x_size = tics_and_toes.length;
  // Generate space right
  if (x_size - x_start <= FREE_AT_LEAST) {
    more = FREE_AT_LEAST - (x_size - x_start) + 1
    for (let x = 0; x < more; x++) {
      tics_and_toes.push(new Array(y_size).fill(null));
    }
  }
  // In case should be expanded to two directions
  x_size = tics_and_toes.length;
  // Generate space up
  if (y_start < FREE_AT_LEAST) {
    more = FREE_AT_LEAST - y_start
    for (let x = 0; x < x_size; x++) {
      for (let y = 0; y < more; y++) {
        tics_and_toes[x].unshift(null);
      }
    }
    y_start++;
  }
  // In case should be expanded to two or more directions
  y_size = tics_and_toes[0].length;
  // Generate space down
  if (y_size - y_start <= FREE_AT_LEAST) {
    more = FREE_AT_LEAST - (y_size - y_start) + 1
    for (let x = 0; x < x_size; x++) {
      for (let y = 0; y < more; y++) {
        tics_and_toes[x].push(null);
      }
    }
  }
  return tics_and_toes;
}