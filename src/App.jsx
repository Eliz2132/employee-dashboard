import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

const emptyForm = {
  name: '',
  designation: '',
  location: '',
  salary: '',
};

function DashboardPage({ employees, loading, error }) {
  if (loading) {
    return (
      <div className="card shadow-sm border-0 custom-card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0 text-muted">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 custom-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="mb-0">Employee Dashboard</h2>
          <span className="badge bg-primary rounded-pill">{employees.length} employees</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No employee records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmployeeFormPage({
  formData,
  handleInputChange,
  handleSubmit,
  formError,
  successMessage,
}) {
  return (
    <div className="card shadow-sm border-0 custom-card">
      <div className="card-body">
        <h2 className="mb-4">Employee Form</h2>

        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter employee name"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="designation" className="form-label">Designation</label>
              <input
                id="designation"
                type="text"
                className="form-control"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Enter designation"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                id="location"
                type="text"
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="salary" className="form-label">Salary</label>
              <input
                id="salary"
                type="number"
                className="form-control"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Enter salary"
              />
            </div>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary px-4">
              Save Employee
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setFormData(emptyForm)}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        if (!response.ok) {
          throw new Error('Unable to fetch employee data.');
        }

        const data = await response.json();

        const formattedData = data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }));

        setEmployees(formattedData);
      } catch (error) {
        setApiError('Unable to load employee data from the API.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDesignation = formData.designation.trim();
    const trimmedLocation = formData.location.trim();
    const salaryValue = Number(formData.salary);

    if (!trimmedName || !trimmedDesignation || !trimmedLocation || !salaryValue) {
      setFormError('Please complete all fields before submitting.');
      setSuccessMessage('');
      return;
    }

    setEmployees((previous) => [
      {
        id: previous.length ? Math.max(...previous.map((employee) => employee.id)) + 1 : 1,
        name: trimmedName,
        email: `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      },
      ...previous,
    ]);

    setFormData(emptyForm);
    setFormError('');
    setSuccessMessage('Employee added successfully.');
  };

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">Employee Portal</span>

          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/employee-form"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Employee Form
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-lg-5">
        <Routes>
          <Route
            path="/"
            element={<DashboardPage employees={employees} loading={loading} error={apiError} />}
          />
          <Route
            path="/employee-form"
            element={
              <EmployeeFormPage
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                formError={formError}
                successMessage={successMessage}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
