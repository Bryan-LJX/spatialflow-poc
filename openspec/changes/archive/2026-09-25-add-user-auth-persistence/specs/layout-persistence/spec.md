# Spec Delta

## Purpose

Lets a signed-in visitor's planner layout follow them across devices and
browser sessions by storing it server-side instead of only in their current
browser.

## ADDED Requirements

### Requirement: Signed-in visitor's layout is saved to their account
The system SHALL save a signed-in visitor's planner layout (room and placed
items) so that it can be retrieved later, from any device, by that same
account.

#### Scenario: Layout saved while signed in
- **WHEN** a signed-in visitor adds, moves, rotates, or removes an item, or
  changes the room preset
- **THEN** the updated layout is saved to that visitor's account

#### Scenario: Save fails while offline or the storage service is unreachable
- **WHEN** a signed-in visitor changes their layout but the storage service
  cannot be reached
- **THEN** the visitor is shown a non-blocking warning that the change was
  not saved, and their in-progress edits in the browser are not lost or
  reverted

### Requirement: Signed-in visitor's layout is restored on login
The system SHALL load a signed-in visitor's most recently saved layout when
they sign in, replacing whatever layout was showing beforehand.

#### Scenario: Returning signed-in visitor with a previously saved layout
- **WHEN** a visitor signs in on any device, having previously saved a layout
- **THEN** that saved layout is loaded and displayed in the planner

#### Scenario: First-time signed-in visitor with no saved layout yet
- **WHEN** a visitor signs in for the first time, having never saved a layout
- **THEN** the planner shows the same default empty layout a signed-out
  visitor would see

### Requirement: A visitor can only access their own saved layout
The system SHALL ensure a visitor can only read or write the layout
associated with their own account, never another account's layout.

#### Scenario: Attempt to access another account's layout
- **WHEN** a signed-in visitor's client attempts to read or write layout data
  belonging to a different account
- **THEN** the request is rejected and no data from the other account is
  returned or modified

### Requirement: Signed-out visitor retains the local, single-device planner
The system SHALL continue to let a signed-out visitor use the planner with a
layout stored only in their current browser, unchanged from prior behavior.

#### Scenario: Signed-out visitor uses the planner
- **WHEN** a visitor who is not signed in adds items to the planner and
  reloads the page in the same browser
- **THEN** their layout is restored from local browser storage, exactly as
  before this change

#### Scenario: Signed-out visitor's layout does not follow them
- **WHEN** a visitor who is not signed in opens the site in a different
  browser or device
- **THEN** they see the default empty layout, not a layout from their other
  browser
