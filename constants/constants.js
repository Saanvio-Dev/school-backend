// constants.js

// Fee Status Constants
const FeeStatus = {
    PAID: 'PAID',
    PARTIAL: 'PARTIAL',
    UNPAID: 'UNPAID',
  };
  
  // Payment Method Constants
  const PaymentMethod = {
    CASH: 'CASH',
    CHEQUE: 'CHEQUE',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    ONLINE: 'ONLINE',
  };
  
  // Export constants for use in other files
  module.exports = { FeeStatus, PaymentMethod };
  