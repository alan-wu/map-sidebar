import SideBar from '../../src/components/SideBar.vue'

describe('<SideBar />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(SideBar, {
      propsData:{
        tabArray: [{ title: 'Flatmap', id: 1 }],
        contextArray: [null, null, null],
        sideBarVisibility: true,
        envVars: {
          API_LOCATION: Cypress.env('API_LOCATION'),
          ALGOLIA_KEY: Cypress.env('ALGOLIA_KEY'),
          ALGOLIA_ID: Cypress.env('ALGOLIA_ID'),
          ALGOLIA_INDEX: Cypress.env('ALGOLIA_INDEX'),
          PENNSIEVE_API_LOCATION: Cypress.env('PENNSIEVE_API_LOCATION'),
          BL_SERVER_URL: Cypress.env('BL_SERVER_URL'),
          NL_LINK_PREFIX: Cypress.env('NL_LINK_PREFIX'),
          ROOT_URL: Cypress.env('ROOT_URL'),
        },
        activeId: 1,
      }
    })
  })
})