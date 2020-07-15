Feature: Not Authenticated

  Scenario: no authentication
    Given no authentication is provided
    And next steps are provided
    When the project is scaffolded
    Then no repository is created on GitHub
    And no issues are created for next-steps
    But repository settings are configured
    And no repository details are returned

  Scenario: ~/.netrc contains no GitHub token
    Given netrc contains no GitHub token
    When the project is scaffolded
    Then no repository is created on GitHub
    And repository settings are configured
    And no repository details are returned
