# SideBar Live Demo

## Live Demo

<div class="demo-map-container">
  <div class="demo-map-container-inner">
    <ClientOnly>
      <iframe
        src="https://mapcore-demo.org/current/mapintegratedvuer/"
      >
      </iframe>
    </ClientOnly>
  </div>
</div>

<script setup>
import { defineClientComponent } from "vitepress";
import "./demo-styles.css";

const SideBar = defineClientComponent(() => {
  return import("../src/components/SideBar.vue");
})
</script>

<script>
export default {
  data: function() {
    return {
    };
  }
}
</script>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <SideBar
      ref="sideBar"
      :envVars="envVars"
      :visible="sideBarVisibility"
      :class="['side-bar', { 'start-up': startUp }]"
      :activeId="activeDockedId"
      :open-at-start="startUp"
      @actionClick="actionClick"
      @tabClicked="tabClicked"
      @search-changed="searchChanged($event)"
      @contextUpdate="contextUpdate($event)"
    />
  </div>

  <script>
    import { SideBar } from "@abi-software/map-side-bar";

    export default {
      components: { SideBar },
      data: function () {
        return {
          sideBarVisibility: true,
          startUp: true,
          search: '',
          activeDockedId : 1,
        }
      }
    }
  </script>
```
