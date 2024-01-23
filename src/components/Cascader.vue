<script>
import { ElCascader as Cascader } from 'element-plus'

export default {
  name: 'CustomCascader',
  extends: Cascader,
  setup: Cascader.setup,
  methods: {
    //Modify this internal function to disable Show all tags
    computePresentTags() {
      const { isDisabled, leafOnly, showAllLevels, separator, collapseTags } =
        this
      const checkedNodes = this.getCheckedNodes(leafOnly)
      const tags = []
      const genTag = (node) => ({
        node,
        key: node.uid,
        text: node.getText(showAllLevels, separator),
        hitState: false,
        closable: !isDisabled && !node.isDisabled,
      })
      let customNodes = checkedNodes.filter((node) => {
        return !node.getText(showAllLevels, separator).includes('Show all')
      })
      if (customNodes.length) {
        const [first, ...rest] = customNodes
        const restCount = rest.length
        tags.push(genTag(first))
        if (restCount) {
          if (collapseTags) {
            tags.push({
              key: -1,
              text: `+ ${restCount}`,
              closable: false,
            })
          } else {
            rest.forEach((node) => tags.push(genTag(node)))
          }
        }
      }
      this.checkedNodes = checkedNodes
      this.presentTags = tags
      this.$emit('tags-changed', this.presentTags)
    },
  },
}
</script>
