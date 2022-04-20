<template>
  <div class="full-size">
    <div class="gallery-container">
      <!--
      <gallery
        :items="galleryItems"
        :max-width="maxWidth"
        :show-indicator-bar="true"
        :show-card-details="true"
        :highlight-active="true"
      />
      -->
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
const baseName = (str) => {
  return str.split("\\").pop().split("/").pop();
};

const capitalise = function (string) {
  return string.replace(/\b\w/g, (v) => v.toUpperCase());
};

import GalleryHelper from "@abi-software/gallery/src/mixins/GalleryHelpers";
import gallery from "@abi-software/gallery";

export default {
  name: "Images",
  component: { gallery },
  mixins: [GalleryHelper],
  props: {
    datasetScicrunch: {
      type: Object,
      default: () => {
        return {};
      },
    },
    datasetBiolucida: {
      type: Object,
      default: () => {
        return {};
      },
    },
    envVars: {
      type: Object,
      default: () => {},
    },
    label: {
      type: String,
      default: "",
    },
    images: {
      type: Array,
      default: () => {
        return [];
      },
    },
    plots: {
      type: Array,
      default: () => {
        return [];
      },
    },
    scaffolds: {
      type: Array,
      default: () => {
        return [];
      },
    },
    scaffoldViews: {
      type: Array,
      default: () => {
        return [];
      },
    },
    segmentations: {
      type: Array,
      default: () => {
        return [];
      },
    },
    thumbnails: {
      type: Array,
      default: () => {
        return [];
      },
    },
    videos: {
      type: Array,
      default: () => {
        return [];
      },
    },
    datasetId: {
      type: Number,
      default: -1,
    },
    datasetVersion: {
      type: Number,
      default: -1,
    },
    datasetThumbnail: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentIndex: 0,
      ro: null,
      maxWidth: 3,
      scicrunchItems: [],
      biolucidaItems: [],
    };
  },
  methods: {
    createSciCurnchItems: function () {
      this.createDatasetItem();
      this.createScaffoldItems();
      this.createPlotItems();
      this.createSegmentationItems();
      this.createImageItems();
      this.createVideoItems();
    },
    createDatasetItem: function () {
      if (this.datasetThumbnail) {
        this.scicrunchItems.push({
          id: -1,
          title: "Dataset",
          type: "Dataset",
          thumbnail: this.datasetThumbnail,
          link: `${this.envVars.ROOT_URL}datasets/${this.datasetId}?type=dataset`,
        });
      }
    },
    createImageItems: function () {
      if (this.images) {
        this.images.forEach((image) => {
          const filePath = image.dataset.path;
          const id = image.identifier;
          const linkUrl = `${this.envVars.ROOT_URL}datasets/imageviewer?dataset_id=${this.datasetId}&dataset_version=${this.datasetVersion}&file_path=${filePath}&mimetype=${image.mimetype.name}`;
          this.scicrunchItems.push({
            id,
            title: baseName(filePath),
            type: "Image",
            thumbnail: this.defaultImg,
            link: linkUrl,
          });
        });
      }
    },
    createPlotItems: function () {
      if (this.plots) {
        this.plots.forEach((plot) => {
          const filePath = plot.dataset.path;
          const id = plot.identifier;
          const thumbnail = this.getThumbnailForPlot(plot, this.thumbnails);
          if (thumbnail) {
            this.getImageFromS3(this.envVars.API_LOCATION, this.scicrunchItems, {
              id,
              fetchAttempts: 0,
              datasetId: this.datasetId,
              datasetVersion: this.datasetVersion,
              mimetype: thumbnail.mimetype.name,
              file_path: thumbnail.dataset.path,
            });
          }
          let action = {
            label: capitalise(this.label),
            resource: `${this.envVars.API_LOCATION}s3-resource/${this.datasetId}/${this.datasetVersion}/files/${filePath}`,
            title: "View plot",
            type: "Plot",
            discoverId: this.discoverId,
            version: this.datasetVersion,
          };
          this.scicrunchItems.push({
            id,
            title: baseName(filePath),
            type: "Plot",
            thumbnail: this.defaultPlotImg,
            action: action,
          });
        });
      }
    },
    createScaffoldItems: function () {
      if (this.scaffolds) {
        let index = 0;
        this.scaffolds.forEach((scaffold) => {
          const filePath = scaffold.dataset.path;
          const id = scaffold.identifier;
          console.log(this.thumbnails)
          const thumbnail = this.getThumbnailForScaffold(
            scaffold,
            this.scaffoldViews,
            this.thumbnails,
            index
          );
          if (thumbnail) {
            this.getImageFromS3(this.envVars.API_LOCATION, this.scicrunchItems, {
              id,
              fetchAttempts: 0,
              datasetId: this.datasetId,
              datasetVersion: this.datasetVersion,
              mimetype: thumbnail.mimetype.name,
              file_path: thumbnail.dataset.path,
            });
          }
          let action = {
            label: capitalise(this.label),
            resource: `${this.envVars.API_LOCATION}s3-resource/${this.datasetId}/${this.datasetVersion}/files/${filePath}`,
            title: "View 3D scaffold",
            type: "Scaffold",
            discoverId: this.datasetId,
            apiLocation: this.envVars.API_LOCATION,
            version: this.datasetVersion,
          };
          this.scicrunchItems.push({
            id,
            title: baseName(filePath),
            type: "Scaffold",
            thumbnail: this.defaultScaffoldImg,
            action: action,
          });
        });
      }
    },
    createSegmentationItems: function () {
      if (this.segmentations) {
        this.segmentations.forEach((segmentation) => {
          const id = segmentation.id;
          let filePath = segmentation.dataset.path;
          filePath = filePath.replaceAll(" ", "_");
          filePath = filePath.replaceAll(",", "_");
          const prefix = this.envVars.NL_LINK_PREFIX;
          const resource = {
            share_link: `${prefix}/dataviewer?datasetId=${this.datasetId}&version=${this.datasetVersion}&path=${filePath}`,
          };
          let action = {
            label: capitalise(this.label),
            resource: resource,
            datasetId: this.datasetId,
            title: "View segmentation",
            type: "Segmentation",
          };
          this.getSegmentationThumbnail(
            this.envVars.API_LOCATION,
            this.scicrunchItems,
            {
              id,
              fetchAttempts: 0,
              datasetId: this.datasetId,
              datasetVersion: this.datasetVersion,
              segmentationFilePath: filePath,
            }
          );
          this.scicrunchItems.push({
            id,
            title: baseName(filePath),
            type: "Segmentation",
            thumbnail: this.defaultScaffoldImg,
            action: action,
          });
        });
      }
    },
    createVideoItems: function () {
      if (this.videos) {
        this.videos.forEach((video) => {
          const filePath = this.getS3FilePath(
            this.datasetId,
            this.datasetVersion,
            video.dataset.path
          );
          const linkUrl = `${this.envVars.ROOT_URL}datasets/videoviewer?dataset_version=${this.datasetVersion}&dataset_id=${this.datasetId}&file_path=${filePath}&mimetype=${video.mimetype.name}`;
          this.scicrunchItems.push({
            title: video.name,
            type: "Video",
            thumbnail: this.defaultVideoImg,
            link: linkUrl,
          });
        });
      }
    },
    onResize: function () {
      this.maxWidth = this.$el.clientWidth;
      // this.$emit('resize', this.$el.clientWidth)
    },
  },
  computed: {
    galleryItems() {
      return this.scicrunchItems.concat(this.biolucidaItems);
    },
  },
  created: function () {
    console.log("seriously", this.scaffolds);
    this.createSciCurnchItems();
  },
  watch: {
    datasetBiolucida: {
      deep: true,
      immediate: true,
      handler: function (biolucidaData) {
        let items = [];
        if ("dataset_images" in biolucidaData) {
          items.push(
            ...Array.from(biolucidaData.dataset_images, (dataset_image) => {
              this.getThumbnailFromBiolucida(
                this.envVars.API_LOCATION,
                items,
                {
                  id: dataset_image.image_id,
                  fetchAttempts: 0,
                }
              );
              this.getImageInfoFromBiolucida(
                this.envVars.API_LOCATION,
                items,
                {
                  id: dataset_image.image_id,
                  fetchAttempts: 0,
                }
              );
              const resource = {
                share_link: dataset_image.share_link,
                id: dataset_image.image_id,
                itemId: dataset_image.sourcepkg_id,
              };
              let action = {
                label: capitalise(this.label),
                resource: resource,
                datasetId: this.datasetId,
                title: "View image",
                name: capitalise(this.label),
                type: "Biolucida",
              };
              return {
                id: dataset_image.image_id,
                title: null,
                type: "Image",
                thumbnail: null,
                action: action,
              };
            })
          );
        }
        this.biolucidaItems = items;
      },
    },
  },
  mounted() {
    this.ro = new ResizeObserver(this.onResize).observe(this.$el);
  },
  destroyed() {
    delete this.ro;
  },
};
</script>

<style scoped>
.full-size {
  width: 100%;
  height: 100%;
}

.key-image-span.active {
  transform: scale(1.16);
  border: 4px #8300bf solid;
}

.key-image-span {
  display: flex;
  position: relative;
}

.overlay {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 1.61em;
  height: 1em;
  border-radius: 3px;
  opacity: 0.8;
}

img {
  vertical-align: bottom;
}

a.prev,
a.next {
  display: flex;
  font-size: 3em;
}

a.prev:not(.underline),
a.next:not(.underline) {
  text-decoration: none;
}

a.prev {
  justify-content: flex-start;
}

a.next {
  justify-content: flex-end;
}

.standard-gallery {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: center;
}

.image-line {
  display: flex;
  margin-top: 1%;
  margin-bottom: 1%;
  flex-grow: 1;
  justify-content: space-between;
}
.disabled {
  opacity: 0.2;
  cursor: default;
}

.rectangle {
  height: 1em;
  width: 2em;
  border-radius: 3px;
  background-color: #555;
}
</style>
