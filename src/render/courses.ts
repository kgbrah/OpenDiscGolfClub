import type { z } from "zod"
import type { CoursesSectionSchema } from "../config"
import { actionClassName, buildCourseActions } from "../lib/course-actions"
import { escapeAttribute, escapeHtml, optionalText } from "../lib/html"
import { renderEmpty, renderSectionHeader } from "./common"

type CoursesSection = z.infer<typeof CoursesSectionSchema>

export function renderCourses(section: CoursesSection): string {
  const groups = section.groups
  if (groups.length === 0) {
    return sectionShell(section.title, renderEmpty("No courses have been added yet."))
  }

  const body = groups.map(renderCourseGroup).join("")
  return sectionShell(section.title, body)
}

function sectionShell(title: string, body: string): string {
  return `
    <section class="odgc-section">
      ${renderSectionHeader(title)}
      ${body}
    </section>
  `
}

function renderCourseGroup(group: CoursesSection["groups"][number]): string {
  const description = group.description
    ? `<p class="odgc-description">${escapeHtml(group.description)}</p>`
    : ""
  const cards = group.courses.map(renderCourseCard).join("")

  return `
    <div class="odgc-section">
      <div class="odgc-section-header">
        <h3 class="odgc-card-title">${escapeHtml(group.title)}</h3>
        ${description}
      </div>
      <div class="odgc-grid">${cards}</div>
    </div>
  `
}

function renderCourseCard(course: CoursesSection["groups"][number]["courses"][number]): string {
  const image = course.imageUrl
    ? `<img src="${escapeAttribute(course.imageUrl)}" alt="${escapeAttribute(course.name)}" loading="lazy" />`
    : ""
  const imageHtml = image ? `<div class="odgc-course-image">${image}</div>` : ""
  const meta = renderCourseMeta(course)
  const difficulty = course.difficulty
    ? `<span class="odgc-badge">${escapeHtml(course.difficulty)}</span>`
    : ""
  const description = course.description
    ? `<p class="odgc-description">${escapeHtml(course.description)}</p>`
    : ""
  const actions = buildCourseActions(course)
    .map(
      (action) => `
        <a class="odgc-button is-secondary ${actionClassName(action.kind)}"
          href="${escapeAttribute(action.url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(action.label)}
        </a>
      `,
    )
    .join("")

  return `
    <article class="odgc-card">
      ${imageHtml}
      <div class="odgc-meta">${difficulty}<span>${escapeHtml(course.location)}</span></div>
      <h4 class="odgc-card-title">${escapeHtml(course.name)}</h4>
      ${meta}
      ${description}
      ${actions ? `<div class="odgc-actions">${actions}</div>` : ""}
    </article>
  `
}

function renderCourseMeta(course: CoursesSection["groups"][number]["courses"][number]): string {
  const values = [
    course.holes ? `${course.holes} holes` : "",
    optionalText(course.rating ? `${course.rating} rating` : undefined),
    optionalText(course.time),
  ].filter((value) => value.length > 0)

  if (values.length === 0) {
    return ""
  }

  return `<div class="odgc-meta">${values.map((value) => `<span>${value}</span>`).join("")}</div>`
}
