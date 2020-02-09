Feature: Not Authenticated

  Scenario: no authentication
    Given no authentication is provided
    When the project is scaffolded
    Then no repository is created on GitHub

  Scenario: ~/.netrc contains no GitHub token
    Given netrc contains no GitHub token
    When the project is scaffolded
    Then no repository is created on GitHub
