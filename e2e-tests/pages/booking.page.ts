/**
 * Page Object Model for Booking Flow
 *
 * Encapsulates booking page interactions and selectors.
 */

import { Page, Locator } from '@playwright/test';

export class BookingPage {
  readonly page: Page;

  // Search form elements
  readonly originInput: Locator;
  readonly destinationInput: Locator;
  readonly departureDateInput: Locator;
  readonly returnDateInput: Locator;
  readonly passengersSelect: Locator;
  readonly searchButton: Locator;

  // Flight selection elements
  readonly flightResults: Locator;
  readonly selectFlightButton: Locator;

  // Passenger information elements
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;

  // Payment elements
  readonly cardNumberInput: Locator;
  readonly expiryDateInput: Locator;
  readonly cvvInput: Locator;
  readonly submitPaymentButton: Locator;

  // Confirmation elements
  readonly confirmationMessage: Locator;
  readonly pnrText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Search form selectors
    this.originInput = page.locator('[data-testid="origin-input"]');
    this.destinationInput = page.locator('[data-testid="destination-input"]');
    this.departureDateInput = page.locator('[data-testid="departure-date-input"]');
    this.returnDateInput = page.locator('[data-testid="return-date-input"]');
    this.passengersSelect = page.locator('[data-testid="passengers-select"]');
    this.searchButton = page.locator('[data-testid="search-button"]');

    // Flight selection selectors
    this.flightResults = page.locator('[data-testid="flight-results"]');
    this.selectFlightButton = page.locator('[data-testid="select-flight-button"]').first();

    // Passenger info selectors
    this.firstNameInput = page.locator('[data-testid="first-name-input"]');
    this.lastNameInput = page.locator('[data-testid="last-name-input"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.phoneInput = page.locator('[data-testid="phone-input"]');

    // Payment selectors
    this.cardNumberInput = page.locator('[data-testid="card-number-input"]');
    this.expiryDateInput = page.locator('[data-testid="expiry-date-input"]');
    this.cvvInput = page.locator('[data-testid="cvv-input"]');
    this.submitPaymentButton = page.locator('[data-testid="submit-payment-button"]');

    // Confirmation selectors
    this.confirmationMessage = page.locator('[data-testid="confirmation-message"]');
    this.pnrText = page.locator('[data-testid="pnr"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    passengers: number = 1
  ) {
    await this.originInput.fill(origin);
    await this.destinationInput.fill(destination);
    await this.departureDateInput.fill(departureDate);
    await this.passengersSelect.selectOption(passengers.toString());
    await this.searchButton.click();
  }

  async selectFirstFlight() {
    await this.flightResults.waitFor({ state: 'visible' });
    await this.selectFlightButton.click();
  }

  async fillPassengerInfo(
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async fillPaymentInfo(cardNumber: string, expiry: string, cvv: string) {
    await this.cardNumberInput.fill(cardNumber);
    await this.expiryDateInput.fill(expiry);
    await this.cvvInput.fill(cvv);
    await this.submitPaymentButton.click();
  }

  async getConfirmationPNR(): Promise<string> {
    await this.confirmationMessage.waitFor({ state: 'visible' });
    return await this.pnrText.textContent() || '';
  }
}
