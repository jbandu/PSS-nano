import express from 'express';
import { checkInController } from '../controllers/check-in.controller';
import { baggageController } from '../controllers/baggage.controller';
import { apisController } from '../controllers/apis.controller';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dcs-service', timestamp: new Date().toISOString() });
});

// Check-in routes
router.post('/check-in/start', checkInController.startCheckIn.bind(checkInController));
router.post(
  '/check-in/:transactionId/passenger',
  checkInController.checkInPassenger.bind(checkInController)
);
router.post(
  '/check-in/passenger/:passengerCheckInId/seat',
  checkInController.assignSeat.bind(checkInController)
);
router.post(
  '/check-in/:transactionId/complete',
  checkInController.completeCheckIn.bind(checkInController)
);
router.get('/check-in/search', checkInController.searchPassengers.bind(checkInController));

// Baggage routes
router.post('/baggage/tag', baggageController.issueBaggageTag.bind(baggageController));
router.get(
  '/baggage/tag/:tagNumber/pdf',
  baggageController.generateBagTagPDF.bind(baggageController)
);
router.put(
  '/baggage/tag/:tagNumber/status',
  baggageController.updateBaggageStatus.bind(baggageController)
);

// APIS routes
router.post('/apis/collect', apisController.collectAPISData.bind(apisController));
router.post('/apis/:apisDataId/submit', apisController.submitAPIS.bind(apisController));
router.post(
  '/apis/passenger/:passengerCheckInId/ocr',
  apisController.processOCRData.bind(apisController)
);

export default router;
