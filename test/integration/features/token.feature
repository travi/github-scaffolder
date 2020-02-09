Feature: Authenticated with token in ~/.netrc

  Scenario: new project
    Given netrc contains a GitHub token
    And no repository exists for the "user" on GitHub
    When the project is scaffolded
    Then a repository is created on GitHub
    And repository settings are configured
    And repository details are returned

  Scenario: existing project
    Given netrc contains a GitHub token
    And a repository already exists for the "user" on GitHub
    When the project is scaffolded
    Then no repository is created on GitHub
    But repository details are returned
    And repository settings are configured
