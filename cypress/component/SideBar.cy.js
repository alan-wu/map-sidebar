import SideBar from "../../src/components/SideBar.vue"

const searchHistory = [
  { filters: [], search: "heart" },
  { filters: [], search: "lung" },
  { filters: [], search: "scaffold" },
  { filters: [], search: "pig" },
  { filters: [], search: "heart" },
]

describe("<SideBar />", () => {
  before(() => {
    cy.intercept('**/dataset_info/**').as('dataset_info')
    cy.intercept('**/discover/**').as('discover')
    cy.intercept('**/image_search/**').as('image_search')
  })

  it("Should test the SideBar browser functionality", () => {
    // Mock search history
    cy.clearLocalStorage().then(() => {
      window.localStorage.setItem(
        "sparc.science-sidebar-search-history",
        JSON.stringify(searchHistory)
      )
    })

    // see: https://on.cypress.io/mounting-vue
    cy.mount(SideBar, {
      props: {
        envVars: {
          API_LOCATION: Cypress.env("API_LOCATION"),
          ALGOLIA_KEY: Cypress.env("ALGOLIA_KEY"),
          ALGOLIA_ID: Cypress.env("ALGOLIA_ID"),
          ALGOLIA_INDEX: Cypress.env("ALGOLIA_INDEX"),
          PENNSIEVE_API_LOCATION: Cypress.env("PENNSIEVE_API_LOCATION"),
          BL_SERVER_URL: Cypress.env("BL_SERVER_URL"),
          NL_LINK_PREFIX: Cypress.env("NL_LINK_PREFIX"),
          ROOT_URL: Cypress.env("ROOT_URL"),
        },
      },
    })

    cy.get(".open-tab").should("exist").click()

    cy.wait(['@dataset_info', '@discover', '@image_search'], { timeout: 20000 })

    // Sidebar should be visible and have close tab
    cy.get('.tab-container').should('not.exist')
    cy.get(".close-tab").should("exist")
    cy.get(".sidebar-container").should("be.visible")

    // Default 10 dataset cards should be loaded
    cy.get(".dataset-card-container").should("have.length", 10)

    // Search history should be loaded
    cy.get(".history-container > .search-tag").should("have.length", 3)

    // Search history should be clickable and filter the dataset cards
    cy.get(".history-container > .search-tag").contains("heart").click()
    cy.get('.header > .el-input > .el-input__wrapper > .el-input__inner').invoke('val').then(($input) => {
      expect($input).to.equal('heart')
    })
    cy.get('.history-container > .el-select > .el-select__wrapper').click()
    cy.get('.history-container > .search-select > transition-stub > .sidebar-search-select-popper').as('fullHistory')
    cy.get('@fullHistory').should('be.visible')
    cy.get('@fullHistory').contains('scaffold').click()
    cy.get('.header > .el-input > .el-input__wrapper > .el-input__inner').invoke('val').then(($input) => {
      expect($input).to.equal('scaffold')
    })

    // Filter tags should be added and removed
    cy.get('.ml-2 > .el-tag').should('not.exist')
    cy.get('.el-cascader > .el-input > .el-input__wrapper').click()
    cy.get(':nth-child(1) > .el-cascader-menu__wrap > .el-scrollbar__view').contains('Sex').click()
    cy.get(':nth-child(2) > .el-cascader-menu__wrap > .el-scrollbar__view').contains('Male').click()
    cy.get('.ml-2 > .el-tag').should('exist').and('contain', 'Male')
    cy.get('.ml-2 > .el-tag > .el-tag__close').click()
    cy.get('.ml-2 > .el-tag').should('not.exist')

    // Dataset card content should be loaded
    cy.get(':nth-child(1) > .dataset-card-container > .dataset-card > :nth-child(2) > .card-left > .full-size > .gallery > .gallery-strip > .card-line > .key-image-span > .el-card > .el-card__body > :nth-child(1) > .cursor-pointer > img').should('exist')
    cy.get(':nth-child(1) > .dataset-card-container > .dataset-card > :nth-child(2) > .card-left > .full-size > .gallery > .gallery-strip > .card-line > .key-image-span > .el-card > .el-card__body > :nth-child(1) > .details > .el-button').should('exist')
    cy.get(':nth-child(1) > .dataset-card-container > .dataset-card > :nth-child(2) > .card-right > .title').should('exist')
    cy.get(':nth-child(1) > .dataset-card-container > .dataset-card > :nth-child(2) > .card-right > :nth-child(2)').should('exist')
  })
})