Feature: Not Authenticated

  Scenario: new project
    Given no authentication is provided
    When the project is scaffolded
    Then no repository is created on GitHub
