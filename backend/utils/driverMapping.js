// Driver ID to Name Mapping
// This file contains the mapping between driver IDs and their actual names

const driverMapping = {
  // Driver ID: Driver Name
  "110717": "Mohd Adam",
  "8645": "TARIQ",
  "101144": "Mohammed Ali Palicho",
  "2564967962": "Abubakar Nadar khan",
  "2576736645": "Saiful Islam",
  "43262": "Sirjudeen",
  "2399925334": "KHAWAR SHA RAJAB",
  "2555164702": "Javid Hasan Ghulam Faisal",
  "2570166815": "Samar Iqbal",
  "2466532492": "Hamid ur Rahman",
  "2509508053": "Muhammad Iqbal",
  "118769": "Prasanna Ajith",
  "2398845202": "Badaruddin Rajab",
  "2430967139": "Muhammad Nadeem",
  "2592185090": "Netra Bahadur",
  "2566704561": "SAIFUULAH ASGHAR KHAN",
  "2557554158": "IQBAL AHAMD",
  "2528924836": "Sakhawat Ali",
  "2509044844": "Naveed Anjum Rab Maloom",
  "2526916065": "Waseem",
  "33046": "SAJU",
  "7164": "KADAR",
  "2412021897": "Jahir",
  "110715": "Ahmed Ali",
  "2430097564": "mehar ali",
  "2566576449": "Sana Ullah",
  "2469238592": "Waseem Abbas faisal",
  "2590230468": "INAYAT ULLAH",
  "30663": "Saifudeen",
  "2473514335": "Nisar Mantaj",
  "7191": "Mohammed Sohail",
  "2581899206": "Said Rehman",
  "2612147948": "Aziz Ullah",
  "2201279664": "Anwar",
  "88089": "AMAR",
  "2548458807": "Sher Rahman",
  "2592422022": "Sajjawal Hussain",
  "2549749188": "Osama Noor Malik Ali Hussain",
  "2575441395": "Anas Khan",
  "2535861468": "MD Umer MD Tufail",
  "2301002313": "Said ali",
  "2486963636": "Imtiaz Anwar Khan",
  "304600": "Isarar Ahmed",
  "7234949": "Zuber Khan",
  "94471": "MOORTHY",
  "2202751034": "Ali Julhash",
  "2269357915": "ANWAR ULLAH Sherin",
  "5663": "HARIS",
  "2564165732": "HUSSAIN",
  "2531002026": "Bakth Ullah",
  "2306722659": "Ahsan Ulhaq",
  "2556448443": "Abdul Wahab Faisal",
  "2529301265": "SHAH ZEB SARDAR ALAM",
  "121830": "Riyas Moh",
  "2589952924": "FAZAL SUBHAN",
  "2486135821": "MUHAMMAD REHMAN",
  "2297575132": "Perwaish Kabir Khan",
  "120915": "Naba Raj",
  "7247242": "Arslan Javed Malik Javed Iqbal Ghasiq",
  "400402": "Bawadi",
  "2525430225": "MD- RAMZAN",
  "2318150022": "Zahid",
  "2548143722": "Amin Taj",
  "2399805288": "Yaqoob Abdul Malik",
  "2542143249": "Dilshad",
  "2508423684": "Md Anwar",
  "2599056807": "Mohd Kaif",
  "2595930260": "Kashif Khan",
  "2539299129": "Tanveer Faisal",
  "2093215271": "mohammed shahid ullah",
  "2540392244": "Naseem Ahmad",
  "2558018954": "haroon ahamd faizal",
  "2587637659": "Adnan Khan",
  "2527437871": "Luqman Amin",
  "2596789822": "Tahil Khan",
  "2596789699": "Mujassim Ali",
  "2351042706": "Gul Zameen",
  "2611751146": "Yousef Khan",
  "2408618623": "Liyakat Ali",
  "2494590991": "Ajibor rahman",
  "2333400378": "Mohammad Yaseen",
  "2520424009": "Saif Wazir",
  "2344304320": "Muhammad Anwar manzoor hussain",
  "2479429124": "Syed Haider S. Hussain",
  "2308183587": "SULAIMAN",
  "2409100274": "Qamar Hafeez",
  "2554682977": "Zahidullah",
  "2526127861": "Muhd Asghar Ghulam",
  "2373306758": "Shahbaz Bahadar Faisal",
  "2596789525": "Zishan Ali",
  "2478147941": "AYAZ ALI",
  "2565082977": "Ahsan Razzaq",
  "2509044612": "Kamran Hussain",
  "2587133104": "Aftab Hussain Altaf Hussain",
  "2553507167": "SOHAIL GHULAM FAISAL",
  "2560981991": "Zeeshan Abbas",
  "2574630162": "Usman khadim",
  "2517100174": "Payal",
  "2593332675": "Zubair Ullah",
  "2532482094": "Danish Adrees",
  "2511269454": "Zahid Ghulam Faisal",
  "2329650333": "Mohd Mohsin",
  "2420251288": "Ismail",
  "2547889903": "Zuhaib Hasan",
  "7234770": "Raju Shashtra"
};

/**
 * Get driver name by ID
 * @param {string} driverId - The driver ID to look up
 * @returns {string} - The driver name or the ID if not found
 */
const getDriverName = (driverId) => {
  if (!driverId) return 'Unknown Driver';
  
  // Clean the driver ID (remove any extra spaces or characters)
  const cleanId = driverId.toString().trim();
  
  // Return the mapped name or the original ID if not found
  return driverMapping[cleanId] || cleanId;
};

/**
 * Get all driver mappings
 * @returns {Object} - The complete driver mapping object
 */
const getAllDriverMappings = () => {
  return driverMapping;
};

/**
 * Add a new driver mapping
 * @param {string} driverId - The driver ID
 * @param {string} driverName - The driver name
 */
const addDriverMapping = (driverId, driverName) => {
  if (driverId && driverName) {
    driverMapping[driverId] = driverName;
  }
};

/**
 * Search for driver by name (partial match)
 * @param {string} searchTerm - The search term
 * @returns {Array} - Array of matching drivers [{id, name}]
 */
const searchDriverByName = (searchTerm) => {
  if (!searchTerm) return [];
  
  const results = [];
  const searchLower = searchTerm.toLowerCase();
  
  for (const [id, name] of Object.entries(driverMapping)) {
    if (name.toLowerCase().includes(searchLower)) {
      results.push({ id, name });
    }
  }
  
  return results;
};

module.exports = {
  getDriverName,
  getAllDriverMappings,
  addDriverMapping,
  searchDriverByName,
  driverMapping
};
