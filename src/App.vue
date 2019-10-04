<template>
  <div id="app">
    <input size="7" v-model="seed" />
    &nbsp;&nbsp;&nbsp;&nbsp;
    <button v-on:click="upper">Uppercase</button>
    <button v-on:click="lower">Lowercase</button>
    <hr />
    <object id="pdf" :data="url" type="application/pdf"></object>
  </div>
</template>

<script>
import pdf from "pdfjs";
import MersenneTwister from "mersenne-twister";

export default {
  data() {
    return {
      url: null,
      seed: new Date().getTime()%1000,
      letters: []
    };
  },
  mounted() {
    this.upper();
  },
  methods: {
    upper() {
      this.letters = this.shuffle(new MersenneTwister(this.seed), ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].map(a=>a.toUpperCase()));
      this.generatePdf();
    },
    lower() {
      this.letters = this.shuffle(new MersenneTwister(this.seed), ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);
      this.generatePdf();
    },
    generatePdf() {
      const doc = new pdf.Document();
      let first = true;
      for (let card = 0; card < 5; card++) {
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
          y: y-60
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
          width:520,
          y: y-145
        });
        cell.text(this.seed+'', {
          font: require("pdfjs/font/Helvetica-Bold"),
          fontSize: 7,
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
  width: 90%;
  height: 95vh;
}
</style>
