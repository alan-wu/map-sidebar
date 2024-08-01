<template>
  <el-tooltip :content="textLabel" placement="bottom" effect="clipboard-tooltip">
    <el-button class="button"
      size="small"
      @click="copyToClipboard"
    >
      <el-icon color="white">
        <el-icon-copy-document />
      </el-icon>
      <span class="visually-hidden">{{ textLabel }}</span>
    </el-button>
  </el-tooltip>
</template>

<script>
export default {
  name: 'CopyToClipboard',
  props: {
    content: {
      type: String,
      default: '',
    }
  },
  data: function () {
    return {
      textLabel: 'Copy to clipboard'
    };
  },
  methods: {
    copyToClipboard: async function () {
      let copiedSuccessfully = true;
      try {
        await navigator.clipboard.writeText(this.content);
      } catch (err) {
        console.error(
          "Error when trying to use navigator.clipboard.writeText()",
          err
        );
        copiedSuccessfully = false;
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .el-popper.is-clipboard-tooltip {
    padding: 4px 10px;
    font-family: Asap;
    color: #333;
    background: white;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
    & .el-popper__arrow::before {
      background: white;
    }
  }

  .button {
    margin-left: 0px !important;
    margin-top: 0px !important;
    font-size: 14px !important;
    transition: all 0.25s ease;

    &,
    &:focus,
    &:active {
      color: #fff !important;
      background: $app-primary-color;
      border-color: $app-primary-color !important;
    }

    &:hover {
      background: #ac76c5 !important;
      border-color: #ac76c5 !important;
    }
  }

  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
