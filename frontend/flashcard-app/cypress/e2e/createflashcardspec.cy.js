describe('Create Flashcards Page', () => {
  beforeEach(() => {
    cy.login('testuser', 'password123').then(() => {
      cy.visit('/create');
    });
  });

  it('should display the create flashcard form', () => {
    cy.contains('Create Flashcard').should('be.visible');
  });

  it('should create a new flashcard set and then create a flashcard', () => {
    cy.get('input[name="setNewSetName"]').type('New Flashcard Set');
    cy.contains('Create Set').click();
    cy.contains('Flashcard set created successfully').should('be.visible');

    cy.get('select[name="flashcardSet"]').select('New Flashcard Set');

    cy.get('input[name="question"]').type('Sample Question');
    cy.get('input[name="answer"]').type('Sample Answer');
    cy.get('select[name="difficulty"]').select('MEDIUM');
    cy.contains('Create Flashcard').click();
    cy.contains('Flashcard created successfully').should('be.visible');
  });
});
