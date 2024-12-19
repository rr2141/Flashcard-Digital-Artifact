describe('Flashcard Component', () => {
  beforeEach(() => {

    cy.login('testuser', 'password123'); 
    cy.visit('/flashcard-set-page'); 
  });

  it('should display flashcards', () => {
    cy.contains('Loading flashcards...').should('not.exist');
    cy.get('.h-64').should('be.visible'); 
  });

  it('should navigate to the next and previous flashcards', () => {
    cy.get('button').contains('Next').click();
    cy.get('.h-64').should('contain.text', 'No Question').or('contain.text', 'No Answer');

    cy.get('button').contains('Previous').click();
    cy.get('.h-64').should('contain.text', 'No Question').or('contain.text', 'No Answer');
  });

  it('should flip the flashcard', () => {
    cy.get('.h-64').click();
    cy.get('.h-64').should('not.contain.text', 'No Question').or('contain.text', 'No Answer');
  });

  it('should edit a flashcard', () => {
    cy.get('button').contains('Edit').click();

    cy.get('input[type="text"]').eq(0).clear().type('Updated Question');
    cy.get('input[type="text"]').eq(1).clear().type('Updated Answer');

    cy.get('button').contains('Save').click();
    cy.get('.h-64').should('contain.text', 'Updated Question');
  });

  it('should delete a flashcard', () => {
    cy.get('button').contains('Delete').click();
    cy.on('window:confirm', () => true);
    cy.get('.h-64').should('not.contain.text', 'No Question').or('contain.text', 'No Answer');
  });

  it('should create a new flashcard', () => {
    cy.get('button').contains('Create Flashcard').click();

    cy.url().should('include', '/create');
    cy.get('input[name="question"]').type('New Question');
    cy.get('input[name="answer"]').type('New Answer');

    cy.get('button').contains('Save').click();

    cy.url().should('not.include', '/create');
    cy.get('.h-64').should('contain.text', 'New Question');
  });
});
