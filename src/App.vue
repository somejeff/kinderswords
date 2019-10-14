<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" color="indigo lighten-5">
      <v-list shaped>
        <v-list-item-group v-model="item">
          <v-list-item v-for="(item, i) in items" :key="i" :to="item.route">
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
              <v-list-item-subtitle v-text="item.summary"></v-list-item-subtitle>
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
      <v-data-iterator
        v-if="$route.path=='/'"
        :items="items"
        hide-default-footer
      >
        <template v-slot:default="props">
          <v-row>
            <v-col v-for="item in props.items" :key="item.text" cols="12" sm="6" md="4" lg="3">
              <v-card max-width="344" class="mx-auto">
                <v-card-title>
                  <v-icon large left v-text="item.icon"></v-icon>
                  <span class="title font-weight-light" v-text="item.text"></span>
                </v-card-title>
                <v-card-text v-text="item.description"></v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer />
                  <v-btn :to="item.route" color="indigo" dark elevation="2" outlined rounded>Explore</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>

      <router-view />
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "Kinderswords",
  data: () => ({
    drawer: null,
    item: null,
    items: [
      {
        text: "Letter Soup",
        icon: "mdi-bowl",
        summary: "Find letters in a bowl",
        description: "Use a spoon to scoop out and match letters from bowls.",
        route: "/letter-soup"
      },
      {
        text: "Word Soup",
        icon: "mdi-bowl",
        summary: "Find letters, build words",
        description: "Use a spoon to scoop out and match letters from bowls and build words.",
        route: "/word-soup"
      },

      {
        text: "Sight Words",
        icon: "mdi-arrow-decision-auto-outline",
        summary: "Follow the word",
        description: "Trace the word down the maze.",
        route: "/sight-words"
      }
    ]
  })
};
</script>
