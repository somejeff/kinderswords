<template>
  <v-container>
    <p
      class="text-justify"
    >Use a spoon to scoop out and match letters from bowls. Printing double-sided gives them more cards to choose from.</p>

    <v-row>
      <v-col cols="12"  md="6" lg="3">
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
      <v-col cols="12"  md="6" lg="3">
        <v-btn-toggle v-model="casing" color="deep-purple accent-3" mandatory>
          <v-btn value="upper">Uppercase</v-btn>
          <v-btn value="lower">Lowercase</v-btn>
          <v-btn value="mixed">Mixed</v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="12"  md="6" lg="3">
        <v-text-field
          label="Number of Cards"
          v-model="count"
          outlined
          dense
          v-mask="'####'"
          hint="How many cards?"
        ></v-text-field>
      </v-col>
      <v-col cols="12"  md="6" lg="3" >
        <v-btn color="indigo" dark @click="execute">Create</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <object id="pdf" :data="url" type="application/pdf"></object>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import pdf from "pdfjs";
import MersenneTwister from "mersenne-twister";
import { mask } from "vue-the-mask";

export default {
  directives: {
    mask
  },
  data() {
    return {
      url: null,
      casing: "upper",
      seed: null,
      pool: "abcdefghijklmnopqrstuvwxyz".split(""),
      letters: [],
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
      this.letters = [];
      for (let i = 0; i < Math.ceil(this.count / 5); i++) {
        let pool = this.shuffle(mersenne, this.pool);
        pool.pop(); // drop the last letter, since it's not divisible by 5
        this.letters = this.letters.concat(pool);
      }
      this.letters = this.letters.map(a => {
        let casing = this.casing;
        if (this.casing === "mixed") {
          casing = mersenne.random() > 0.5 ? "upper" : "lower";
        }
        return casing === "upper" ? a.toUpperCase() : a;
      });
      this.generatePdf();
    },
    generatePdf() {
      const doc = new pdf.Document();
      let first = true;
      for (let card = 0; card < this.count; card++) {
        if (!first && card % 3 == 0) {
          doc.pageBreak();
        } else {
          first = false;
        }
        let y = (28 - 9 * (card % 3)) * pdf.cm;
        let cell = doc.cell({
          y: y
        });
        cell.text("Find your letters in your soup recipe.\n ", {
          font: require("pdfjs/font/Helvetica-Bold"),
          lineHeight: 2,
          fontSize: 24,
          textAlign: "center"
        });

        cell = doc.cell({
          x: 15 * pdf.mm,
          y: y - 60
        });
        let table = cell.table({
          widths: [100, 100, 100, 100, 100],
          borderWidth: 1
        });

        const row = table.row();
        for (let i = 0; i <= 4; i++) {
          row.cell(this.letters.pop(), {
            font: require("pdfjs/font/Helvetica-Bold"),
            fontSize: 64,
            textAlign: "center"
          });
        }
        cell = doc.cell({
          width: 520,
          y: y - 145
        });
        cell.text("# " + this.seed + " - " + (card + 1) + "/" + this.count, {
          font: require("pdfjs/font/Helvetica-Bold"),
          fontSize: 8,
          textAlign: "right"
        });
      }

      doc.asBuffer((err, data) => {
        this.url = URL.createObjectURL(
          new Blob([data], { type: "application/pdf" })
        );
      });
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
