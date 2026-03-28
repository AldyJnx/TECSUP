let students = [
  {
  "id": 1,
  "name": "Aldy Montoya",
  "grade": 5,
  "age": 20,
  "email": "aldy.montoya@tecsup.edu.pe",
  "phone": "+51 987654321",
  "enrollmentNumber": "2025001",
  "course": "Diseño y Desarrollo de Software",
  "year": 3,
  "subjects": [
    "Algoritmos",
    "Bases de Datos",
    "Desarrollo de Aplicaciones Web Avanzadas"
  ],
  "gpa": 3.8,
  "status": "Activo",
  "admissionDate": "2024-03-01"
}
];

function getAll() {
  return students;
}

function getById(id) {
  return students.find(s => s.id === id);
}

function create(student) {
  // VALIDACIÓN
  if (!student.name || !student.email || !student.course || !student.phone) {
    return { error: "Faltan campos obligatorios" };
  }

  student.id = students.length + 1;
  students.push(student);
  return student;
}

function update(id, updateData) {
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updateData };
    return students[index];
  }
  return null;
}

function remove(id) {
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    return students.splice(index, 1)[0];
  }
  return null;
}

// NUEVOS MÉTODOS
function listByStatus(status) {
  return students.filter(s => s.status === status);
}

function listByGrade(gpa) {
  return students.filter(s => s.gpa >= gpa);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  listByStatus,
  listByGrade
};