const calculateRefund = (totalPrice, checkInDate) => {
  const daysUntilCheckIn = Math.ceil((new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24));
  let refundPercent = 0, message = '', timeline = '';

  if (daysUntilCheckIn > 7) {
    refundPercent = 90;
    message = 'Full refund (90%)';
    timeline = 'Cancelled more than 7 days before check-in';
  } else if (daysUntilCheckIn >= 3) {
    refundPercent = 50;
    message = 'Partial refund (50%)';
    timeline = 'Cancelled 3–7 days before check-in';
  } else {
    refundPercent = 0;
    message = 'No refund';
    timeline = 'Cancelled less than 3 days before check-in';
  }

  return {
    refundPercent,
    refundAmount: Math.round((totalPrice * refundPercent) / 100),
    daysUntilCheckIn,
    message,
    timeline,
  };
};

<<<<<<< HEAD
module.exports = calculateRefund;
=======
module.exports = calculateRefund;
>>>>>>> 5bbf7a6 (add utils)
