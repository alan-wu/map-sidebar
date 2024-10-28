<template>
  <CreateTooltipContent
    v-show="createData && createData.toBeConfirmed"
    :createData="createData"
    @confirm-create="$emit('confirm-create', $event)"
    @cancel-create="$emit('cancel-create')"
  />
  <annotation-popup
    v-show="!createData || !createData.toBeConfirmed"
    class="annotation-popup"
    :annotationEntry="annotationEntry"
    @annotation="$emit('annotation', $event)"
  />
</template>

<script>
import { AnnotationPopup, CreateTooltipContent } from '@abi-software/map-utilities';
import '@abi-software/map-utilities/dist/style.css';

export default {
  name: 'AnnotationTool',
  components: {
    AnnotationPopup
  },
  props: {
    annotationEntry: {
      type: Object,
    },
    createData: {
      type: Object,
    }
  },
}
</script>

<style scoped>
.annotation-popup.main {
  font-size: 14px;
  text-align: left;
  line-height: 1.5em;
  font-family: Asap, sans-serif, Helvetica;
  font-weight: 400;
  /* outline: thin red solid; */
  overflow-y: auto;
  scrollbar-width: thin;
  min-width: 16rem;
  max-height: unset;
  background-color: #f7faff;
  height: 100%;
  border-left: 1px solid var(--el-border-color);
  border-top: 1px solid var(--el-border-color);
}

</style>