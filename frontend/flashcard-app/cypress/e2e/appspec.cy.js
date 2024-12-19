describe('App Navigation and Routing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should redirect to the sign-in page if not authenticated', () => {
    cy.visit('/create');
    cy.url().should('include', '/signin');
  });

  it('should allow navigation to the Create page when authenticated', () => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/create');
      cy.url().should('include', '/create');
    });
  });

  it('should allow navigation to the Flashcards page when authenticated', () => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/my-flashcards');
      cy.url().should('include', '/my-flashcards');
    });
  });

  it('should allow navigation to the Collections page when authenticated', () => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/collection');
      cy.url().should('include', '/collection');
    });
  });

  it('should restrict access to the Admin Dashboard for non-admin users', () => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/admin-dashboard');
      cy.url().should('not.include', '/admin-dashboard');
      cy.url().should('include', '/');
    });
  });

  it('should allow access to the Admin Dashboard for admin users', () => {
    cy.login('testuser5', 'password123').then(() => {
      cy.visit('/admin-dashboard');
      cy.url().should('include', '/admin-dashboard');
    });
  });

  it('should log out the user and redirect to the sign-in page', () => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/');
      cy.contains('testuser').click();
      cy.contains('Sign out').click();
      cy.url().should('include', '/signin');
    });
  });
});