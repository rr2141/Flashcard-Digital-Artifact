describe('Navigation Bar', () => {
  beforeEach(() => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/');
    });
  });

  it('should display the navigation links', () => {
    cy.contains('Create').should('be.visible');
    cy.contains('Flashcards').should('be.visible');
    cy.contains('Collections').should('be.visible');
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('should navigate to the Create page', () => {
    cy.contains('Create').click();
    cy.url().should('include', '/create');
  });

  it('should navigate to the Flashcards page', () => {
    cy.contains('Flashcards').click();
    cy.url().should('include', '/my-flashcards');
  });

  it('should navigate to the Collections page', () => {
    cy.contains('Collections').click();
    cy.url().should('include', '/collection');
  });

  it('should restrict access to the Admin Dashboard for non-admin users', () => {
    cy.visit('/');
    cy.contains('Admin Dashboard').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('You are not authorised to access the Admin Dashboard!');
    });
    cy.url().should('not.include', '/admin-dashboard');
  });

  it('should allow access to the Admin Dashboard for admin users', () => {
    cy.login('testuser5', 'password123').then(() => {
      cy.visit('/');
      cy.contains('Admin Dashboard').click();
      cy.url().should('include', '/admin-dashboard');
    });
  });

  it('should log out the user', () => {
    cy.contains('testuser').click();
    cy.contains('Sign out').click();
    cy.url().should('include', '/signin');
  });
});