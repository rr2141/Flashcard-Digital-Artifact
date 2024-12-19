describe('Sign Up Page', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should display the sign-up form', () => {
    cy.contains('Sign up for an account').should('be.visible');
  });

  it('should sign up a new user and navigate to sign-in page', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/users`, {
      statusCode: 201,
      body: {
        message: 'User created successfully',
      },
    }).as('signupRequest');

    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirm-password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@signupRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
    });

    cy.on('window:alert', (str) => {
      expect(str).to.equal('Sign up successful! Please log in.');
    });

    cy.url().should('include', '/');
  });

  it('should display an error message if passwords do not match', () => {
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirm-password"]').type('password456');
    cy.get('button[type="submit"]').click();

    cy.on('window:alert', (str) => {
      expect(str).to.equal('Passwords do not match');
    });
  });

  it('should display an error message if required fields are missing', () => {
    cy.get('button[type="submit"]').click();

    cy.on('window:alert', (str) => {
      expect(str).to.equal('All fields are required');
    });
  });

  it('should display an error message if the username already exists', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/users`, {
      statusCode: 409,
      body: {
        error: 'Username already exists',
      },
    }).as('signupRequest');

    cy.get('input[name="username"]').type('testuser2');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirm-password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@signupRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(409);
    });

    cy.on('window:alert', (str) => {
      expect(str).to.equal('Error: Username already exists');
    });
  });
});