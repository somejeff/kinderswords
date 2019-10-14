<template>
  <v-container>
    <p
      class="text-justify"
    >Use a spoon to scoop out and match letters from bowls that form words. Printing double-sided gives them more cards to choose from.</p>

    <v-row>
      <v-col cols="12" md="4">
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
      <v-col cols="12" md="4">
        <v-text-field
          label="Number of Cards"
          v-model="count"
          outlined
          dense
          v-mask="'####'"
          hint="How many cards?"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="valueFont" :items="fonts" label="Letters Font"></v-select>
      </v-col>
      <v-col cols="12" md="4">
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
      casing: "upper",
      fonts: Object.keys(new jsPDF().getFontList()).filter(
        f => f.toLowerCase() != f && !["ZapfDingbats", "Symbol"].includes(f)
      ),
      labelFont: "Comic Sans",
      valueFont: "Futura Book",
      seed: null,
      pool: [
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
      words: [],
      count: 24
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
      this.words = [];
      for (let i = 0; i < Math.ceil(this.count / 5); i++) {
        let pool = this.shuffle(mersenne, this.pool);
        this.words = this.words.concat(pool);
      }
      this.words = this.words.map(w => {
        if (this.casing === "upper") {
          return w.toUpperCase();
        } else if (this.casing === "lower") {
          return w.toLowerCase();
        }
        return w;
      });

      this.generatePdf();
    },
    generatePdf() {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "letter",
        putOnlyUsedFonts: true
      });
      doc.setFont(this.labelFont);
      let first = true;
      for (let card = 0; card < this.count; card++) {
        if (!first && card % 3 == 0) {
          doc.addPage();
        } else {
          first = false;
        }

        let offsetX = 30,
          offsetY = 93,
          y = 0,
          x = 0,
          height = 94;
        y = height * (card % 3);
        doc.rect(0, y, 217, height);

        // Instructions
        offsetY = 30;
        x = 107;
        y = offsetY + height * (card % 3);
        doc
          .setFont(this.labelFont)
          .setFontSize(24)
          .setFontStyle("normal")
          .text("Find your letters in your soup recipe.\n", x, y, {
            align: "center"
          });

        let letters = [];
        while (letters.length < 7) {
          letters = letters.concat(this.words.pop().split(""));
          letters.push(" ");
        }
        letters.pop(); // remove the last empty space

        const totalLetters = letters.length;

        offsetX = (217 - totalLetters * 20) / 2;
        offsetY = 5;

        // Letters
        for (let i = 0; i < totalLetters; i++) {
          doc
            .setFont(this.valueFont)
            .rect(offsetX + 20 * i, offsetY + y, 20, 30)
            .setFontSize(56)
            .setFontStyle("bold")
            .text(letters.shift(), offsetX + 10 + 20 * i, offsetY + 23 + y, {
              align: "center"
            });
        }
        doc
          .setFont("helvetica")
          .setFontSize(8)
          .setFontStyle("bold")
          .text(
            "# " + this.seed + " - " + (card + 1) + "/" + this.count,
            181,
            offsetY + 33 + y,
            {
              align: "right"
            }
          );
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
