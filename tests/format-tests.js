var Apn = require('../index');

// Test formatter
console.log('Test Formatter');

// true
console.log("325938293", "->", Apn.format("325938293", "ca", "sonoma"));
console.log("325-938-293", "->" ,Apn.format("325-938-293", "California", "sonoma"));
console.log("325938293000000", "->" ,Apn.format("325938293000000", "CA", "Sonoma County"));
console.log("32593820", "->" ,Apn.format("32593820", "ca", "sonoma"));

console.log("N-0493-9502-4029", "->" ,Apn.format("N-0493-9502-4029", "ut", "iron"));
console.log("N-0493-9502-4029-65", "->" ,Apn.format("N-0493-9502-4029-65", "ut", "iron"));
console.log("N-0493-950B-4029", "->" ,Apn.format("N-0493-950B-4029", "ut", "iron"));
console.log("N-0493-9502-4029-655", "->" ,Apn.format("N-0493-9502-4029-655", "ut", "iron"));
console.log("N-0493-9502-4029", "->" ,Apn.format("N-0493-9502-4029", "ut", "iron"));

console.log("4-049N-95-402.43", "->" ,Apn.format("4-049N-95-402.43", "ms", "forrest"));
console.log("4-049 -95-402.43", "->" ,Apn.format("4-049 -95-402.43", "ms", "forrest"));

// false
console.log("123456789S", "->" ,Apn.format("123456789S", "ca", "sonoma"));
console.log("N23456789", "->" ,Apn.format("N23456789", "ca", "sonoma"));