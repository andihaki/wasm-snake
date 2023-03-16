import init, { World, Direction, GameStatus } from "snake_game";
import { rnd } from "./utils/rnd";

const CELL_SIZE = 10;
const WORLD_WIDTH = 8;

init().then((wasm: { memory: { buffer: ArrayBufferLike } }) => {
  const snakeSpawnIdx = rnd(WORLD_WIDTH * WORLD_WIDTH);
  const world = World.new(WORLD_WIDTH, snakeSpawnIdx);
  const worldWidth = world.width();

  const gameStatus = document.querySelector("#game-status");
  const points = document.querySelector("#points");
  const gameControlBtn = document.querySelector("#game-control-btn");
  const canvas: HTMLCanvasElement = document.querySelector("#snake-canvas");
  const ctx = canvas.getContext("2d");

  canvas.height = worldWidth * CELL_SIZE;
  canvas.width = worldWidth * CELL_SIZE;

  gameControlBtn.addEventListener("click", (_) => {
    const status = world.game_status();
    if (status === undefined) {
      gameControlBtn.textContent = "Playing...";
      world.start_game();
      play();
    } else {
      location.reload();
    }
  });

  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowRight": {
        world.change_snake_dir(Direction.Right);
        break;
      }
      case "ArrowLeft": {
        world.change_snake_dir(Direction.Left);
        break;
      }
      case "ArrowDown": {
        world.change_snake_dir(Direction.Down);
        break;
      }
      case "ArrowUp": {
        world.change_snake_dir(Direction.Up);
        break;
      }
      // default: {
      //   break;
      // }
    }
  });

  const drawWorld = () => {
    ctx.beginPath();

    for (let rowX = 0; rowX < worldWidth + 1; rowX++) {
      ctx.moveTo(CELL_SIZE * rowX, 0);
      ctx.lineTo(CELL_SIZE * rowX, worldWidth * CELL_SIZE);
    }

    for (let colY = 0; colY < worldWidth + 1; colY++) {
      ctx.moveTo(0, CELL_SIZE * colY);
      ctx.lineTo(CELL_SIZE * worldWidth, colY * CELL_SIZE);
    }

    ctx.stroke();
  };

  const drawReward = () => {
    const index = world.reward_cell();
    const col = index % worldWidth;
    const row = Math.floor(index / worldWidth);

    ctx.beginPath();
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.stroke();

    // if (index === 1000) {
    //   alert("hore");
    // }
  };

  const drawSnake = () => {
    // const snakeIdx = world.snake_head_idx();
    const snakeCells = new Uint32Array(
      wasm.memory.buffer,
      world.snake_cells(),
      world.snake_length()
    );

    snakeCells
      .slice()
      .reverse()
      .forEach((cellIdx, idx) => {
        const col = cellIdx % worldWidth;
        const row = Math.floor(cellIdx / worldWidth);

        // we are overriding snake head color by body when we crush
        ctx.fillStyle = idx === snakeCells.length - 1 ? "#7878db" : "#000000";

        ctx.beginPath();
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

    ctx.stroke();
  };

  const drawGameStatus = () => {
    gameStatus.textContent = world.game_status_text();
    points.textContent = world.points().toString();
  };

  const paint = () => {
    drawWorld();
    drawSnake();
    drawReward();
    drawGameStatus();
  };

  const play = () => {
    const status = world.game_status();
    if (status === GameStatus.Won || status === GameStatus.Lost) {
      gameControlBtn.textContent = "Replay";
      return;
    }
    console.log("playing!");
    const fps = 3;
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      world.step();
      paint();
      requestAnimationFrame(play);
    }, 1000 / fps);
  };

  paint();
});
