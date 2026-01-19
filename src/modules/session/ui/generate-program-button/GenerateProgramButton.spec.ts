import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useSessionStore, SessionStatus, GenerateProgramButton } from '@/modules/session'
import { createTestPinia } from '@/__tests__/helpers/pinia'

const ButtonStub = {
  template: '<button v-bind="$attrs"><slot /></button>',
}

describe('GenerateProgramButton', () => {
  it('starts a session when idle', async () => {
    const pinia = createTestPinia()
    const sessionStore = useSessionStore()

    sessionStore.sessionStatus = SessionStatus.Idle

    const startSpy = vi.spyOn(sessionStore, 'startSession').mockImplementation(() => {})
    const restartSpy = vi.spyOn(sessionStore, 'restartSession').mockResolvedValue()

    const wrapper = mount(GenerateProgramButton, {
      global: {
        plugins: [pinia],
        stubs: { Button: ButtonStub },
      },
    })

    await wrapper.get('button').trigger('click')

    expect(startSpy).toHaveBeenCalledTimes(1)
    expect(restartSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Generate Program')
  })

  it('restarts the session when initialized', async () => {
    const pinia = createTestPinia()
    const sessionStore = useSessionStore()

    sessionStore.sessionStatus = SessionStatus.Initialized

    const startSpy = vi.spyOn(sessionStore, 'startSession').mockImplementation(() => {})
    const restartSpy = vi.spyOn(sessionStore, 'restartSession').mockResolvedValue()

    const wrapper = mount(GenerateProgramButton, {
      global: {
        plugins: [pinia],
        stubs: { Button: ButtonStub },
      },
    })

    await wrapper.get('button').trigger('click')

    expect(restartSpy).toHaveBeenCalledTimes(1)
    expect(startSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Regenerate Program')
  })
})
