describe('Sign In Page', () => {
  beforeEach(() => {
    cy.visit('/signin');
  });

  it('should display the sign-in form', () => {
    cy.contains('Sign in to your account').should('be.visible');
  });

  it('should sign in as a regular user and navigate to my flashcards', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/users/login`, {
      statusCode: 200,
      body: {
        token: 'regularUserToken',
        user: {
          id: 1,
          username: 'testuser',
          admin: false,
        },
      },
    }).as('loginRequest');

    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.token).to.eq('regularUserToken');
      localStorage.setItem('token', interception.response.body.token);
      localStorage.setItem('user', JSON.stringify(interception.response.body.user));
    });

    cy.url().should('include', '/my-flashcards');
  });

  it('should sign in as an admin user and navigate to admin dashboard', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/users/login`, {
      statusCode: 200,
      body: {
        token: 'adminUserToken',
        user: {
          id: 2,
          username: 'testuser5',
          admin: true,
        },
      },
    }).as('loginRequest');

    cy.get('input[name="username"]').type('testuser5');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.token).to.eq('adminUserToken');
      localStorage.setItem('token', interception.response.body.token);
      localStorage.setItem('user', JSON.stringify(interception.response.body.user));
    });

    cy.url({ timeout: 10000 }).should('include', '/admin-dashboard');
  });

  it('should display an error message for invalid credentials', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/users/login`, {
      statusCode: 401,
      body: {
        error: 'Invalid username or password',
      },
    }).as('loginRequest');

    cy.get('input[name="username"]').type('invaliduser');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(401);
      expect(interception.response.body.error).to.eq('Invalid username or password');
    });

    cy.on('window:alert', (str) => {
      expect(str).to.equal('Error: Invalid username or password');
    });
  });
});