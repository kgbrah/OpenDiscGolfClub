import type { ClubConfig } from "../config"
import { renderCourses } from "../render/courses"
import { OdgcBaseElement } from "./base"

export class OdgcCoursesElement extends OdgcBaseElement {
  protected async renderWithConfig(config: ClubConfig): Promise<string> {
    return `<div class="odgc-shell">${renderCourses(config.courses)}</div>`
  }
}
