describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.login('testuser5', 'password123').then(() => {
      cy.visit('/admin-dashboard');
    });
  });

  it('should display the manage flashcard set limit section', () => {
    cy.contains('Manage Flashcard Set Limit').should('be.visible');
    cy.contains('Current Daily Flashcard Set Limit:').should('be.visible');
  });

  it('should update the flashcard set limit', () => {
    cy.get('input[type="number"]').type('20');
    cy.contains('Update Limit').click();
    cy.contains('Current Daily Flashcard Set Limit: 20').should('be.visible');
  });

  it('should display the users list', () => {
    cy.contains('All Users').should('be.visible');
    cy.contains('Loading users...').should('not.exist');
  });

  it('should create and delete a user', () => {
    cy.request('POST', `${Cypress.env('apiUrl')}/api/users`, {
      username: 'testuser3',
      password: 'password123',
    }).then((response) => {
      expect(response.status).to.eq(201);
      const { id } = response.body;

      cy.visit('/admin-dashboard');

      cy.contains('testuser3', { timeout: 10000 })
        .closest('li')
        .find('button')
        .contains('Delete')
        .click();

      cy.on('window:confirm', () => true); 
      cy.contains('testuser3', { timeout: 10000 }).should('not.exist');
    });
  });
  
});