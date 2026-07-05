import ky from "ky"
import { type ClubConfig, defaultClubConfig, parseClubConfig } from "../config"
import { renderLoadError } from "../render/common"
import { baseStyles } from "../render/styles"

export abstract class OdgcBaseElement extends HTMLElement {
  private readonly root: ShadowRoot
  private configOverride: ClubConfig | null = null

  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open" })
  }

  set config(value: unknown) {
    this.configOverride = parseClubConfig(value)
    if (this.isConnected) {
      void this.update()
    }
  }

  async connectedCallback(): Promise<void> {
    await this.update()
  }

  protected abstract renderWithConfig(config: ClubConfig): Promise<string>

  protected afterRender(_root: ShadowRoot, _config: ClubConfig): void {
    return
  }

  private async update(): Promise<void> {
    this.root.innerHTML = `${baseStyles}<div class="odgc-shell"><p class="odgc-muted">Loading...</p></div>`
    try {
      const config = await this.loadConfig()
      const html = await this.renderWithConfig(config)
      this.root.innerHTML = `${baseStyles}${html}`
      this.afterRender(this.root, config)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown rendering failure"
      this.root.innerHTML = `${baseStyles}<div class="odgc-shell">${renderLoadError(message)}</div>`
    }
  }

  private async loadConfig(): Promise<ClubConfig> {
    if (this.configOverride) {
      return this.configOverride
    }

    const configUrl = this.getAttribute("config-url")
    if (configUrl) {
      const payload: unknown = await ky.get(configUrl).json()
      return parseClubConfig(payload)
    }

    const inline = this.readInlineConfig()
    return inline ?? defaultClubConfig
  }

  private readInlineConfig(): ClubConfig | null {
    const script = this.querySelector<HTMLScriptElement>('script[type="application/json"]')
    const text = script?.textContent
    if (!text || text.trim().length === 0) {
      return null
    }

    const payload: unknown = JSON.parse(text)
    return parseClubConfig(payload)
  }
}
