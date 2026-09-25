# planner-page Specification

## Purpose
Lets a visitor reach the Micro-Office Layout Builder as its own destination,
separate from the marketing site, while keeping their identity and saved
layout consistent wherever they arrive from.

## Requirements

### Requirement: Visitor can navigate from the marketing site to the planner
The system SHALL provide a link from the marketing site to a dedicated
planner page, and the planner SHALL be usable whether reached via that link
or opened directly.

#### Scenario: Visitor follows the planner link from the marketing site
- **WHEN** a visitor selects the planner call-to-action on the marketing site
- **THEN** they are taken to the dedicated planner page and can immediately
  place, move, rotate, and remove furniture items

#### Scenario: Visitor opens the planner page directly
- **WHEN** a visitor navigates straight to the planner page's URL without
  having visited the marketing site first
- **THEN** the planner page loads and functions the same as when reached via
  the marketing site's link

### Requirement: Marketing site presents the planner as a linked destination
The system SHALL present the planner as a page the visitor navigates to, not
as a section embedded in the marketing site's scroll flow.

#### Scenario: Visitor browses the marketing site
- **WHEN** a visitor scrolls through the marketing site end to end
- **THEN** they do not encounter an embedded, interactive furniture-placement
  tool in the scroll flow, and instead see a clearly labeled link to open the
  planner

#### Scenario: Visitor without JavaScript reaches the planner link
- **WHEN** a visitor loads the marketing site with JavaScript disabled or
  blocked
- **THEN** the planner link remains a plain, navigable link that still opens
  the planner page

### Requirement: Sign-in state and saved layout carry over between pages
The system SHALL keep a visitor's signed-in identity and, for signed-in
visitors, their saved layout consistent when they move between the marketing
site and the planner page.

#### Scenario: Signed-in visitor moves from the marketing site to the planner
- **WHEN** a signed-in visitor follows the link from the marketing site to
  the planner page
- **THEN** they arrive already signed in and see their most recently saved
  layout, without being asked to sign in again

#### Scenario: Signed-out visitor opens the planner page
- **WHEN** a visitor who is not signed in opens the planner page, whether
  directly or via the marketing site's link
- **THEN** they see the same signed-out, locally-stored planner experience
  described in `layout-persistence`, with no error or broken state
