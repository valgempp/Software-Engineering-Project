// Lab 5 - JavaScript Practice

// 2.1 Variables and Data Types
console.log('\n--- Exercise 2.1 ---');

const hospitalName = 'Central Hospital';
let numberOfDoctors = 12;
let isOpen = true;

console.log(
  `Welcome to ${hospitalName}! We have ${numberOfDoctors} doctors currently available.`,
);

isOpen = false;
console.log(isOpen ? 'Hospital is open' : 'Hospital is closed');

// 2.2 Arrays and Loops
console.log('\n--- Exercise 2.2 ---');

const doctors = ['Dr. Lee', 'Dr. Khan', 'Dr. Smith', 'Dr. Martin', 'Dr. Brown'];

let index = 1;
for (const doctor of doctors) {
  console.log(`Doctor #${index}: ${doctor}`);
  index++;
}

doctors.push('Dr. Wilson');
numberOfDoctors = doctors.length;
console.log('Updated doctor count:', numberOfDoctors);

function findDoctor(name) {
  return doctors.includes(name) ? 'Doctor found' : 'Doctor not found';
}

console.log(findDoctor('Dr. Lee'));
console.log(findDoctor('Dr. Unknown'));

// 2.3 Objects and Nested Data
console.log('\n--- Exercise 2.3 ---');

const patient = {
  name: 'Alice Martin',
  age: 34,
  conditions: ['diabetes', 'hypertension'],
  doctor: {
    name: 'Dr. Lee',
    specialty: 'Cardiology',
  },
};

console.log('Doctor:', patient.doctor.name);
console.log('Number of conditions:', patient.conditions.length);
console.log(
  `${patient.name} is treated by ${patient.doctor.name} (${patient.doctor.specialty}).`,
);

patient.conditions.push('anxiety');
console.log('Updated patient:', patient);

// 2.4 Functions and Array Filtering
console.log('\n--- Exercise 2.4 ---');

const patients = [
  { id: 1, name: 'Alice', age: 34 },
  { id: 2, name: 'John', age: 45 },
  { id: 3, name: 'Marie', age: 29 },
];

function filterByAge(minAge) {
  return patients.filter((patient) => patient.age > minAge);
}

function addPatient(name, age) {
  const newPatient = {
    id: patients.length + 1,
    name,
    age,
  };
  patients.push(newPatient);
  return newPatient;
}

console.log('Patients older than 30:', filterByAge(30));
addPatient('David', 40);
console.log('Updated patients:', patients);

// 2.6 Error Handling and Validation
console.log('\n--- Exercise 2.6 ---');

function createAppointment(doctor, patient, date) {
  if (!doctor || !patient || !date) {
    throw new Error('Missing required fields');
  }

  return { doctor, patient, date };
}

try {
  console.log(createAppointment('Dr. Lee', 'Alice', '2026-11-04'));
  console.log(createAppointment('Dr. Lee'));
} catch (error) {
  console.error('Error:', error.message);
}

// 2.7 Asynchronous Code
console.log('\n--- Exercise 2.7 ---');

function getHospitalData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: 'Central Hospital', uptime: 1234 });
    }, 1000);
  });
}

async function showData() {
  console.log('Fetching hospital data...');
  const data = await getHospitalData();
  console.log('Data loaded:', data);
}

await showData();
