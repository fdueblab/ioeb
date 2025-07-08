<template>
  <a-card :bordered="false">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <!-- 属性标签筛选（多选框） -->
        <a-col :span="24">
          <a-form-item label="">
            <a-checkbox-group v-model="filterValues.attribute" @change="handleTagChange('attribute', $event)">
              <a-checkbox v-for="item in attributeArr" :key="item.code" :value="item.code">
                {{ item.text }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <!-- 类型标签筛选（下拉框） -->
        <a-col :span="4">
          <a-form-item label="资源类型">
            <a-select
              v-model="filterValues.type"
              placeholder="请选择类型"
              @change="handleTagChange('type', $event)"
              allow-clear
            >
              <a-select-option v-for="item in typeArr" :key="item.code" :value="item.code">
                {{ item.text }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <!-- 行业标签筛选（下拉框） -->
        <a-col :span="4">
          <a-form-item label="行业">
            <a-select
              v-model="filterValues.industry"
              placeholder="请选择行业"
              @change="handleTagChange('industry', $event)"
              allow-clear
            >
              <a-select-option v-for="item in industryArr" :key="item.code" :value="item.code">
                {{ item.text }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <!-- 场景标签筛选（下拉框） -->
        <a-col :span="4">
          <a-form-item label="场景">
            <a-select
              v-model="filterValues.scenario"
              placeholder="请选择场景"
              @change="handleTagChange('scenario', $event)"
              allow-clear
            >
              <a-select-option v-for="item in scenarioArr" :key="item.code" :value="item.code">
                {{ item.text }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <!-- 技术标签筛选（下拉框） -->
        <a-col :span="4">
          <a-form-item label="技术">
            <a-select
              v-model="filterValues.technology"
              placeholder="请选择技术"
              @change="handleTagChange('technology', $event)"
              allow-clear
            >
              <a-select-option v-for="item in technologyArr" :key="item.code" :value="item.code">
                {{ item.text }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-card>
</template>

<script>
export default {
  name: 'FilterCard',
  props: {
    attributeArr: {
      type: Array,
      default: () => []
    },
    typeArr: {
      type: Array,
      default: () => []
    },
    industryArr: {
      type: Array,
      default: () => []
    },
    scenarioArr: {
      type: Array,
      default: () => []
    },
    technologyArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      filterValues: {
        attribute: [],
        type: undefined,
        industry: undefined,
        scenario: undefined,
        technology: undefined
      }
    }
  },
  methods: {
    handleTagChange(field, value) {
      this.filterValues[field] = value
      this.$emit('filter-change', this.filterValues)
    },

    // 重置筛选
    reset() {
      this.filterValues = {
        attribute: [],
        type: undefined,
        industry: undefined,
        scenario: undefined,
        technology: undefined
      }
      this.$emit('filter-change', this.filterValues)
    }
  }
}
</script>
