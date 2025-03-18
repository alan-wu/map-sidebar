<template>
  <div class="connectivity-card-container" ref="container">
    <div class="connectivity-card" ref="card">
      <div class="seperator-path"></div>
      <div class="card">
        <div class="title" @click="cardClicked(entry)">{{ entry.label }}</div>
        <template v-for="field in displayFields" :key="field">
          <div class="details" v-if="entry[field]">
            <strong>{{ field }}:</strong> {{ entry[field] }}
          </div>
        </template>
        <el-button @click="cardClicked(entry)" size="small" class="button">
          View connectivity
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import EventBus from "./EventBus.js";

export default {
  data() {
    return {
      displayFields: ["label", "id"],
    };
  },
  name: "ConnectivityCard",
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    entry: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    cardClicked: function (data) {
      EventBus.emit("connectivity-explorer-clicked", data);
    },
  },
};
</script>

<style lang="scss" scoped>
.connectivity-card {
  padding-left: 5px;
  position: relative;
  min-height: 8.5rem;
}

.card {
  padding-top: 18px;
  padding-left: 6px;
}

.title {
  padding-bottom: 0.75rem;
  font-weight: bold;
  line-height: 1.5;
  letter-spacing: 1.05px;
  cursor: pointer;
}

.details {
  line-height: 1.5;
  letter-spacing: 1.05px;
}

.button {
  font-family: Asap;
  font-size: 14px;
  font-weight: normal;
  background-color: $app-primary-color;
  border: $app-primary-color;
  color: white;
  margin-top: 8px;
}
</style>
