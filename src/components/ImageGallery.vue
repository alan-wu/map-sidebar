<template>
  <div class="full-size">
    <gallery
      :bottomSpacer="bottomSpacer"
      :cardWidth="10"
      :items="galleryItems"
      :max-width="maxWidth"
      :show-indicator-bar="true"
      :show-card-details="true"
      :highlight-active="false"
      :image-style="imageStyle"
      :image-container-style="imageContainerStyle"
      :body-style="bodyStyle"
      :shadow="shadow"
      @card-clicked="cardClicked"
    />
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
import Gallery from "@abi-software/gallery";

export default {
  name: "ImageGallery",
  components: { Gallery },
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
    additionalLinks: {
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
      bodyStyle: { padding: '0px', background: '#ffffff' },
      imageContainerStyle: { width: '160px', height: '160px'},
      imageStyle: { maxWidth: '160px', maxHeight: '160px'},
      shadow: "never",
      bottomSpacer: { minHeight: '1.5rem' },
    };
  },
  methods: {
    cardClicked: function(payload) {
      this.$emit('card-clicked', payload);
    },
    createSciCurnchItems: function () {
      this.createDatasetItem();
      this.createScaffoldItems();
      this.createSimulationItems();
      this.createPlotItems();
      this.createSegmentationItems();
      this.createImageItems();
      this.createVideoItems();
    },
    createDatasetItem: function () {
      const link = `${this.envVars.ROOT_URL}/datasets/${this.datasetId}?type=dataset`
      if (this.datasetThumbnail) {
        this.scicrunchItems.push({
          id: -1,
          title: link,
          type: `Dataset ${this.datasetId}`,
          thumbnail: this.datasetThumbnail,
          link,
        });
      }
    },
    createImageItems: function () {
      if (this.images) {
        this.images.forEach((image) => {
          const filePath = image.dataset.path;
          const id = image.identifier;
          const linkUrl = `${this.envVars.ROOT_URL}/datasets/imageviewer?dataset_id=${this.datasetId}&dataset_version=${this.datasetVersion}&file_path=${filePath}&mimetype=${image.mimetype.name}`;
          this.scicrunchItems.push({
            id,
            title: baseName(filePath),
            type: "Image",
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
          let thumbnailURL = undefined;
          let mimetype = '';
          if (thumbnail) {
            thumbnailURL = this.getImageURLFromS3(this.envVars.API_LOCATION, {
              id,
              datasetId: this.datasetId,
              datasetVersion: this.datasetVersion,
              file_path: thumbnail.dataset.path,
            });
            mimetype = thumbnail.mimetype.name;
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
            thumbnail: thumbnailURL,
            userData: action,
            mimetype
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
          const thumbnail = this.getThumbnailForScaffold(
            scaffold,
            this.scaffoldViews,
            this.thumbnails,
            index
          );
          let mimetype = '';
          let thumbnailURL = undefined;
          if (thumbnail) {
            thumbnailURL = this.getImageURLFromS3(this.envVars.API_LOCATION, {
              id,
              datasetId: this.datasetId,
              datasetVersion: this.datasetVersion,
              file_path: thumbnail.dataset.path,
            });
            mimetype = thumbnail.mimetype.name;
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
            thumbnail: thumbnailURL,
            userData: action,
            mimetype
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
          const thumbnailURL = this.getSegmentationThumbnailURL(
            this.envVars.API_LOCATION,
            {
              id,
              datasetId: this.datasetId,
              datasetVersion: this.datasetVersion,
              segmentationFilePath: filePath,
            }
          );
          this.scicrunchItems.push({
            id,
            title: baseName(filePath),
            type: "Segmentation",
            thumbnail: thumbnailURL,
            userData: action,
            mimetype: 'image/png',
          });
        });
      }
    },
    createSimulationItems: function () {
      let isSedmlResource = false;
      let resource = undefined;
      if (this.additionalLinks) {
        this.additionalLinks.forEach(function(el) {
          if (el.description == "SED-ML file") {
            isSedmlResource = true;
            resource = el.uri;
          } else if (!isSedmlResource && (el.description == "CellML file")) {
            resource = el.uri;
          }
        });
        if (resource) {
          let action = {
            label: undefined,
            resource: resource,
            apiLocation: this.envVars.API_LOCATION,
            version: this.datasetVersion,
            title: "View simulation",
            type: "Simulation"
          };
          this.scicrunchItems.push({
            id: "simulation",
            title: resource,
            type: "Simulation",
            userData: action,
          });
        }
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
          const linkUrl = `${this.envVars.ROOT_URL}/datasets/videoviewer?dataset_version=${this.datasetVersion}&dataset_id=${this.datasetId}&file_path=${filePath}&mimetype=${video.mimetype.name}`;
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
              const thumbnailURL = this.getThumbnailURLFromBiolucida(
                this.envVars.API_LOCATION,
                {
                  id: dataset_image.image_id,
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
                thumbnail: thumbnailURL,
                userData: action,
                mimetype: 'image/png'
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
  height: 100%;
  width: 244px;
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

.full-size >>> .el-card {
  border: 0px;
}
</style>
