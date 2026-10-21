export type Language = 'en' | 'hi';

export const translations = {
  en: {
    appName: 'GlowBook',
    appTagline: 'Orders · Appointments · Cashbook',
    dashboard: 'Home',
    incomeExpense: 'Cashbook',
    orders: 'Orders',
    
    // Quick Stats
    todayIncome: "Today's Income",
    todayExpense: "Today's Expense",
    todayProfit: "Today's Profit",
    monthIncome: "This Month's Income",
    monthExpense: "This Month's Expense",
    monthProfit: "This Month's Profit",
    upcomingOrders: 'Upcoming Bookings',
    pendingBalance: 'Pending Balance Due',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    netProfit: 'Net Profit',
    
    // Quick Actions
    addIncome: '+ Add Income',
    addExpense: '+ Add Expense',
    addOrder: '+ New Booking',
    quickActions: 'Quick Actions',
    
    // Filters
    filterToday: 'Today',
    filterMonth: 'This Month',
    filterYear: 'This Year',
    filterAll: 'All Time',
    filterPickDate: 'Pick Date',
    filterCustom: 'Date Range',
    selectedDate: 'Selected Date',
    showingDateRecords: 'Showing records for',
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    allTypes: 'All (Income & Expense)',
    incomeOnly: 'Income Only',
    expenseOnly: 'Expense Only',
    searchCustomer: 'Search customer name or phone...',
    
    // Order fields
    customerName: 'Customer Name',
    phoneNumber: 'Phone Number (Optional)',
    serviceType: 'Service / Event Type',
    appointmentDate: 'Appointment Date',
    appointmentTime: 'Appointment Time',
    appointmentTimes: 'Appointment Time(s)',
    timePerDate: 'Time for each date',
    bookingDates: 'Booking Dates',
    dateFrom: 'From',
    dateTo: 'To',
    addTimeSlot: 'Add time',
    pricePerVisit: 'Price per visit (₹)',
    willCreateBookings: 'Will create {count} bookings',
    saveBookings: 'Save {count} bookings',
    advanceOnFirstOnly: 'Advance is applied to the first booking only.',
    totalPrice: 'Total Price (₹)',
    advanceAmount: 'Advance Received (₹)',
    remainingBalance: 'Remaining Balance (₹)',
    notes: 'Optional Notes',
    status: 'Status',
    statusUpcoming: 'Upcoming',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    
    // Actions & Buttons
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    collectPayment: 'Record Payment',
    callNow: 'Call',
    whatsapp: 'WhatsApp',
    exportCsv: 'Export CSV',
    close: 'Close',
    viewDetails: 'View Details',
    
    // Income Categories
    catBridalMakeup: 'Bridal Makeup',
    catPartyMakeup: 'Party Makeup',
    catHairstyling: 'Hairstyling',
    catFacial: 'Facial & Cleanup',
    catSareeDraping: 'Saree Draping',
    catOtherIncome: 'Other Service',
    
    // Expense Categories
    catProducts: 'Cosmetics & Products',
    catTravel: 'Travel & Transport',
    catEquipment: 'Equipment & Tools',
    catRent: 'Shop / Parlor Rent',
    catOtherExpense: 'Other Expense',
    
    // Transaction fields
    type: 'Type',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount (₹)',
    category: 'Category',
    date: 'Date',
    optionalNote: 'Note (Optional)',
    
    // Alerts & Confirmations
    confirmDeleteTx: 'Are you sure you want to delete this transaction?',
    confirmDeleteOrder: 'Are you sure you want to delete this booking?',
    confirmDeleteDesc: 'This action cannot be undone.',
    deleteSuccess: 'Deleted successfully',
    savedSuccess: 'Saved successfully',
    paymentSuccess: 'Payment recorded successfully',
    
    // Empty states
    noTransactionsFound: 'No transactions recorded for this period.',
    noOrdersFound: 'No appointments found for this period.',
    addFirstTx: 'Tap "Add Income" or "Add Expense" to record your first transaction.',
    addFirstOrder: 'Tap "New Booking" to schedule a customer appointment.',
    noUpcomingToday: 'No appointments scheduled for today. Have a peaceful day!',
    
    // Payment rules & note
    incomeRuleNote: 'Only money actually received is counted as income.',
    balanceDue: 'Balance Due',
    fullyPaid: 'Fully Paid',
    advanceReceivedBadge: 'Advance Paid',
    
    // System & Database status
    connectedDb: 'Cloud Sync Active',
    localMode: 'Device Storage Mode',
    
    // Collect payment modal
    recordRemainingTitle: 'Record Balance Payment',
    balanceToCollect: 'Outstanding balance for',
    amountPayingNow: 'Amount Received Now (₹)',
    paymentDate: 'Payment Date',
    paymentNote: 'Payment Note',
    markOrderCompleted: 'Mark booking as Completed once fully paid',
    
    // Language toggle
    langToggle: 'हिन्दी',
    langName: 'English',
  },
  hi: {
    appName: 'GlowBook',
    appTagline: 'ऑर्डर · बुकिंग · खाता',
    dashboard: 'होम',
    incomeExpense: 'खाता',
    orders: 'ऑर्डर्स',
    
    // Quick Stats
    todayIncome: 'आज की आमदनी',
    todayExpense: 'आज का खर्चा',
    todayProfit: 'आज का शुद्ध मुनाफा',
    monthIncome: 'इस महीने की आमदनी',
    monthExpense: 'इस महीने का खर्चा',
    monthProfit: 'इस महीने का मुनाफा',
    upcomingOrders: 'आने वाली बुकिंग्स',
    pendingBalance: 'ग्राहकों पर बाकी बकाया',
    totalIncome: 'कुल आमदनी',
    totalExpense: 'कुल खर्चा',
    netProfit: 'शुद्ध मुनाफा',
    
    // Quick Actions
    addIncome: '+ आमदनी जोड़ें',
    addExpense: '+ खर्चा जोड़ें',
    addOrder: '+ नया ऑर्डर जोड़ें',
    quickActions: 'त्वरित कार्य',
    
    // Filters
    filterToday: 'आज',
    filterMonth: 'इस महीने',
    filterYear: 'इस साल',
    filterAll: 'सभी समय',
    filterPickDate: 'तारीख चुनें',
    filterCustom: 'तारीख रेंज',
    selectedDate: 'चुनी गई तारीख',
    showingDateRecords: 'इस तारीख का रिकॉर्ड:',
    allCategories: 'सभी केटेगरी',
    allStatuses: 'सभी स्टेटस',
    allTypes: 'सभी (आय और खर्च)',
    incomeOnly: 'केवल आमदनी',
    expenseOnly: 'केवल खर्चा',
    searchCustomer: 'ग्राहक का नाम या फोन खोजें...',
    
    // Order fields
    customerName: 'ग्राहक का नाम',
    phoneNumber: 'फ़ोन नंबर (वैकल्पिक)',
    serviceType: 'काम / सेवा का नाम',
    appointmentDate: 'तारीख',
    appointmentTime: 'समय',
    appointmentTimes: 'समय (एक या अधिक)',
    timePerDate: 'हर तारीख का समय',
    bookingDates: 'बुकिंग की तारीखें',
    dateFrom: 'शुरू',
    dateTo: 'अंत',
    addTimeSlot: 'समय जोड़ें',
    pricePerVisit: 'प्रति विज़िट रकम (₹)',
    willCreateBookings: '{count} बुकिंग बनेंगी',
    saveBookings: '{count} बुकिंग सेव करें',
    advanceOnFirstOnly: 'एडवांस केवल पहली बुकिंग पर लगेगा।',
    totalPrice: 'कुल रकम (₹)',
    advanceAmount: 'एडवांस मिला (₹)',
    remainingBalance: 'बाकी बचा (₹)',
    notes: 'नोट / खास बातें (वैकल्पिक)',
    status: 'स्थिति',
    statusUpcoming: 'आगामी',
    statusCompleted: 'पूरा हुआ',
    statusCancelled: 'रद्द',
    
    // Actions & Buttons
    save: 'सुरक्षित करें',
    saving: 'सेव हो रहा है...',
    cancel: 'रद्द करें',
    edit: 'बदलें',
    delete: 'हटाएं',
    collectPayment: 'भुगतान प्राप्त करें',
    callNow: 'कॉल करें',
    whatsapp: 'व्हाट्सएप',
    exportCsv: 'CSV डाउनलोड करें',
    close: 'बंद करें',
    viewDetails: 'विवरण देखें',
    
    // Income Categories
    catBridalMakeup: 'दुल्हन मेकअप (Bridal Makeup)',
    catPartyMakeup: 'पार्टी मेकअप (Party Makeup)',
    catHairstyling: 'हेयर स्टाइलिंग (Hairstyling)',
    catFacial: 'फेशियल और क्लीनअप (Facial)',
    catSareeDraping: 'साड़ी ड्रेपिंग (Saree Draping)',
    catOtherIncome: 'अन्य सेवा (Other Service)',
    
    // Expense Categories
    catProducts: 'मेकअप व कॉस्मेटिक सामान (Products)',
    catTravel: 'यात्रा व गाड़ी किराया (Travel)',
    catEquipment: 'उपकरण व टूल्स (Equipment)',
    catRent: 'दुकान / पार्लर किराया (Rent)',
    catOtherExpense: 'अन्य खर्च (Other Expense)',
    
    // Transaction fields
    type: 'प्रकार',
    income: 'आमदनी (Income)',
    expense: 'खर्चा (Expense)',
    amount: 'रकम (₹)',
    category: 'केटेगरी',
    date: 'तारीख',
    optionalNote: 'नोट / विवरण (वैकल्पिक)',
    
    // Alerts & Confirmations
    confirmDeleteTx: 'क्या आप वाकई इस लेन-देन को हटाना चाहते हैं?',
    confirmDeleteOrder: 'क्या आप वाकई इस बुकिंग को हटाना चाहते हैं?',
    confirmDeleteDesc: 'हटाने के बाद इसे वापस नहीं लाया जा सकता।',
    deleteSuccess: 'सफलतापूर्वक हटा दिया गया',
    savedSuccess: 'सफलतापूर्वक सुरक्षित किया गया',
    paymentSuccess: 'भुगतान सफलतापूर्वक दर्ज किया गया',
    
    // Empty states
    noTransactionsFound: 'इस अवधि के लिए कोई लेन-देन नहीं मिला।',
    noOrdersFound: 'इस अवधि के लिए कोई बुकिंग नहीं मिली।',
    addFirstTx: '"आमदनी जोड़ें" या "खर्चा जोड़ें" बटन दबाकर एंट्री शुरू करें।',
    addFirstOrder: '"नया ऑर्डर जोड़ें" बटन दबाकर ग्राहक की बुकिंग नोट करें।',
    noUpcomingToday: 'आज के लिए कोई बुकिंग नहीं है। आपका दिन शुभ हो!',
    
    // Payment rules & note
    incomeRuleNote: 'केवल वही पैसा आमदनी में गिना जाता है जो असल में मिल चुका है।',
    balanceDue: 'बाकी बकाया',
    fullyPaid: 'पूरा भुगतान हो गया',
    advanceReceivedBadge: 'एडवांस मिला',
    
    // System & Database status
    connectedDb: 'क्लाउड सिंक एक्टिव',
    localMode: 'डिवाइस स्टोरेज मोड',
    
    // Collect payment modal
    recordRemainingTitle: 'बाकी रकम का भुगतान दर्ज करें',
    balanceToCollect: 'का बाकी बकाया',
    amountPayingNow: 'अभी मिली रकम (₹)',
    paymentDate: 'भुगतान की तारीख',
    paymentNote: 'भुगतान का विवरण',
    markOrderCompleted: 'पूरा पैसा मिलने पर बुकिंग को "पूरा हुआ" मार्क करें',
    
    // Language toggle
    langToggle: 'English',
    langName: 'हिन्दी',
  }
};

export const INCOME_CATEGORIES = [
  'Bridal Makeup',
  'Party Makeup',
  'Hairstyling',
  'Facial & Cleanup',
  'Saree Draping',
  'Other Service',
] as const;

export const EXPENSE_CATEGORIES = [
  'Cosmetics & Products',
  'Travel & Transport',
  'Equipment & Tools',
  'Shop / Parlor Rent',
  'Other Expense',
] as const;
