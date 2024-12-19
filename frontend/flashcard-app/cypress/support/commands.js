Cypress.Commands.add('login', (username, password) => {
    cy.request('POST', `${Cypress.env('apiUrl')}/api/users/login`, {
      username,
      password,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const { token, user } = response.body;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    });
  });