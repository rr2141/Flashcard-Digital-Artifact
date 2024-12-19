describe('Flashcard Sets Page', () => {
  beforeEach(() => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/my-flashcards');
    });
  });

  it('should display flashcard sets', () => {
    cy.contains('Flashcard Sets').should('be.visible');
  });

  it('should create a new flashcard set', () => {
    cy.contains('Add Set +').click();
    cy.get('input[type="text"]').type('New Flashcard Set');
    cy.get('button').contains('Create').click();
    cy.contains('New Flashcard Set', { timeout: 10000 }).should('be.visible');
  });

  it('should view a flashcard set', () => {
    cy.contains('New Flashcard Set', { timeout: 10000 })
      .closest('li')
      .find('button')
      .contains('View')
      .click();
  });

  it('should add a comment to a flashcard set', () => {
    cy.contains('New Flashcard Set', { timeout: 10000 })
      .closest('li')
      .find('button')
      .contains('Comment')
      .click();

    cy.get('.flex.space-x-1.mt-1 button') 
      .eq(3) 
      .click();

    cy.get('textarea').type('This is a test comment');

    cy.get('button').contains('Add Comment').should('not.be.disabled').click();
  });

  it('should delete a flashcard set', () => {
    cy.contains('New Flashcard Set', { timeout: 10000 })
      .closest('li')
      .find('button')
      .contains('Delete')
      .click();

    cy.on('window:confirm', () => true);
    cy.contains('New Flashcard Set', { timeout: 10000 }).should('not.exist');
  });
});
