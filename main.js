/* exported app */

const utils = {
  strokeGrid(ctx, x, y, w, h, cols, rows) {
    ctx.beginPath();
    for (let c = 1; c < cols; c++) {
      ctx.moveTo(Math.round(x + (w / cols) * c), y);
      ctx.lineTo(Math.round(x + (w / cols) * c), y + h);
    }
    for (let r = 1; r < rows; r++) {
      ctx.moveTo(x, Math.round(y + (h / rows) * r));
      ctx.lineTo(x + w, Math.round(y + (h / rows) * r));
    }
    ctx.rect(x, y, w, h);
    ctx.stroke();
  },
  fitText(ctx, x, y, w, h, txt) {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 100px serif";

    let totalSize = 0;
    const spaceSize = ctx.measureText(" ").width;

    const words = txt.split(" ").map((word) => {
      const size = ctx.measureText(word).width;
      if (totalSize > 0) {
        totalSize += spaceSize;
      }
      totalSize += size;
      return {
        text: word,
        size: size,
      };
    });

    const lines = words.map((word, i) => {
      const targetLineCount = i + 1;
      const targetSize = totalSize / targetLineCount;
      let text = [];
      let lineSize = 0;
      let maxSize = 0;
      let lineCount = 0;
      words.forEach((word, j) => {
        if (lineSize == 0 || lineSize + spaceSize + word.size > targetSize) {
          lineCount += 1;
          text.push(word.text);
          lineSize = word.size;
        } else {
          text[text.length - 1] += " " + word.text;
          lineSize += spaceSize + word.size;
        }
        maxSize = Math.max(maxSize, lineSize);
      });
      return {
        lineCount: lineCount,
        text: text,
        width: maxSize,
        height: 110 * text.length,
        scale: 1 / Math.max(maxSize / w, (110 * text.length) / h),
      };
    });

    lines.sort((w1, w2) => w2.scale - w1.scale);

    const targetSplit = lines[0];
    const targetFontSize = 100 * targetSplit.scale;
    const targetLineHeight = targetFontSize * 1.1;

    ctx.font = `bold ${targetFontSize}px serif`;

    targetSplit.text.forEach((line, i) => {
      ctx.fillText(
        line,
        x + w / 2,
        y +
          (h - targetSplit.height * targetSplit.scale) / 2 +
          targetLineHeight * i +
          (targetLineHeight - targetFontSize) / 2
      );
    });
  },
  randomColor() {
    return ("#" + Math.floor(Math.random() * 16777215).toString(16)).padEnd(
      7,
      "0"
    );
  },
  randomSeed() {
    return (Math.random() * 2 ** 32) >>> 0;
  },
  splitmix32(a) {
    return function () {
      a |= 0;
      a = (a + 0x9e3779b9) | 0;
      let t = a ^ (a >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
  },
  shuffleSeeded(array, seed) {
    array = array.slice();
    const prng = utils.splitmix32(seed);
    for (let _ = 0; _ < array.length * 4; _++) {
      const i1 = Math.floor(prng() * array.length);
      const i2 = Math.floor(prng() * array.length);
      const tmp = array[i2];
      array[i2] = array[i1];
      array[i1] = tmp;
    }
    return array;
  },
};

let app = {
  data() {
    return {
      config: {
        ratio: 1,
        margin: 0.1,
        grid: 4,
        seed: utils.randomSeed(),
        title: "",
        color: utils.randomColor(),
      },
      data: "",
    };
  },
  computed: {},
  watch: {
    config: {
      handler() {
        this.draw();
      },
      deep: true,
    },
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
      this.draw();
    },
    newSeed() {
      this.config.seed = utils.randomSeed();
      this.draw();
    },
    newColor() {
      this.config.color = utils.randomColor();
      this.draw();
    },
    draw() {
      const ctx = this.$refs.canvas?.getContext("2d");
      if (!ctx) {
        return;
      }

      const height = window.innerHeight;
      const width = height / parseFloat(this.config.ratio);

      this.$refs.canvas.height = height;
      this.$refs.canvas.width = width;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "white";

      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = this.config.color + "33";

      ctx.fillRect(0, 0, width, height);

      const margin = parseFloat(this.config.margin);
      const gridSize = Math.min(
        (1 - margin * 2) * width,
        (1 - margin * 2) * height
      );

      ctx.lineJoin = "miter";

      ctx.strokeStyle = this.config.color;

      ctx.lineWidth = gridSize * 0.005;

      const startX = (width - gridSize) / 2;
      const startY = (height - gridSize) * (this.config.title ? 2 / 3 : 1 / 2);

      const columns = parseInt(this.config.grid);

      utils.strokeGrid(
        ctx,
        startX,
        startY,
        gridSize,
        gridSize,
        columns,
        columns
      );

      ctx.lineWidth = gridSize * 0.01;

      ctx.strokeRect(startX, startY, gridSize, gridSize);

      ctx.fillStyle = this.config.color;

      if (this.config.title) {
        utils.fitText(
          ctx,
          startX,
          (height - gridSize) / 4,
          gridSize,
          (height - gridSize) / 3,
          this.config.title
        );
      }

      if (this.data.trim().length) {
        const rawData = this.data.trim().split("\n");

        const targetSize =
          parseInt(this.config.grid) * parseInt(this.config.grid);

        const data = utils.shuffleSeeded(
          rawData.concat(
            Array(Math.max(0, targetSize - rawData.length)).fill("")
          ),
          parseInt(this.config.seed)
        );
        const cellSize = gridSize / columns;
        const cellMargin = cellSize * 0.05;

        console.log(data.length);

        for (
          let index = 0;
          index < Math.min(targetSize, data.length);
          index++
        ) {
          const element = data[index];
          if (element) {
            const x = index % columns;
            const y = Math.floor(index / columns);
            utils.fitText(
              ctx,
              startX + x * cellSize + cellMargin,
              startY + y * cellSize + cellMargin,
              cellSize - cellMargin * 2,
              cellSize - cellMargin * 2,
              element
            );
          }
        }
      }

      ctx.font = `bold ${gridSize * 0.02}px sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = this.config.color + "44";
      ctx.fillText(
        "clement-gouin.github.io/bingo",
        width * 0.99,
        height * 0.99
      );
    },
  },
  mounted: function () {
    console.log("app mounted");
    setTimeout(this.showApp);
    addEventListener("resize", this.draw);
  },
};

window.onload = () => {
  app = Vue.createApp(app);
  app.mount("#app");
};
