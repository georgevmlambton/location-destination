import { Link } from 'react-router-dom';

export function Register() {
  return (
    <div
      style={{
        backgroundColor: '#FFFFF',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="row justify-content-center w-100 mx-3">
        <div className="col text-center">
          <div className="d-flex align-items-center justify-content-center mb-5">
            <div
              className="bg-secondary rounded-circle"
              style={{ width: '60px', height: '60px' }}
            ></div>
            <h1 className="ms-3">EcoRide</h1>
          </div>
          <form className="mt-4 text-start">
            <div className="mb-3">
              <label htmlFor="email" className="form-label ms-2 fs-5">
                Email
              </label>
              <input
                type="email"
                className="form-control rounded-pill py-2 fs-5"
                id="email"
                placeholder="Enter your email"
                style={{ borderColor: '#929292' }}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label ms-2 fs-5">
                Password
              </label>
              <input
                type="password"
                className="form-control rounded-pill py-2 fs-5"
                id="password"
                placeholder="Enter your password"
                style={{ borderColor: '#929292' }}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="verify-password" className="form-label ms-2 fs-5">
                Verify Password
              </label>
              <input
                type="password"
                className="form-control rounded-pill py-2 fs-5"
                id="verify-password"
                placeholder="Verify your password"
                style={{ borderColor: '#929292' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-success rounded-pill w-100 py-2 mt-5 fs-4"
              style={{ backgroundColor: '#00634B', border: 'none' }}
            >
              Register
            </button>
          </form>
          <Link to="/login" className="d-block mt-3 text-center">
            Already have an account? Click here to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
