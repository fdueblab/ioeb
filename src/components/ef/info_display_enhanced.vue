<template>
  <el-dialog
    title="元应用智能体及服务详情"
    :visible.sync="dialogVisible"
    width="80%"
    :before-close="handleClose"
    class="node-info-dialog"
  >
    <div class="node-info-container" v-if="nodeData && nodeData.length > 0">
      <!-- 元应用信息卡片 -->
      <div class="app-info-section" v-if="nodeData[0]">
        <el-card class="app-card" shadow="always">
          <div slot="header" class="card-header">
            <span class="header-title">元应用信息</span>
            <div class="header-actions">
              <el-button
                v-if="!editingApp"
                type="text"
                icon="el-icon-edit"
                size="mini"
                @click="startEditApp"
                class="edit-btn"
              >
                编辑
              </el-button>
              <div v-else class="edit-actions">
                <el-button
                  type="primary"
                  size="mini"
                  @click="saveAppData"
                  :loading="savingApp"
                >
                  保存
                </el-button>
                <el-button
                  size="mini"
                  @click="cancelEditApp"
                >
                  取消
                </el-button>
              </div>
            </div>
          </div>
          <div class="app-content">
            <div class="app-name">
              <i class="el-icon-cpu" />
              <span v-if="!editingApp" class="name-text">{{ editableAppData.name }}</span>
              <el-input
                v-else
                v-model="editableAppData.name"
                class="name-input"
                placeholder="请输入元应用名称"
                ref="nameInput"
              />
            </div>
            <div class="app-description">
              <span v-if="!editingApp" class="desc-text">{{ editableAppData.des }}</span>
              <el-input
                v-else
                v-model="editableAppData.des"
                type="textarea"
                :rows="2"
                placeholder="请输入元应用描述"
                class="desc-input"
              />
            </div>
          </div>
        </el-card>
      </div>

      <!-- MCP服务列表 -->
      <div class="services-section" v-if="mcpServices.length > 0">
        <div class="section-title">
          <span>服务列表 ({{ mcpServices.length }})</span>
        </div>

        <div class="services-grid">
          <el-card
            v-for="(service, index) in mcpServices"
            :key="index"
            class="service-card"
            shadow="hover"
          >
            <div slot="header" class="service-header">
              <div class="service-title">
                <i class="el-icon-help" />
                <span class="service-name">{{ service.name }}</span>
              </div>
              <div>
                <a-badge :status="service.stateStyle" :text="service.state" />
              </div>
            </div>

            <div class="service-content">
              <!-- 服务基本信息 -->
              <div class="service-info">
                <div class="info-item" v-if="service.url">
                  <i class="el-icon-link" />
                  <span class="info-label">地址:</span>
                  <el-link
                    type="primary"
                    class="service-url"
                  >
                    {{ service.url }}
                  </el-link>
                </div>

                <div class="info-item">
                  <i class="el-icon-document" />
                  <span class="info-label">描述:</span>
                  <span class="info-value">{{ service.des }}</span>
                </div>
              </div>

              <!-- 工具列表 -->
              <div class="tools-section" v-if="service.tools && service.tools.length > 0">
                <div class="tools-header">
                  <i class="el-icon-setting"></i>
                  <span class="tools-title">包含工具 ({{ service.tools.length }})</span>
                </div>

                <div class="tools-list">
                  <el-collapse>
                    <el-collapse-item
                      v-for="tool in service.tools"
                      :key="tool.id"
                      :name="tool.id"
                      class="tool-item"
                    >
                      <template slot="title">
                        <div class="tool-header">
                          <i class="el-icon-tools"></i>
                          <span class="tool-name">{{ tool.name }}</span>
                        </div>
                      </template>

                      <div class="tool-content">
                        <div class="tool-description">
                          <i class="el-icon-info"></i>
                          <span class="desc-label">功能描述:</span>
                          <p class="desc-content">{{ tool.description }}</p>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <i class="el-icon-box"></i>
      <p>暂无数据</p>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'InfoDisplayEnhanced',
  data() {
    return {
      dialogVisible: false,
      nodeData: [],
      editingApp: false,
      savingApp: false,
      editableAppData: {
        name: '',
        des: ''
      },
      originalAppData: {
        name: '',
        des: ''
      }
    }
  },
  computed: {
    mcpServices() {
      return this.nodeData.slice(1) || []
    },
    nodeStatusTextClass() {
      return 'node-status-text'
    }
  },
  methods: {
    init(data) {
      this.nodeData = Array.isArray(data) ? data : []
      this.dialogVisible = true

      // 初始化可编辑的应用数据
      if (this.nodeData.length > 0) {
        this.editableAppData = {
          name: this.nodeData[0].name || '',
          des: this.nodeData[0].des || ''
        }
        this.originalAppData = { ...this.editableAppData }
      }
    },

    handleClose() {
      this.dialogVisible = false
      this.nodeData = []
      this.editingApp = false
      this.savingApp = false
    },

    startEditApp() {
      this.editingApp = true
      this.originalAppData = { ...this.editableAppData }

      // 下一帧聚焦到输入框
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus()
        }
      })
    },

    saveAppData() {
      // 验证数据
      if (!this.editableAppData.name.trim()) {
        this.$message.warning('元应用名称不能为空')
        return
      }

      this.savingApp = true

      // 模拟保存过程
      setTimeout(() => {
        // 更新原始数据
        if (this.nodeData.length > 0) {
          this.nodeData[0].name = this.editableAppData.name
          this.nodeData[0].des = this.editableAppData.des
        }

        this.originalAppData = { ...this.editableAppData }
        this.editingApp = false
        this.savingApp = false

        this.$message.success('保存成功')

        // 发送更新事件给父组件
        this.$emit('app-data-updated', {
          name: this.editableAppData.name,
          des: this.editableAppData.des
        })
      }, 500)
    },

    cancelEditApp() {
      // 恢复原始数据
      this.editableAppData = { ...this.originalAppData }
      this.editingApp = false

      this.$message.info('已取消编辑')
    }
  }
}
</script>

<style scoped lang="less">
.node-info-dialog {
  .el-dialog__header {
    background: linear-gradient(90deg, #f0f8ff 0%, #e6f7ff 100%);

    .el-dialog__title {
      color: #1890ff;
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
    background: #fafafa;
  }
}

.node-info-container {
  .app-info-section {
    margin-bottom: 24px;

    .app-card {
      border-radius: 12px;
      border: 2px solid #e6f7ff;
      background: linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%);

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        color: #1890ff;

        i {
          font-size: 18px;
          margin-right: 8px;
        }

        .header-title {
          font-size: 16px;
          background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-actions {
          display: flex;
          align-items: center;

          .edit-btn {
            color: #1890ff;
            padding: 0 8px;

            &:hover {
              color: #40a9ff;
            }
          }

          .edit-actions {
            display: flex;
            gap: 8px;
          }
        }
      }

      .app-content {
        .app-name {
          display: flex;
          align-items: center;
          margin-bottom: 16px;

          i {
            color: #1890ff;
            font-size: 16px;
            margin-right: 8px;
          }

          .name-text {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

                    .name-input {
            flex: 1;

            /deep/ .el-input__inner {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              border-radius: 6px;
              border-color: #e6f7ff;

              &:focus {
                border-color: #1890ff;
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
              }
            }
          }

        }

        .app-description {
          display: flex;
          align-items: flex-start;

          i {
            color: #666;
            font-size: 14px;
            margin-right: 8px;
            margin-top: 2px;
          }

          .desc-text {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
          }

          .desc-input {
            width: 100%;

            /deep/ .el-textarea__inner {
              font-size: 14px;
              color: #666;
              line-height: 1.6;
              border-radius: 6px;
              border-color: #e6f7ff;

              &:focus {
                border-color: #1890ff;
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
              }
            }
          }
        }
      }
    }
  }

  .services-section {
    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #333;

      i {
        color: #1890ff;
        font-size: 20px;
        margin-right: 8px;
      }
    }

    .services-grid {
      display: grid;
      gap: 20px;

      .service-card {
        border-radius: 12px;
        border: 1px solid #e6f7ff;
        transition: all 0.3s ease;
        background: #ffffff;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(24, 144, 255, 0.2) !important;
          border-color: #91d5ff;
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .node-status-text {
            margin-left: 8px;
            font-size: 12px;
            color: #595959;
            font-weight: 500;
          }

          .service-title {
            display: flex;
            align-items: center;

            i {
              color: #1890ff;
              font-size: 16px;
              margin-right: 8px;
            }

            .service-name {
              font-size: 16px;
              font-weight: 600;
              color: #333;
            }
          }
        }

        .service-content {
          .service-info {
            .info-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 20px;

              i {
                color: #666;
                font-size: 14px;
                margin-right: 8px;
                margin-top: 4px;
                min-width: 14px;
              }

              .info-label {
                font-weight: 600;
                color: #555;
                margin-right: 8px;
              }

              .info-value {
                color: #666;
                line-height: 1.5;
              }

              .service-url {
                font-size: 13px;
                word-break: break-all;
              }
            }
          }

          .tools-section {
            .tools-header {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;

              i {
                color: #1890ff;
                font-size: 14px;
                margin-right: 6px;
              }

              .tools-title {
                font-weight: 500;
                color: #333;
                font-size: 14px;
              }
            }

            .tools-list {
              .tool-item {
                margin-bottom: 8px;

                .tool-header {
                  display: flex;
                  align-items: center;
                  width: 100%;

                  i {
                    color: #1890ff;
                    font-size: 14px;
                    margin-right: 8px;
                  }

                  .tool-name {
                    font-weight: 500;
                    color: #333;
                    margin-right: 12px;
                  }

                }

                .tool-content {
                    padding: 12px 0;

                    .tool-description {
                      display: flex;
                      align-items: flex-start;

                      i {
                        color: #1890ff;
                        font-size: 14px;
                        margin-right: 8px;
                        margin-top: 2px;
                      }

                      .desc-label {
                        font-weight: 500;
                        color: #555;
                        margin-right: 8px;
                        min-width: 80px;
                      }

                      .desc-content {
                        color: #666;
                        line-height: 1.6;
                        margin: 0;
                      }
                    }
                  }

                  // 去掉Element UI默认样式
                  /deep/ .el-collapse-item__content {
                    padding-bottom: 0;
                  }
              }

              // 去掉Element UI默认样式
              /deep/ .el-collapse {
                border-bottom: none;
              }
            }
          }
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;

  i {
    font-size: 48px;
    color: #bfbfbf;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .node-info-dialog {
    .el-dialog {
      width: 95% !important;
      margin: 20px auto !important;
    }
  }

  .services-grid {
    grid-template-columns: 1fr !important;
  }
}

</style>
