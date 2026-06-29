jest.mock('@/components/ef/simulation_builder', () => ({
  name: 'SimulationBuilder',
  template: '<div />'
}))

jest.mock('@/components/ef/smart_chat', () => ({
  name: 'SmartChat',
  template: '<div />'
}))

jest.mock('@/components/ef/panel_enhanced', () => ({
  name: 'FlowPanel',
  template: '<div />'
}))

jest.mock('@/components/ef/meta_app_build/PrepublishView.vue', () => ({
  name: 'PrepublishView',
  template: '<div />'
}))

jest.mock('@/api/service', () => ({
  getServicesByVerticalType: jest.fn(() => Promise.resolve({ status: 'success', services: [] })),
  filterServices: jest.fn((services) => services),
  deployService: jest.fn(() => Promise.resolve({ status: 'success' })),
  stopService: jest.fn(() => Promise.resolve({ status: 'success' })),
  deleteService: jest.fn(() => Promise.resolve({ status: 'success' }))
}))

jest.mock('@/utils/dictionaryCache', () => ({
  __esModule: true,
  default: {
    loadDict: jest.fn((key) => Promise.resolve(
      key === 'status'
        ? [{ code: 'pre_release_unrated', text: '预发布(未测评)' }]
        : [{ code: 'pre_release_unrated', text: 'processing' }]
    ))
  }
}))

import { shallowMount } from '@vue/test-utils'
import GenericContainerManage from '@/views/operation/GenericContainerManage.vue'
import MetaAppBuildShell from '@/components/ef/meta_app_build/MetaAppBuildShell.vue'

test('ops table exposes pre_release_unrated meta app for deploy', async () => {
  const wrapper = shallowMount(GenericContainerManage, {
    propsData: { verticalType: 'health' },
    mocks: {
      $message: { error: jest.fn(), success: jest.fn() },
      $router: { push: jest.fn() }
    },
    stubs: ['page-header-wrapper', 'a-card', 'a-form', 'a-row', 'a-col', 'a-form-item', 'a-input', 'a-select', 'a-select-option', 'a-button', 'a-table', 'a-badge', 'a-divider']
  })
  await wrapper.vm.$nextTick()
  await wrapper.vm.initData()
  wrapper.vm.dataSource = [{
    id: 'meta-1',
    name: 'Meta App',
    type: 'meta',
    status: 'pre_release_unrated',
    dockerImage: 'fdueblab/meta-app-agent:latest'
  }]
  wrapper.vm.filteredDataSource = wrapper.vm.dataSource
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.filteredDataSource[0].status).toBe('pre_release_unrated')
  expect(wrapper.vm.statusFilter('pre_release_unrated')).toBe('预发布(未测评)')
  wrapper.destroy()
})

test('MetaAppBuildShell mounts with workbench props', () => {
  const wrapper = shallowMount(MetaAppBuildShell, {
    propsData: {
      verticalType: 'health',
      appName: 'Test App',
      domainLabel: 'health'
    },
    stubs: {
      MacroBar: true,
      SimulationBuildLeftPanel: true,
      SimulationDetailSidebar: true,
      WorkbenchDetailDock: true,
      'a-icon': true,
      'a-button': true
    }
  })
  expect(wrapper.exists()).toBe(true)
  expect(wrapper.props('verticalType')).toBe('health')
  wrapper.destroy()
})
