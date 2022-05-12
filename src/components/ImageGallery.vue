<template>
  <div class="full-size">
    <gallery
      :bottomSpacer="bottomSpacer"
      :cardWidth="10"
      :items="galleryItems"
      :max-width="maxWidth"
      :show-indicator-bar="false"
      :show-card-details="true"
      :highlight-active="false"
      :image-style="imageStyle"
      :image-container-style="imageContainerStyle"
      :body-style="bodyStyle"
      :shadow="shadow"
      @card-clicked="cardClicked"
      ref="gallery"
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
    plots: {
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
    category: {
      type: String,
      default: "All",
    },
    entry:  {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      currentIndex: 0,
      ro: null,
      maxWidth: 3,
      items: {
        "Biolucida Images": [],
        'Dataset': [],
        'Images': [],
        'Scaffolds': [],
        'Segmentations': [],
        'Simulations': [],
        'Videos': [],
        'Plots': [],
      },
      bodyStyle: { padding: '0px', background: '#ffffff' },
      imageContainerStyle: {
        width: '160px',
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      imageStyle: { maxWidth: '160px', maxHeight: '160px'},
      shadow: "never",
      bottomSpacer: { minHeight: '1.5rem' },
      resetIndex: false
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
      /* Disable these two
      this.createImageItems();
      this.createVideoItems();
      */
    },
    createDatasetItem: function () {
      const link = `${this.envVars.ROOT_URL}/datasets/${this.datasetId}?type=dataset`
      if (this.datasetThumbnail) {
        this.items['Dataset'].push({
          id: -1,
          title: link,
          type: `Dataset ${this.datasetId}`,
          thumbnail: this.datasetThumbnail,
          link,
        });
      }
    },
    createImageItems: function () {
      if (this.entry.images) {
        this.entry.images.forEach((image) => {
          const filePath = image.dataset.path;
          const id = image.identifier;
          const linkUrl = `${this.envVars.ROOT_URL}/datasets/imageviewer?dataset_id=${this.datasetId}&dataset_version=${this.datasetVersion}&file_path=${filePath}&mimetype=${image.mimetype.name}`;
          this.items['Images'].push({
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
          const thumbnail = this.getThumbnailForPlot(plot, this.entry.thumbnails);
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
            resource: `${this.envVars.API_LOCATION}s3-resource/${this.datasetId}/${this.datasetVersion}/${filePath}`,
            title: "View plot",
            type: "Plot",
            discoverId: this.discoverId,
            version: this.datasetVersion,
          };
          this.items['Plots'].push({
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
      if (this.entry.scaffolds) {
        let index = 0;
        this.entry.scaffolds.forEach((scaffold) => {
          const filePath = scaffold.dataset.path;
          const id = scaffold.identifier;
          const thumbnail = this.getThumbnailForScaffold(
            scaffold,
            this.entry.scaffoldViews,
            this.entry.thumbnails,
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
          this.items['Scaffolds'].push({
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
      if (this.entry.segmentation) {
        this.entry.segmentation.forEach((segmentation) => {
          const id = segmentation.id;
          let filePath = segmentation.dataset.path;
          filePath = filePath.replaceAll(" ", "_");
          filePath = filePath.replaceAll(",", "_");
          const prefix = this.envVars.NL_LINK_PREFIX;
          const resource = {
            share_link: `${prefix}/dataviewer?datasetId=${this.datasetId}&version=${this.datasetVersion}&path=files/${filePath}`,
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
          this.items['Segmentations'].push({
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
      let resource = undefined;
      if (this.additionalLinks) {
        this.additionalLinks.forEach(el => {
          if (el.description == "SED-ML file" || el.description == "CellML file") {
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
            type: "Simulation",
            name: this.entry.name,
            description: this.entry.description,
            discoverId: this.datasetId,
            dataset: `${this.envVars.ROOT_URL}/datasets/${this.datasetId}?type=dataset`
          };
          this.items['Simulations'].push({
            id: "simulation",
            title: resource,
            type: "Simulation",
            userData: action,

          });
        }
      }
    },
    createVideoItems: function () {
      if (this.entry.videos) {
        this.entry.videos.forEach((video) => {
          const filePath = this.getS3FilePath(
            this.datasetId,
            this.datasetVersion,
            video.dataset.path
          );
          const linkUrl = `${this.envVars.ROOT_URL}/datasets/videoviewer?dataset_version=${this.datasetVersion}&dataset_id=${this.datasetId}&file_path=${filePath}&mimetype=${video.mimetype.name}`;
          this.items['Videos'].push({
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
      if (this.resetIndex) {
        this.$refs.gallery.indicatorClicked(0);
      }
      let items = [...this.items["Dataset"]];
      if (this.category === "All") {
        for (const [key, value] of Object.entries(this.items)) {
          if (key !== "Dataset")
            items = items.concat(value);
        }
        return items;
      }
      else
        return this.items[this.category];
    },
  },
  created: function () {
    this.createSciCurnchItems();
  },
  watch: {
    category: function() {
      this.resetIndex = true;
    },
    galleryItems: function() {
      this.resetIndex = false;
    },
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
                title: `Biolucida Image`,
                type: "Image",
                thumbnail: thumbnailURL,
                userData: action,
                mimetype: 'image/png'
              };
            })
          );
        }
        this.items['Biolucida Images'] = items;
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
