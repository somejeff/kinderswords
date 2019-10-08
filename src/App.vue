<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" color="indigo lighten-5">
      <v-list shaped>
        <v-list-item-group v-model="item">
          <v-list-item v-for="(item, i) in items" :key="i">
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
              <v-list-item-subtitle v-text="item.description"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Kinderswords</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container class="fill-height" fluid>
        <LetterSoup />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import LetterSoup from "./components/LetterSoup";

export default {
  name: "Kinderswords",
  components: {
    LetterSoup
  },
  data: () => ({
    drawer: null,
    item: 0,
    items: [
      {
        text: "Letter Soup",
        icon: "mdi-bowl",
        description: "Find letters in a bowl"
      }
    ]
  })
};
</script>
