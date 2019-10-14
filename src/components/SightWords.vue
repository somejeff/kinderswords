<template>
  <v-container>
    <p class="text-justify">Trace the word down the maze.</p>

    <v-row>
      <v-col cols="12" md="4" lg="4">
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
      <v-col cols="12" md="4">
        <v-select v-model="valueFont" :items="fonts" label="Letters Font"></v-select>
      </v-col>
      <v-col cols="12" md="4" lg="4">
        <v-btn color="indigo" dark @click="execute">Create</v-btn>
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
        f => f.toLowerCase() != f && !['ZapfDingbats','Symbol'].includes(f)
      ),
      labelFont: "Comic Sans",
      valueFont: "Futura Book",
      seed: null,
      words: [
        "The",
        "And",
        "It",
        "Is",
        "To",
        "He",
        "She",
        "Was",
        "Love",
        "Like",
        "We",
        "I",
        "You",
        "At",
        "For",
        "Can",
        "A",
        "Play",
        "See",
        "Me",
        "My",
        "Yes",
        "No",
        "For",
        "At",
        "Cat",
        "Rat",
        "Bat",
        "Mat",
        "Sat",
        "Pat"
      ],
      //
      paths: [
        [
          2,
          10,
          18,
          25,
          26,
          33,
          36,
          37,
          38,
          41,
          42,
          43,
          44,
          46,
          54,
          62,
          61,
          68,
          69,
          76
        ],
        [
          5,
          10,
          11,
          12,
          13,
          18,
          26,
          27,
          28,
          36,
          40,
          41,
          42,
          43,
          44,
          48,
          56,
          57,
          60,
          61,
          62,
          65,
          66,
          67,
          68,
          70,
          78
        ],
        [
          1,
          9,
          17,
          19,
          20,
          21,
          22,
          25,
          26,
          27,
          30,
          38,
          46,
          51,
          52,
          53,
          54,
          59,
          67,
          68,
          76
        ],
        [
          3,
          11,
          16,
          17,
          18,
          19,
          21,
          22,
          23,
          24,
          29,
          31,
          32,
          33,
          34,
          36,
          37,
          39,
          42,
          43,
          44,
          47,
          54,
          55,
          62,
          70,
          78
        ],
        [
          6,
          13,
          14,
          21,
          29,
          37,
          45,
          44,
          52,
          51,
          50,
          42,
          34,
          33,
          32,
          40,
          48,
          56,
          64,
          65,
          73
        ],
        [
          4,
          12,
          16,
          17,
          18,
          20,
          24,
          26,
          28,
          32,
          34,
          35,
          36,
          40,
          48,
          49,
          50,
          51,
          52,
          53,
          54,
          62,
          67,
          68,
          69,
          70,
          75
        ],
        [
          0,
          8,
          16,
          17,
          18,
          19,
          11,
          12,
          13,
          21,
          29,
          37,
          38,
          46,
          54,
          62,
          61,
          60,
          59,
          51,
          50,
          49,
          57,
          65,
          64,
          72
        ]
      ],
      selectedPath: null,
      count: 1,
      bank: null
    };
  },
  mounted() {
    this.random();
  },
  methods: {
    random() {
      this.seed = new Date().getTime() % 1000;
      this.execute();
    },
    execute() {
      let mersenne = new MersenneTwister(this.seed);
      this.selectedPath = this.shuffle(mersenne, this.paths).shift();
      this.bank = [];
      while (this.bank.length < 80) {
        this.bank = this.bank.concat(
          this.words.filter(w => w !== this.selectedWord)
        );
      }
      if (this.casing === "upper") {
        this.selectedWord = this.selectedWord.toUpperCase();
        this.bank = this.bank.map(w => w.toUpperCase());
      } else if (this.casing === "lower") {
        this.selectedWord = this.selectedWord==='I'?'I':this.selectedWord.toLowerCase();
        this.bank = this.bank.map(w => w==='I'?'I':w.toLowerCase());
      } 
      this.generatePdf();
    },
    generatePdf() {
      //let card = 0;
      const doc = new jsPDF("portrait", "mm", "letter");
      doc.setFont(this.labelFont);
      doc.setFontSize(24);
      doc.text("Name:", 10, 16);
      doc.text("Sight word search:", 100, 16);
      doc.setFontSize(26);
      doc.setFontStyle("bold");
      doc.setFont(this.valueFont);
      doc.text(this.selectedWord, 180, 16);
      doc.setFontStyle("normal");
      doc.rect(5, 20, 205, 250);

      doc.setFontSize(20);
      let y = 34,
        r = 11,
        c = 0;
      for (let row = 0; row < 10; row++) {
        let x = 22;
        for (let col = 0; col < 8; col++) {
          doc.circle(x, y, r);
          let w = this.bank.pop();
          if (this.selectedPath.includes(c)) {
            w = this.selectedWord;
            if (row == 0 || row == 9) {
              doc.setFontStyle("bold");
            }
          }
          var textWidth =
            (doc.getStringUnitWidth(w) * doc.internal.getFontSize()) /
            doc.internal.scaleFactor;
          var textOffset = x - textWidth / 2;
          doc.text(w, textOffset, y + 3);
          doc.setFontStyle("normal");
          x += r * 2 + 2;
          c++;
        }
        y += r * 2 + 2;
      }
      this.url = doc.output("bloburi");
    },
    shuffle(mersenne, arr) {
      // distilled from chancejs
      var new_array = [],
        j = 0,
        length = Number(arr.length),
        source_indexes = Array.apply(null, Array(length)).map(function(_, i) {
          return i;
        }),
        last_source_index = length - 1,
        selected_source_index;

      for (var i = 0; i < length; i++) {
        // Pick a random index from the array
        selected_source_index = Math.floor(
          mersenne.random() * last_source_index
        );
        j = source_indexes[selected_source_index];

        // Add it to the new array
        new_array[i] = arr[j];

        // Mark the source index as used
        source_indexes[selected_source_index] =
          source_indexes[last_source_index];
        last_source_index -= 1;
      }

      return new_array;
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
