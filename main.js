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
};

let app = {
  data() {
    return {
      config: {
        ratio: 1,
        margin: 0.1,
        grid: 4,
        seed: (100000000 * Math.random()).toFixed(0),
        title: "Bingo",
        color: utils.randomColor(),
      },
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
      this.config.seed = (100000000 * Math.random()).toFixed(0);
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

      utils.strokeGrid(
        ctx,
        (width - gridSize) / 2,
        (height - gridSize) * (this.config.title ? 2 / 3 : 1 / 2),
        gridSize,
        gridSize,
        parseInt(this.config.grid),
        parseInt(this.config.grid)
      );

      ctx.lineWidth = gridSize * 0.01;

      ctx.strokeRect(
        (width - gridSize) / 2,
        (height - gridSize) * (this.config.title ? 2 / 3 : 1 / 2),
        gridSize,
        gridSize
      );

      if (this.config.title) {
        ctx.font = `bold ${gridSize * 0.1}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.config.color;
        ctx.fillText(this.config.title, width / 2, (height - gridSize) / 3);
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
