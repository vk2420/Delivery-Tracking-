// Sample PDF content generator for testing
// This creates a sample trip sheet content that can be used to test the PDF parser

const sampleTripSheetContent = `
DELIVERY TRIP SHEET
Date: 2024-01-15
Driver: John Doe
Truck: TRK001
Start Time: 08:00
End Time: 17:00

DELIVERY 1
Customer: ABC Company
Address: 123 Main Street, Downtown, New York
Phone: +1987654321
Invoice: INV001
Items: Office Supplies (5 boxes), Electronics (2 units)

DELIVERY 2
Customer: XYZ Corporation
Address: 456 Oak Avenue, Midtown, New York
Phone: +1987654323
Invoice: INV002
Items: Furniture (1 set)

DELIVERY 3
Customer: Tech Solutions Inc
Address: 789 Pine Street, Uptown, New York
Phone: +1987654324
Invoice: INV003
Items: Software Licenses (10 licenses)

END OF TRIP SHEET
`;

console.log('Sample Trip Sheet Content:');
console.log('='.repeat(50));
console.log(sampleTripSheetContent);
console.log('='.repeat(50));
console.log('\nThis content can be saved as a PDF file for testing the upload functionality.');

module.exports = { sampleTripSheetContent };
