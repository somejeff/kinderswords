<template>
  <v-container>
    <p class="text-justify">Trace the word down the maze.</p>

    <v-row>
      <v-col cols="6" md="2" lg="2">
        <v-text-field
          label="Reproducible Set Number"
          v-model="seed"
          outlined
          dense
          append-icon="mdi-refresh"
          v-mask="'###############'"
          @click:append="random"
          hint="Enter a number to reproduce the same set of cards."
        ></v-text-field>
      </v-col>

      <v-col cols="6" md="2" lg="2">
        <v-label light>Path</v-label>
        <br />
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 h 50 v 50 h -50 Z" fill="transparent" stroke="black" />
          <path :d="pathPreview" fill="transparent" stroke="black" />
        </svg>
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="labelFont" :items="fonts" label="Label Font"></v-select>
      </v-col>

      <v-col cols="12" md="4">
        <v-btn-toggle v-model="casing" color="deep-purple accent-3" mandatory>
          <v-btn value="upper">Uppercase</v-btn>
          <v-btn value="lower">Lowercase</v-btn>
          <v-btn value="title">Titlecase</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4" lg="4">
        <v-select :items="words" v-model="selectedWord" label="Selected Word"></v-select>
      </v-col>
      <v-col cols="12" md="4" lg="4">
        <v-select v-model="valueFont" :items="fonts" label="Letters Font"></v-select>
      </v-col>
      <v-col cols="12" md="4" lg="4">
        <v-btn color="indigo" dark @click="execute">Create</v-btn>
        <br />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <iframe id="pdf" :src="url" type="application/pdf"></iframe>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import jsPDF from "jspdf";

import MersenneTwister from "mersenne-twister";
import { mask } from "vue-the-mask";
require("../plugins/fonts");

export default {
  directives: {
    mask
  },
  data() {
    return {
      url: null,
      selectedWord: "the",
      casing: "lower",
      fonts: Object.keys(new jsPDF().getFontList()).filter(
        f => f.toLowerCase() != f && !["ZapfDingbats", "Symbol"].includes(f)
      ),
      labelFont: "Comic Sans",
      valueFont: "Futura Book",
      seed: null,
      words: "a, and, away, big, blue, can, come, down, find, for, funny, go, help, here, I, in, is, it, jump, little, look, make, me, my, not, one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you, all, am, are, at, ate, be, black, brown, but, came, did, do, eat, four, get, good, have, he, into, like, must, new, no, now, on, our, out, please, pretty, ran, ride, saw, say, she, so, soon, that, there, they, this, too, under, want, was, well, went, what, white, who, will, with, yes".split(
          ", "
        ),
      currentPath: [],
      pathPreview: "",
      count: 1,
      bank: null
    };
  },
  mounted() {
    this.random();
  },
  methods: {
    createPath(mersenne) {
      let current = this.rand(mersenne, 0, 7);
      this.currentPath = [current, (current += 8)];
      while (current < 72) {
        let paths = [
          this.getDown(current),
          this.getRight(current),
          this.getLeft(current),
          this.getUp(current)
        ];
        paths = paths.filter(p => p != null);
        current = paths[this.rand(mersenne, 0, paths.length - 1)];
        this.currentPath.push(current);
      }
    },
    rand(mersenne, from, to) {
      return Math.round(mersenne.random() * (to - from) + from);
    },
    random() {
      this.url = "about:blank";
      this.seed = new Date().getTime() % 1000;
      this.execute(false);
    },
    execute(generate) {
      let mersenne = new MersenneTwister(this.seed);
      this.bank = [];
      while (this.bank.length < 80) {
        this.bank = this.bank.concat(
          this.words.filter(w => w !== this.selectedWord)
        );
      }
      let word = this.selectedWord;
      if (this.casing === "upper") {
        word = word.toUpperCase();
        this.bank = this.bank.map(w => w.toUpperCase());
      } else if (this.casing === "lower") {
        word = word === "I" ? "I" : word.toLowerCase();
        this.bank = this.bank.map(w => (w === "I" ? "I" : w.toLowerCase()));
      }
      for (let i = 0; i < 10000; i++) {
        this.createPath(mersenne);
        if (this.isGood()) {
          break;
        }
      }
      this.createPathPreview();
      if (generate) {
        this.generatePdf(word);
      }
    },
    createPathPreview() {
      let path = " M ";
      path += (this.currentPath[0] - 1) * 5 + 15 + " 2 ";
      this.currentPath.forEach((v, i, a) => {
        if (v - a[i + 1] == 8) {
          path += " v -5 ";
        } else if (v - a[i + 1] == -8) {
          path += " v 5 ";
        } else if (v - a[i + 1] == 1) {
          path += " h -5 ";
        } else if (v - a[i + 1] == -1) {
          path += " h 5 ";
        }
      });
      this.pathPreview = path;
    },
    getDown(curr) {
      curr += 8;
      let targets = [curr];
      if (curr % 8 != 0) {
        targets.push(curr - 1);
      }
      if (curr % 8 != 7) {
        targets.push(curr + 1);
      }
      return this.currentPath.filter(v => targets.includes(v)).length
        ? null
        : curr;
    },
    getRight(curr) {
      curr += 1;

      let targets = [curr, curr - 8];

      for (let i = 8; i < 80; i = i + 8) {
        targets.push(curr + i);
      }
      if (curr % 8 != 7) {
        targets.push(curr + 1, curr - 7);
      }
      return this.currentPath.filter(v => targets.includes(v)).length ||
        curr % 8 == 0
        ? null
        : curr;
    },
    getLeft(curr) {
      curr -= 1;
      let targets = [curr, curr - 8];
      for (let i = 8; i < 80; i = i + 8) {
        targets.push(curr + i);
      }
      if (curr % 8 != 0) {
        targets.push(curr - 1, curr - 9);
      }
      return this.currentPath.filter(v => targets.includes(v)).length ||
        curr % 8 == 7
        ? null
        : curr;
    },
    getUp(curr) {
      curr -= 8;
      // return null if any of these are true
      return curr < 8 || // top row, too high
      curr % 8 == 0 || // left column, won't be able to trun back
      curr % 8 == 7 || // right column, can't turn back
      (curr + 1) % 8 == 0 || // need two columns to turn back
        (curr + 2) % 8 == 0 ||
        (curr - 1) % 8 == 7 ||
        (curr - 2) % 8 == 7 ||
        this.currentPath.filter(v =>
          [
            curr,
            curr - 1,
            curr - 2,
            curr + 1,
            curr + 2,
            curr - 8,
            curr - 9,
            curr - 7
          ].includes(v)
        ).length // too close to neighbors
        ? null
        : curr;
    },
    isGood() {
      let up = this.currentPath.filter((v, i, a) => v - a[i + 1] == 8).length;

      if (up < 2) {
        return false;
      }

      let distribution =
        this.currentPath.filter(i => i % 8 == 0).length +
        this.currentPath.filter(i => i % 8 == 7).length;

      if (distribution < 5) {
        return false;
      }
      let spread = Math.abs(
        this.currentPath.filter(i => i % 8 == 0).length -
          this.currentPath.filter(i => i % 8 == 7).length
      );

      if (spread > 1) {
        return false;
      }
      return true;
    },
    generatePdf(word) {
      //let card = 0;
      const doc = new jsPDF("portrait", "mm", "letter");
      doc.setFont(this.labelFont);
      doc.setFontSize(24);
      doc.text("Name:", 10, 16);
      doc.text("Sight word search:", 100, 16);
      doc.setFontSize(26);
      doc.setFontStyle("bold");
      doc.setFont(this.valueFont);
      doc.text(word, 180, 16);
      doc.setFontStyle("normal");
      doc.rect(5, 20, 200, 245);

      doc.setFontSize(20);
      let y = 34,
        r = 11,
        c = 0;
      for (let row = 0; row < 10; row++) {
        let x = 22;
        for (let col = 0; col < 8; col++) {
          doc.circle(x, y, r);
          let w = this.bank.pop();
          if (this.currentPath.includes(c)) {
            w = word;
            if (row == 0 || row == 9) {
              doc.setFontSize(26);
              doc.setFontStyle("bold");
            }
          }
          var textWidth =
            (doc.getStringUnitWidth(w) * doc.internal.getFontSize()) /
            doc.internal.scaleFactor;
          var textOffset = x - textWidth / 2;
          doc.text(w, textOffset, y + 2);
          doc.setFontSize(20);
          doc.setFontStyle("normal");
          x += r * 2 + 2;
          c++;
        }
        y += r * 2 + 2;
      }

      doc.setFontSize(12);
      doc.setFont(this.valueFont);
      doc.text("# " + this.seed, 205, 267, { align: "right", baseline: "top" });
      this.url = doc.output("bloburi");
    },
    shuffle(mersenne, [...arr]) {
      // https://www.30secondsofcode.org/snippet/shuffle
      let m = arr.length;
      while (m) {
        const i = Math.floor(mersenne.random() * m--);
        [arr[m], arr[i]] = [arr[i], arr[m]];
      }
      return arr;
    }
  }
};
</script>
<style>
#pdf {
  width: 100%;
  height: 70vh;
}
</style>
