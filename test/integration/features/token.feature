Feature: Authenticated with token in ~/.netrc

  Scenario: new project
    Given netrc contains a GitHub token
    And no repository exists on GitHub
    When the project is scaffolded
    Then a repository is created on GitHub

  Scenario: existing project
    Given netrc contains a GitHub token
    And a repository already exists on GitHub
    When the project is scaffolded
    Then no repository is created on GitHub
