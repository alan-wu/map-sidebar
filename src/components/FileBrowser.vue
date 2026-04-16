<template>
  <div>
    <div class="badges-container">
        <BadgesGroup
          :displayDataset="false"
          :displayText="false"
          :items="items"
          @categoryChanged="categoryChanged"
        />
      </div>
    <el-table
      v-if="fileLists"
      :data="fileLists"
      style="width: 100%;"
      height="600"
      :stripe="true"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="file-details" m="4">
            <p m="t-0 b-2" v-if="props.row.description">
              <b>Description:</b> {{ props.row.description }}
            </p>
            <p m="t-0 b-2" v-if="props.row.protocol">
              <b>Protocol</b>: {{ props.row.protocol }}
            </p>
            <div v-for="(val, key) in props.row.columns">
              <p :key="key" m="t-0 b-2">Column {{ key + 1 }}: {{ val }}</p>
            </div>
            <p m="t-0 b-2">
              <b>File path:</b> {{ props.row.filePath }}
            </p>
            <p m="t-0 b-2" v-if="props.row.protocol">
              Protocol: {{ props.row.protocol }}
            </p>
            <div v-for="(val, key) in props.row.columns">
              <p :key="key" m="t-0 b-2">Column {{ key + 1 }}: {{ val }}</p>
            </div>
            <p m="t-0 b-2">File path: {{ props.row.filePath }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="thumbnail"
        label="Thumbnail"
        width="170"
      >
        <template #default="scope">
          <el-image
            v-if="scope.row.thumbnail"
            :src="scope.row.thumbnail"
            style="max-width: 150px; max-height: 150px"
            fit="contain"
            lazy
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="fileName"
        label="File name"
        width="200"
        class-name="column-text"
      />
      <el-table-column
        prop="type"
        label="Type"
        width="100"
        class-name="column-text"
      />
      <el-table-column
        fixed="right"
      >
        <template #header>
          <el-input v-model="search" size="small" placeholder="Type to search" clearable/>
        </template>
        <template #default="scope">
          <el-button
            size="small"
            @click="handleView(scope.row)"
          >
            {{ getActionLabel(scope.row.type) }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
//provide the s3Bucket related methods and data.
import BadgesGroup from './BadgesGroup.vue'
import {
  ElButton as Button,
  ElImage as Image,
  ElInput as Input,
  ElTable as Table,
  ElTableColumn as TableColumn
} from "element-plus";
import { ref } from 'vue'

export default {
  name: 'FileBrowser',
  components: {
    BadgesGroup,
    Button,
    Image,
    Input,
    Table,
    TableColumn
  },
  data() {
    return {
      category: "All",
      items: {
        Dataset: [],
        Flatmaps:[],
        Scaffolds: [],
        Simulations: [],
        Plots: [],
      },
      search: "",
      tableData: undefined,
    }
  },
  methods: {
    categoryChanged: function(name) {
      this.category = name
    },
    getActionLabel: function(type) {
      if (type === "Simulations" || type === "Protocol Data") {
        return "Run"
      } else {
        return "View"
      }
    },
    setSearchTerm: function(searchTerm) {
      this.search = searchTerm
    },
    handleView: function(row) {
      this.$emit("fileActionTriggered", row.action)
    },
    downloadThumbnail: async function(url, entry) {
      const response = await fetch(url)
      if (response.ok) {
        let data = await response.text()
        if (typeof data === 'string' && data.startsWith('data:')) {
          entry.thumbnail = data
        } else {
          if (entry.mimetype) {
            entry.thumbnail = `data:${entry.mimetype};base64,${data}`
          } else {
            entry.thumbnail = data
          }
          let index = this.tableData.findIndex((item) => item.filePath === entry.filePath);
          if (index > -1) {
            this.tableData[index] = {...entry}
          }
        }
      }
    },
    setData: function(data) {
      Object.assign(this.items, data)
      this.tableData = ref([])
      this.category = "All"
      this.search = ""
      Object.keys(data).forEach((key) => {
        if (key !== "Dataset") {
          data[key].forEach((item) => {
            const entry = {
              action: item.userData,
              description: item.description ? item.description : "",
              protocol: item.protocol ? item.protocol : "",
              columns: [],
              fileName: item.title,
              filePath: item.filePath,
              mimetype: item.mimetype,
              type: key,
            }
            if (item.columns && item.columns.length > 0) {
              item.columns.forEach((column) => entry.columns.push(JSON.stringify(column)))
            }

            this.tableData.push(entry)
            if (item.thumbnail?.includes("encodeBase64")) {
              this.downloadThumbnail(item.thumbnail, entry)
            } else {
              entry.thumbnail = item.thumbnail
            }
          })
        }
      })
    }
  },
  computed: {
    fileLists() {
      if (!this.search && this.category === "All") return this.tableData
      const keys = ["fileName", "filePath", "description", "type", "protocol"]
      const lower = this.search.toLowerCase()
      const list = this.tableData.filter((data) => {
        if (this.category !== "All") {
          if (data.type !== this.category) {
            return false
          }
        }
        for (let key of keys) {
          if (data[key] && data[key].toLowerCase().includes(lower)) {
            return true
          }
        }
        if (data.columns) {
          for (let column of data.columns) {
            if (column.toLowerCase().includes(lower)) {
              return true
            }
          }
        }
      })
      return list
    }
  },
}
</script>

<style lang="scss" scoped>
.badges-container {
  padding-bottom: 8px;
}

:deep(.el-table__body-wrapper) {
  .column-text {
    font-size: 12px;
  }
}

.file-details {
  padding-left: 8px;
  font-size: 12px;
}
</style>
