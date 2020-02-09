Feature: Organization

  @wip
  Scenario: user is a member of an organization and the project is new
    Given netrc contains a GitHub token
    And the user is a member of an organization
    And no repository exists for the "organization" on GitHub
    When the project is scaffolded
    And repository settings are configured

  Scenario: user is a member of an organization and the project exists
    Given netrc contains a GitHub token
    And the user is a member of an organization
    And a repository already exists for the "organization" on GitHub
    When the project is scaffolded
#    And repository settings are configured

  @wip
  Scenario: user is not a member of the organization
    Given netrc contains a GitHub token
    And the user is not a member of the organization
    When the project is scaffolded
    Then no repository is created on GitHub
    And repository settings are configured
    And and an authorization error is thrown
