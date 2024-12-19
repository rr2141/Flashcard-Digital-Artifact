describe('Collection Page', () => {
  beforeEach(() => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/collection');
    });
  });

  it('should display the collections', () => {
    cy.contains('Your Collections').should('be.visible');
  });

  it('should create a new collection', () => {
    cy.contains('Add Collection').click();
    cy.get('input[type="text"]').type('New Collection Comment');
    cy.get('select').select(['testing', 'New Flashcard Set']);
    cy.contains('Create').click();
  });

  it('should edit a collection', () => {
    cy.contains('434', { timeout: 10000 })
      .closest('div')
      .find('button')
      .contains('Edit')
      .click();            

    cy.get('input[type="text"]').clear().type('Updated Collection Comment');
    cy.contains('Save Changes').click();
    cy.contains('Updated Collection Comment', { timeout: 10000 }).should('be.visible');
  });

  it('should delete a collection', () => {
    cy.contains('Updated Collection Comment', { timeout: 10000 })
      .closest('div')
      .find('button')
      .contains('Delete')
      .click();

    cy.on('window:confirm', () => true); 
    cy.contains('Updated Collection Comment', { timeout: 10000 }).should('not.exist');
  });
});
