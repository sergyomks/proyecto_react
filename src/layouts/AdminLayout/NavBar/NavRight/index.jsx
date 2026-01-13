import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListGroup, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatRole } from '../../../../utils/formatters';

const NavRight = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto">
        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown align="end" className="drp-user">
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="feather icon-user" style={{ fontSize: '20px' }} />
              <span className="ms-2 d-none d-md-inline">{user?.name || 'Usuario'}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <div className="pro-head bg-primary">
                <span className="text-white">{user?.name || 'Usuario'}</span>
                <p className="mb-0 text-white-50 small">{user?.role ? formatRole(user.role) : ''}</p>
              </div>
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="/users" className="dropdown-item">
                    <i className="feather icon-users me-2" /> Usuarios
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={handleLogout}>
                    <i className="feather icon-log-out me-2" /> Cerrar Sesión
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>
    </React.Fragment>
  );
};

export default NavRight;
