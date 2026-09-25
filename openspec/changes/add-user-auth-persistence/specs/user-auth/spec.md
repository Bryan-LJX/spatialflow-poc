# Spec Delta

## Purpose

Lets a SpatialFlow visitor create an identity and prove it on return visits,
so the site can tell one visitor's data apart from another's.

## ADDED Requirements

### Requirement: Visitor can register an account
The system SHALL allow a visitor to create an account with an email address
and password.

#### Scenario: Successful registration
- **WHEN** a visitor submits a new, unused email address and a password
  meeting the minimum length requirement
- **THEN** an account is created and the visitor is informed their
  registration succeeded

#### Scenario: Registration with an already-registered email
- **WHEN** a visitor submits an email address that already has an account
- **THEN** the system rejects the registration and shows an error identifying
  the email as already in use, without revealing account details

### Requirement: Visitor can log in
The system SHALL allow a visitor with an existing account to log in using
their email and password.

#### Scenario: Successful login
- **WHEN** a visitor submits the correct email and password for an existing
  account
- **THEN** the visitor is signed in and the site recognizes them as that
  account on subsequent actions in the same session

#### Scenario: Login with incorrect credentials
- **WHEN** a visitor submits an email/password combination that does not
  match any account
- **THEN** the system rejects the login and shows a generic error that does
  not reveal whether the email exists

### Requirement: Signed-in visitor can log out
The system SHALL allow a signed-in visitor to end their session.

#### Scenario: Successful logout
- **WHEN** a signed-in visitor chooses to log out
- **THEN** the site no longer recognizes them as signed in, and any
  personalized content reverts to the signed-out experience

### Requirement: Session persists across page reloads
The system SHALL keep a visitor signed in across a page reload or a new
browser tab on the same browser, until they explicitly log out or the
session expires.

#### Scenario: Reload while signed in
- **WHEN** a signed-in visitor reloads the page
- **THEN** the visitor remains signed in without re-entering credentials

#### Scenario: Reload after logout
- **WHEN** a visitor who has logged out reloads the page
- **THEN** the visitor is shown the signed-out experience and is not treated
  as any account
