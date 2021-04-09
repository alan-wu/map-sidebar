<template>
  <div class="tab-container">
      <div class="title" v-for="title in tabTitles" :key="title.id">
        <div  class="title-text-table" v-bind:class="{ highlightText : (title.id==activeId) }" v-on:click="titleClicked(title.id)">
          <div class="title-text">
            {{title.title}}
          </div>
        </div>
      </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */

export default {
  name: "Tabs",
  props: {
    tabTitles: {
      type: Array,
      default: () => []
    },
    activeId: {
      type: Number,
      default: 1
    }
  },
  methods: {
    titleClicked: function(id) {
      this.$emit("titleClicked", id);
    },
  }

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.tab-container{
  height: 36px;
}

.title {
  width: 101px;
  height: 36px;
  border: solid 1px #dcdfe6;
  border-bottom: none;
  background-color: white;
  display:inline-block;
}

.title:hover {
  cursor: pointer;
}

.title-text {
  text-align:center;
  display: table-cell;
  vertical-align: middle;
}

.title-text-table {
  display:table;
  height: 100%;
  width: 100%;
}

.parent-dialog:hover .title-text {
  color:#8300bf;
}

.highlightText {
  color:#8300bf;
}

</style>
