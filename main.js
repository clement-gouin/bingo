/* exported app */

const utils = {
  strokeGrid(ctx, x, y, w, h, cols, rows) {
    ctx.beginPath();
    for (let c = 0; c < cols + 1; c++) {
      ctx.moveTo(Math.round(x + (w / cols) * c), y);
      ctx.lineTo(Math.round(x + (w / cols) * c), y + h);
    }
    for (let r = 0; r < rows + 1; r++) {
      ctx.moveTo(x, Math.round(y + (h / rows) * r));
      ctx.lineTo(x + w, Math.round(y + (h / rows) * r));
    }
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
};

let app = {
  data() {
    return {};
  },
  computed: {},
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
      this.draw();
    },
    draw() {
      const ctx = this.$refs.canvas?.getContext("2d");
      if (!ctx) {
        return;
      }
      utils.strokeGrid(ctx, 2, 2, 398, 398, 5, 5);
      utils.fitText(
        ctx,
        3,
        3,
        79,
        79,
        "This is a very long text, I hope this fits well"
      );
    },
  },
  mounted: function () {
    console.log("app mounted");
    setTimeout(this.showApp);
  },
};

window.onload = () => {
  app = Vue.createApp(app);
  app.mount("#app");
};
